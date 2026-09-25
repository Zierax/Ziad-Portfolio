#!/usr/bin/env node
/**
 * refresh-github-data.mjs — GitHub-powered portfolio data pipeline.
 *
 * Usage:
 *   node scripts/refresh-github-data.mjs              # full refresh from GitHub API
 *   node scripts/refresh-github-data.mjs --retier-only # re-apply curation, zero API calls
 *   npm run refresh:github                            # full refresh
 *   npm run retier:github                             # curation experiments (pins, copy, lanes)
 *
 * Curation workflow (no API budget needed):
 *   1. Edit src/data/github-overrides.json (PIN_ORDER, SPOTLIGHT, HIDE, COPY, ...).
 *   2. Run `npm run retier:github` — instant, offline, backups to *.bak.
 *   3. Rebuild to preview. Weekly GitHub Action does the full fresh run.
 *
 * What it does:
 *   1. Fetches public profile data for Zierax + Division-36.
 *   2. Fetches all public repos for both (owned + org, forks tracked separately).
 *   3. Fetches the profile "Stars" tab count (distinct from owned repo stars).
 *   4. Fetches README text for key repos and extracts concise signals
 *      (never raw dumps — summaries/highlights only, with source links).
 *   5. Scores every repo with a documented feature function, applies the
 *      curated overrides in src/data/github-overrides.json, assigns tiers
 *      (flagship / signal / recent / archive).
 *   6. Writes src/data/generated/github-snapshot.json deterministically.
 *
 * Failure policy: if the GitHub API is unreachable and a snapshot already
 * exists, the old snapshot is kept untouched and the script exits non-zero
 * with a clear message. The site always builds from the last known snapshot.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDES_PATH = join(ROOT, "src", "data", "github-overrides.json");
const SNAPSHOT_PATH = join(ROOT, "src", "data", "generated", "github-snapshot.json");

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const HEADERS = {
  "User-Agent": "ziad-portfolio-refresh-script",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

// ---------------------------------------------------------------------------
// Logging: timestamped, leveled, dependency-free.
// LOG_LEVEL=debug|info|warn|error, or --verbose / --quiet flags.
// ---------------------------------------------------------------------------
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = (process.env.LOG_LEVEL || (process.argv.includes("--verbose") ? "debug" : "info")).toLowerCase();
const QUIET = process.argv.includes("--quiet");
const RESOLVED_LEVEL = LOG_LEVELS[LOG_LEVEL] ?? LOG_LEVELS.info;

function log(level, msg) {
  if (LOG_LEVELS[level] < RESOLVED_LEVEL) return;
  if (QUIET && level !== "error") return;
  const stream = level === "error" || level === "warn" ? process.stderr : process.stdout;
  stream.write(`[${new Date().toISOString()}] ${level.toUpperCase().padEnd(5, " ")} ${msg}\n`);
}

const logger = {
  debug: (m) => log("debug", m),
  info: (m) => log("info", m),
  warn: (m) => log("warn", m),
  error: (m) => log("error", m),
};

function phase(name) {
  const t0 = Date.now();
  logger.info(`-- ${name}`);
  return () => logger.debug(`   ${name} done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

// ---------------------------------------------------------------------------
// Errors: typed so callers can tell "missing" (fine) from "rate-limited"
// (abort) from "transient" (retry).
// ---------------------------------------------------------------------------
class HttpError extends Error {
  constructor(status, url, detail = "") {
    super(`GitHub API ${status} for ${url}${detail ? `: ${detail}` : ""}`);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

class RateLimitError extends HttpError {
  constructor(url, resetEpochSec) {
    super(403, url, "rate limit exhausted");
    this.name = "RateLimitError";
    this.resetEpochSec = resetEpochSec;
  }

  get retryAfterSec() {
    if (!this.resetEpochSec) return null;
    return Math.max(0, Math.round(this.resetEpochSec - Date.now() / 1000));
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"));
const PIN_ORDER = overrides.PIN_ORDER;
const SPOTLIGHT = overrides.SPOTLIGHT || [];
const HIDE = new Set(overrides.HIDE);
const COPY = overrides.COPY;
const DOMAIN_BOOST = overrides.DOMAIN_BOOST;
const MENTIONS = overrides.MENTIONS;

const mentionsByRepo = new Map();
for (const m of MENTIONS) {
  if (!mentionsByRepo.has(m.repo)) mentionsByRepo.set(m.repo, []);
  mentionsByRepo.get(m.repo).push(m);
}

/**
 * Only these owners are portfolio evidence. A repo owned by anyone else
 * (e.g. a 67-star tool by another account that Zierax merely forked) is
 * quarantined into excluded.thirdParty — UNLESS a human explicitly pins it
 * in PIN_ORDER, which counts as taking responsibility for the claim.
 */
const TRUSTED_OWNERS = new Set(["Zierax", "Division-36"]);
const PINNED = new Set(PIN_ORDER);

/** Snapshot schema version — bump when the JSON shape changes. */
const SCHEMA_VERSION = 2;

/** Human-readable ranking contract, embedded in every snapshot. */
const METHOD = {
  formula: "score = stars×2 + forks×3 + recency(≤30d:+15 ≤90d:+8 ≤180d:+4 ≤365d:+2) + org(Division-36:+12) + domainBoost + readme(>8k:+10 >3k:+6 >800:+3, benchmark-table:+4) + mentions×12 − archived(−50) − weak-name(−40) − sketchy(−60) − tiny-stale(−25)",
  lanes: {
    flagship: "human-pinned PIN_ORDER, fixed order, small by design",
    spotlight: "curated research/product set, ordered by score desc",
    signal: "strict score order over the remainder, floor stars≥2 or score≥20, top 10, sketchy/archived excluded",
    recent: "activity feed: 6 most recently updated substantive repos (stars>0 or README or mentions or boost), lane overlap expected and labeled",
    archive: "everything else, score order — stubs, experiments, older utilities",
  },
  excluded: "forks of others' work (tracked, not ranked), profile-config repos, duplicate/typo repos, third-party repos unless human-pinned",
};

/** Repos that may only ever appear in the archive tier (never flagship/signal). */
const SKETCHY_PATTERNS = [
  /instacracker/i, /lnk-payload/i, /windows-activator/i, /reverse-shell/i,
  /exploit-rce/i, /forgery-site/i, /brute/i, /phish/i,
];

/** Weak/noisy repos: down-ranked hard, archive tier at best. */
const WEAK_PATTERNS = [
  ...SKETCHY_PATTERNS,
  /forgery/i, /prank/i, /turtle/i, /bread-generator/i, /gym-manag/i,
  /i-like-u/i, /react-basic/i, /reload-site-template/i, /my-resume/i,
  /mr-zierax/i, /zierax-website/i, /node\.js-server-template/i,
  /download-from-youtube/i, /password-manager/i, /sencrypt/i,
  /research-xspo/i, /js-testing-examples/i, /lol-game-ml/i,
  /clickjacking-poc/i, /cors-poc/i, /xss-poc/i, /xss-ultimate/i,
  /thefetcher/i, /proxy-auto-updater/i, /bread/i,
];

/** Minimum API budget needed for a complete refresh (listings + READMEs). */
const MIN_API_BUDGET = 45;

async function checkRateBudget() {
  try {
    const { data } = await ghJson("https://api.github.com/rate_limit", { timeoutMs: 10000 });
    return data.resources.core.remaining;
  } catch {
    return null; // unknown — let the caller decide
  }
}

/**
 * GET with timeout, parsed errors, and retries for transient failures.
 * Never retries 4xx (missing/forbidden are answers, not blips); 403 with an
 * exhausted budget throws RateLimitError immediately so the run aborts
 * instead of recording false "missing" data.
 */
async function ghJson(url, { timeoutMs = 20000, retries = 2 } = {}) {
  let attempt = 0;
  for (;;) {
    attempt++;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
      if (res.status === 404) {
        throw new HttpError(404, url);
      }
      if (res.status === 403 || res.status === 429) {
        const remaining = res.headers.get("x-ratelimit-remaining");
        if (remaining === "0") {
          const reset = Number(res.headers.get("x-ratelimit-reset") || 0) || null;
          throw new RateLimitError(url, reset);
        }
        throw new HttpError(res.status, url, await safeBody(res));
      }
      if (res.status >= 500 && attempt <= retries) {
        logger.warn(`retry ${attempt}/${retries} after HTTP ${res.status}: ${url}`);
        await sleep(1000 * 2 ** (attempt - 1) + Math.random() * 500);
        continue;
      }
      if (!res.ok) {
        throw new HttpError(res.status, url, await safeBody(res));
      }
      return { data: await res.json(), headers: res.headers };
    } catch (err) {
      if (err instanceof HttpError || err instanceof RateLimitError) throw err;
      // Network error / timeout: retry, then give up with context.
      const transient = err?.name === "AbortError" || err instanceof TypeError;
      if (transient && attempt <= retries) {
        logger.warn(`retry ${attempt}/${retries} after ${err?.name || "error"}: ${url}`);
        await sleep(1000 * 2 ** (attempt - 1) + Math.random() * 500);
        continue;
      }
      throw new Error(`fetch failed for ${url}: ${err?.message || err}`, { cause: err });
    } finally {
      clearTimeout(t);
    }
  }
}

async function safeBody(res) {
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return String(json.message || text).slice(0, 160);
    } catch {
      return text.slice(0, 160);
    }
  } catch {
    return "";
  }
}

async function fetchAllRepos(owner, isOrg) {
  const base = isOrg
    ? `https://api.github.com/orgs/${owner}/repos`
    : `https://api.github.com/users/${owner}/repos`;
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const { data } = await ghJson(`${base}?per_page=100&page=${page}&type=all&sort=full_name`);
    out.push(...data);
    if (data.length < 100) break;
  }
  return out;
}

async function fetchStarredTabCount() {
  // The profile "Stars" tab count is not in the user object; derive it from
  // pagination of /starred (per_page=1 -> last page number == count).
  const { headers } = await ghJson("https://api.github.com/users/Zierax/starred?per_page=1");
  const link = headers.get("link") || "";
  const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return m ? Number(m[1]) : null;
}

/**
 * README fetch with classified outcomes. 404 (no README) is a normal,
 * expected result — not an error. Anything else that survives retries is
 * recorded with its reason; rate-limit exhaustion propagates so the run
 * aborts instead of writing false present:false entries.
 */
async function fetchReadmeOutcome(owner, name) {
  const key = `${owner}/${name}`;
  try {
    const { data } = await ghJson(`https://api.github.com/repos/${owner}/${name}/readme`, { timeoutMs: 15000 });
    if (!data.content) return { key, outcome: "missing", reason: "empty readme payload" };
    return { key, outcome: "ok", text: Buffer.from(data.content, "base64").toString("utf8") };
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      return { key, outcome: "missing", reason: "404" };
    }
    throw err;
  }
}

function cleanMarkdownInline(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`~#>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** First H1/H2 or bold lead line, cleaned. */
function extractTitle(text) {
  const m = text.match(/^#{1,2}\s+(.+)$/m);
  if (m) return cleanMarkdownInline(m[1]).slice(0, 120);
  return "";
}

/** First substantial prose paragraph (skips badges, images, tables, headers). */
function extractSummary(text, maxLen = 280) {
  const lines = text.split("\n");
  const paras = [];
  let buf = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (buf.length) paras.push(buf.join(" "));
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (buf.length) paras.push(buf.join(" "));
  for (const p of paras) {
    const t = p.trim();
    if (t.length < 60) continue;
    if (/^\s*[#!<|]/.test(t)) continue;
    if (/!\[.*\]\(.*\)/.test(t) && t.length < 200) continue;
    if (/shields\.io|img\.shields|badge/i.test(t)) continue;
    const cleaned = cleanMarkdownInline(t);
    if (cleaned.length < 60) continue;
    if (/^(installation|prerequisites|usage|features|license|legal)\b/i.test(cleaned)) continue;
    return cleaned.slice(0, maxLen);
  }
  return "";
}

/** Up to 3 concise metric/evidence lines: table rows or bullets with numbers. */
function extractHighlights(text) {
  const out = [];
  for (const rawLine of text.split("\n")) {
    if (out.length >= 3) break;
    const line = rawLine.trim();
    if (!/^\||^[-*]\s/.test(line)) continue;
    if (/^[-| :]+$/.test(line)) continue;
    if (/:---/.test(line)) continue;
    if (!/\d/.test(line)) continue;
    if (/shields\.io|img\.shields/i.test(line)) continue;
    const cleaned = cleanMarkdownInline(line).replace(/^\|\s*/, "").slice(0, 160).trim();
    if (cleaned.length < 15) continue;
    out.push(cleaned);
  }
  return out;
}

/** Mine the Zierax/Zierax profile README "Best of" table for per-repo metrics. */
function extractProfileHighlights(text) {
  const out = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) continue;
    if (/:---/.test(line)) continue;
    const urlMatch = line.match(/https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/);
    if (!urlMatch) continue;
    const cells = line.split("|").map((c) => cleanMarkdownInline(c));
    // | System | Objective | Performance Metric | Status | Audit |
    const metric = cells[3] || "";
    if (!metric || metric.toLowerCase().includes("performance")) continue;
    out.push({ repo: urlMatch[1], metric: metric.slice(0, 160) });
  }
  return out;
}

function daysSince(iso, now) {
  return (now - new Date(iso).getTime()) / 86400000;
}

function isSketchy(key) {
  return SKETCHY_PATTERNS.some((re) => re.test(key));
}

function isWeak(key) {
  return WEAK_PATTERNS.some((re) => re.test(key));
}

function scoreRepo(r, key, readmeText, mentionCount, now) {
  let score = 0;
  const reasons = [];
  const starPts = r.stargazers_count * 2;
  const forkPts = r.forks_count * 3;
  score += starPts + forkPts;
  if (starPts) reasons.push(`stars×2=${starPts}`);
  if (forkPts) reasons.push(`forks×3=${forkPts}`);

  const age = daysSince(r.updated_at, now);
  if (age <= 30) { score += 15; reasons.push("recency+15"); }
  else if (age <= 90) { score += 8; reasons.push("recency+8"); }
  else if (age <= 180) { score += 4; reasons.push("recency+4"); }
  else if (age <= 365) { score += 2; reasons.push("recency+2"); }

  if (r.owner.login === "Division-36") { score += 12; reasons.push("org+12"); }

  const boost = DOMAIN_BOOST[key] || 0;
  if (boost) { score += boost; reasons.push(`domain+${boost}`); }

  if (readmeText) {
    if (readmeText.length > 8000) { score += 10; reasons.push("readme+10"); }
    else if (readmeText.length > 3000) { score += 6; reasons.push("readme+6"); }
    else if (readmeText.length > 800) { score += 3; reasons.push("readme+3"); }
    if (/\|.*\|/.test(readmeText) && /(%|accuracy|ns\b|µs|KB|benchmark)/i.test(readmeText)) {
      score += 4; reasons.push("benchmark-table+4");
    }
  }

  if (mentionCount) {
    const pts = mentionCount * 12;
    score += pts; reasons.push(`mentions×${mentionCount}+${pts}`);
  }

  if (r.archived) { score -= 50; reasons.push("archived−50"); }
  if (isWeak(key)) {
    const pen = isSketchy(key) ? -60 : -40;
    score += pen;
    reasons.push(`weak-name${pen}`);
  }
  if (r.stargazers_count === 0 && age > 365 && !boost && (!readmeText || readmeText.length < 800)) {
    score -= 25; reasons.push("tiny-stale−25");
  }
  return { score, reasons };
}

/**
 * Display fields for one repo: human copy first, README extracts second,
 * raw API description last. Pure function of (api data + readme extracts +
 * current overrides) so both the full refresh and --retier-only share it.
 */
function resolveDisplay({ key, apiDescription, language, topics, stars, forks, readmeSummary, readmeHighlightList, profileMetric }) {
  const copy = COPY[key] || {};
  const summary =
    copy.summary || readmeSummary || (apiDescription || "").trim() || "Public repository — see README on GitHub.";
  const tags =
    copy.tags ||
    [language, ...(topics || []).slice(0, 3)].filter(Boolean).filter((t, idx, arr) => arr.indexOf(t) === idx).slice(0, 4);
  const highlights =
    copy.highlights ||
    (readmeHighlightList.length ? readmeHighlightList.join(" · ").slice(0, 300) : "") ||
    (profileMetric ? `Profile README reports: ${profileMetric}` : "") ||
    `${stars} stars / ${forks} forks`;
  return {
    summary: summary.slice(0, 400),
    highlights: highlights.slice(0, 400),
    tags,
    label: copy.label || null,
    // Editorial voice. Rendered separately from measured evidence so
    // readers can tell curation apart from data.
    story: copy.story ? copy.story.slice(0, 220) : null,
  };
}

/**
 * Tier assignment. Curation decides lane membership (PIN_ORDER, SPOTLIGHT);
 * scores decide order inside every lane except flagship. Returns the lanes
 * and stamps r.tier on each ranked entry.
 */
function assignTiers(ranked) {
  for (const r of ranked) r.tier = "archive";
  const byScore = [...ranked].sort(
    (a, b) => b.score - a.score || b.stars - a.stars || (a.key < b.key ? -1 : 1)
  );
  const assigned = new Set();

  // Tier 1 — flagship: human-pinned, fixed order. Small by design.
  const flagship = [];
  for (const key of PIN_ORDER) {
    const repo = ranked.find((r) => r.key === key);
    if (repo && !isSketchy(key)) {
      repo.tier = "flagship";
      flagship.push(repo);
      assigned.add(key);
    }
  }

  // Tier 2 — spotlight: curated research/product lane. Important regardless
  // of stars, but ordered by score so the strongest evidence leads.
  const spotlight = SPOTLIGHT.map((k) => ranked.find((r) => r.key === k))
    .filter((r) => r && !assigned.has(r.key) && !isSketchy(r.key))
    .sort((a, b) => b.score - a.score || b.stars - a.stars || (a.key < b.key ? -1 : 1));
  for (const r of spotlight) {
    r.tier = "spotlight";
    assigned.add(r.key);
  }

  // Tier 3 — signal: strict merit order over everything else. No curation
  // override can reorder this lane; curation only decides lane membership.
  // Floor keeps the long tail of 0–1 star stubs out of the stream.
  const SIGNAL_TARGET = 10;
  const signal = [];
  for (const r of byScore) {
    if (signal.length >= SIGNAL_TARGET) break;
    if (assigned.has(r.key) || isSketchy(r.key) || r.archived) continue;
    if (!(r.stars >= 2 || r.score >= 20)) continue;
    r.tier = "signal";
    signal.push(r);
    assigned.add(r.key);
  }

  // Tier 4 — recent: an activity feed, not an exclusive lane. The 6 most
  // recently updated substantive repos, wherever they live. Overlap with
  // flagship/spotlight/signal is expected (GitHub profiles do the same with
  // pinned repos + contribution activity) and the UI labels each row's lane.
  const RECENT_CUTOFF = new Date("2026-08-01T00:00:00Z").getTime();
  const isSubstantive = (r) =>
    r.stars > 0 || r.readme.present || r.mentions.length > 0 || (DOMAIN_BOOST[r.key] || 0) > 0;
  const recent = [...ranked]
    .filter((r) => !r.archived && !isSketchy(r.key) && isSubstantive(r) &&
      new Date(r.updatedAt).getTime() >= RECENT_CUTOFF)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  const archive = ranked
    .filter((r) => !assigned.has(r.key))
    .sort((a, b) => b.score - a.score);

  return { flagship, spotlight, signal, recent, archive };
}

/**
 * --retier-only: re-apply current overrides + tiers to the last snapshot
 * with zero API calls. Scores and API facts are preserved byte-for-byte;
 * only display fields (summary/highlights/tags/label/story) and lane
 * membership are recomputed. The snapshot keeps the original refreshedAt
 * (when the API data was fetched) and gains retieredAt.
 */
function retierOnly(nowIso) {
  if (!existsSync(SNAPSHOT_PATH)) {
    throw new Error("no snapshot to retier — run a full refresh first.");
  }
  const old = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  const profileMetricByRepo = new Map((old.profileReadme?.highlights || []).map((h) => [h.repo, h.metric]));

  const ranked = old.ranked.map((r) => {
    const display = resolveDisplay({
      key: r.key,
      apiDescription: r.apiDescription,
      language: r.language,
      topics: r.topics,
      stars: r.stars,
      forks: r.forks,
      readmeSummary: r.readme?.summary || "",
      readmeHighlightList: r.readme?.highlights || [],
      profileMetric: profileMetricByRepo.get(r.key) || "",
    });
    return {
      ...r,
      summary: display.summary,
      highlights: display.highlights,
      tags: display.tags,
      label: display.label,
      story: display.story,
      mentions: mentionsByRepo.get(r.key) || [],
    };
  });

  const { flagship, spotlight, signal, recent, archive } = assignTiers(ranked);

  // Totals are API facts (they include hidden-owned repos); preserved exactly.
  // Method is code, not data — always refresh it to the current contract.
  const snapshot = {
    ...old,
    retieredAt: nowIso,
    schemaVersion: SCHEMA_VERSION,
    method: METHOD,
    tiers: {
      flagship: flagship.map((r) => r.key),
      spotlight: spotlight.map((r) => r.key),
      signal: signal.map((r) => r.key),
      recent: recent.map((r) => r.key),
      archive: archive.map((r) => r.key),
    },
    ranked,
  };

  // Backup before overwrite so a retier bug can never destroy the only copy.
  copyFileSync(SNAPSHOT_PATH, `${SNAPSHOT_PATH}.bak`);
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + "\n");
  logger.info(`snapshot re-tiered (no API calls): ${SNAPSHOT_PATH}`);
  logger.info(`data from: ${old.refreshedAt} · curation applied: ${nowIso}`);
  logger.info(`tiers: flagship=${flagship.length} spotlight=${spotlight.length} signal=${signal.length} recent=${recent.length} archive=${archive.length}`);
}

async function main() {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // Curation-experiment mode: re-apply overrides + tiers to the last snapshot
  // with zero API calls. Scores and API facts are preserved untouched; only
  // display fields and lane membership are recomputed.
  if (process.argv.includes("--retier-only")) {
    retierOnly(nowIso);
    return;
  }

  // Fail-safe: never start a refresh we cannot finish. A partial run would
  // silently mark repos as readme-less and corrupt tier quality.
  const budget = await checkRateBudget();
  if (budget === null) {
    logger.warn("rate-limit budget unknown (rate_limit check failed) — proceeding, may abort mid-run");
  } else {
    logger.info(`API budget: ${budget} remaining (need >= ${MIN_API_BUDGET})${TOKEN ? " [authenticated]" : " [anonymous]"}`);
  }
  if (budget !== null && budget < MIN_API_BUDGET) {
    throw new Error(
      `insufficient GitHub API budget (remaining=${budget}, need>=${MIN_API_BUDGET}). ` +
        `Set GITHUB_TOKEN or wait for reset. Old snapshot kept.`
    );
  }

  const doneProfiles = phase("profiles");
  const [{ data: zierax }, { data: div36 }] = await Promise.all([
    ghJson("https://api.github.com/users/Zierax"),
    ghJson("https://api.github.com/orgs/Division-36"),
  ]);
  doneProfiles();

  const doneListings = phase("repo listings");
  const [zieraxRepos, div36Repos, starredTabCount] = await Promise.all([
    fetchAllRepos("Zierax", false),
    fetchAllRepos("Division-36", true),
    fetchStarredTabCount().catch((err) => {
      logger.warn(`Stars-tab count unavailable (${err?.message}) — recording null, not zero`);
      return null;
    }),
  ]);
  doneListings();
  logger.info(`listings: ${zieraxRepos.length} Zierax + ${div36Repos.length} Division-36 repos`);

  const allRepos = [...zieraxRepos, ...div36Repos];
  const byKey = new Map(allRepos.map((r) => [`${r.owner.login}/${r.name}`, r]));

  // Forks of other people's work are not portfolio evidence: track, don't rank.
  const forked = allRepos.filter((r) => r.fork);
  const owned = allRepos.filter((r) => !r.fork);
  // Owned-star totals count only trusted owners (third-party repos are
  // quarantined below and must never inflate portfolio metrics).
  const trustedOwned = owned.filter(
    (r) => TRUSTED_OWNERS.has(r.owner.login) || PINNED.has(`${r.owner.login}/${r.name}`)
  );

  const sum = (arr, f) => arr.reduce((s, r) => s + f(r), 0);
  const zOwned = trustedOwned.filter((r) => r.owner.login === "Zierax");
  const dOwned = trustedOwned.filter((r) => r.owner.login === "Division-36");

  // README candidate set: pinned + spotlight + top-by-stars + profile README.
  const topByStars = [...trustedOwned]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 12)
    .map((r) => `${r.owner.login}/${r.name}`);
  const readmeKeys = [...new Set([...PIN_ORDER, ...SPOTLIGHT, ...topByStars])]
    .filter((k) => byKey.has(k) && !HIDE.has(k));

  const readmeTexts = new Map();
  const readmeMissing = [];
  const readmeFailed = [];
  const CONCURRENCY = 4;
  for (let i = 0; i < readmeKeys.length; i += CONCURRENCY) {
    const batch = readmeKeys.slice(i, i + CONCURRENCY);
    const outcomes = await Promise.all(
      batch.map(async (key) => {
        const [owner, ...rest] = key.split("/");
        try {
          return await fetchReadmeOutcome(owner, rest.join("/"));
        } catch (err) {
          return { key, outcome: "error", reason: err?.message || String(err), error: err };
        }
      })
    );
    for (const o of outcomes) {
      if (o.outcome === "ok" && o.text) readmeTexts.set(o.key, o.text);
      else if (o.outcome === "missing") readmeMissing.push(`${o.key} (${o.reason})`);
      else readmeFailed.push(o);
    }
    logger.debug(`readmes ${Math.min(i + CONCURRENCY, readmeKeys.length)}/${readmeKeys.length}`);
  }
  // Systemic failures (rate limit) abort the whole run — a partial README
  // set would silently demote repos. Isolated failures are recorded.
  const rateLimited = readmeFailed.find((f) => f.error instanceof RateLimitError);
  if (rateLimited) throw rateLimited.error;
  for (const f of readmeFailed) logger.warn(`readme failed for ${f.key}: ${f.reason}`);
  logger.info(`readmes: ${readmeTexts.size} fetched, ${readmeMissing.length} absent, ${readmeFailed.length} failed`);

  let profileReadmeText = null;
  try {
    const outcome = await fetchReadmeOutcome("Zierax", "Zierax");
    profileReadmeText = outcome.outcome === "ok" ? outcome.text : null;
    if (!profileReadmeText) logger.warn(`profile README unavailable (${outcome.reason}) — highlights skipped`);
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    logger.warn(`profile README fetch failed (${err?.message}) — highlights skipped`);
  }
  const profileHighlights = profileReadmeText ? extractProfileHighlights(profileReadmeText) : [];
  const profileMetricByRepo = new Map(profileHighlights.map((h) => [h.repo, h.metric]));

  const ranked = [];
  // Observable quarantine: every non-trusted repo seen in the listings,
  // recorded even though it is excluded from ranking and totals.
  const thirdParty = owned
    .filter((r) => !TRUSTED_OWNERS.has(r.owner.login) && !PINNED.has(`${r.owner.login}/${r.name}`))
    .map((r) => `${r.owner.login}/${r.name}`)
    .sort();
  for (const r of trustedOwned) {
    const key = `${r.owner.login}/${r.name}`;
    if (HIDE.has(key)) continue;
    if (!TRUSTED_OWNERS.has(r.owner.login) && !PINNED.has(key)) {
      thirdParty.push(key);
      continue;
    }
    const text = readmeTexts.get(key) || null;
    const mentions = mentionsByRepo.get(key) || [];
    const { score, reasons } = scoreRepo(r, key, text, mentions.length, now);

    const copy = COPY[key] || {};
    const readmeSummary = text ? extractSummary(text) : "";
    const readmeHighlightList = text ? extractHighlights(text) : [];
    const display = resolveDisplay({
      key,
      apiDescription: (r.description || "").trim(),
      language: r.language,
      topics: r.topics || [],
      stars: r.stargazers_count,
      forks: r.forks_count,
      readmeSummary,
      readmeHighlightList,
      profileMetric: profileMetricByRepo.get(key) || "",
    });

    ranked.push({
      key,
      owner: r.owner.login,
      name: r.name,
      // Human-readable display name for unwieldy repo names (overrides COPY.label).
      label: display.label,
      license: r.license ? r.license.spdx_id || r.license.key || null : null,
      url: r.html_url,
      apiDescription: (r.description || "").trim(),
      language: r.language,
      topics: (r.topics || []).slice(0, 6),
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
      createdAt: r.created_at,
      archived: Boolean(r.archived),
      score,
      scoreReasons: reasons,
      summary: display.summary,
      highlights: display.highlights,
      // Editorial voice (overrides COPY.story). Rendered separately from
      // measured evidence so readers can tell curation apart from data.
      story: display.story,
      tags: display.tags,
      mentions,
      readme: text
        ? {
            present: true,
            url: `https://github.com/${key}#readme`,
            summary: readmeSummary.slice(0, 280),
            highlights: readmeHighlightList,
          }
        : { present: false, url: `https://github.com/${key}#readme`, summary: "", highlights: [] },
      tier: "archive", // assigned below
    });
  }

  const { flagship, spotlight, signal, recent, archive } = assignTiers(ranked);

  const snapshot = {
    refreshedAt: nowIso,
    source: "github-api",
    schemaVersion: SCHEMA_VERSION,
    method: METHOD,
    profiles: {
      zierax: {
        login: zierax.login,
        htmlUrl: zierax.html_url,
        publicRepos: zierax.public_repos,
        followers: zierax.followers,
        following: zierax.following,
        location: zierax.location,
        company: zierax.company,
        blog: zierax.blog,
        avatarUrl: "https://github.com/Zierax.png",
      },
      division36: {
        login: div36.login,
        htmlUrl: "https://github.com/Division-36",
        publicRepos: div36.public_repos,
        followers: div36.followers,
        description: div36.description,
      },
      // The profile "Stars" tab (repos the user starred) — NOT owned stars.
      starredTabCount,
    },
    totals: {
      zieraxOwnedRepoStars: sum(zOwned, (r) => r.stargazers_count),
      zieraxOwnedRepoForks: sum(zOwned, (r) => r.forks_count),
      zieraxOwnedRepoCount: zOwned.length,
      division36OwnedRepoStars: sum(dOwned, (r) => r.stargazers_count),
      division36OwnedRepoForks: sum(dOwned, (r) => r.forks_count),
      division36OwnedRepoCount: dOwned.length,
      combinedOwnedRepoStars: sum(trustedOwned, (r) => r.stargazers_count),
      combinedOwnedRepoForks: sum(trustedOwned, (r) => r.forks_count),
    },
    tiers: {
      flagship: flagship.map((r) => r.key),
      spotlight: spotlight.map((r) => r.key),
      signal: signal.map((r) => r.key),
      recent: recent.map((r) => r.key),
      archive: archive.map((r) => r.key),
    },
    ranked,
    excluded: {
      hidden: [...HIDE].filter((k) => byKey.has(k)),
      thirdParty,
      forks: {
        count: forked.length,
        names: forked.map((r) => `${r.owner.login}/${r.name}`).sort(),
      },
    },
    profileReadme: {
      url: "https://github.com/Zierax/Zierax",
      highlights: profileHighlights,
    },
    // Observable fetch quality: which READMEs were requested vs obtained.
    // A repo with present=false genuinely lacks a README, or its fetch
    // failed this run (see failed[] with reasons). UI copy never depends on this.
    readmeFetch: {
      requested: readmeKeys.length,
      fetched: readmeTexts.size,
      failed: readmeKeys.filter((k) => !readmeTexts.has(k)).sort(),
      failures: readmeFailed.map((f) => ({ key: f.key, reason: f.reason })),
    },
  };

  // Write guards: never persist an empty or flagship-less snapshot. Either
  // means the API returned something unexpected (rename, outage, shape
  // change) and the old snapshot is more truthful than this run.
  if (ranked.length === 0) {
    throw new Error("refusing to write empty snapshot (0 ranked repos) — old snapshot kept.");
  }
  if (flagship.length === 0) {
    logger.warn("flagship lane resolved empty — pins may be stale, writing anyway with warn flag");
    snapshot.warnings = ["flagship empty: PIN_ORDER keys did not match any ranked repo"];
  }

  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + "\n");

  logger.info(`snapshot written: ${SNAPSHOT_PATH}`);
  logger.info(`refreshedAt: ${nowIso}`);
  logger.info(`ranked ${ranked.length} owned repos (+${forked.length} forks tracked, +${snapshot.excluded.hidden.length} hidden, +${thirdParty.length} quarantined)`);
  logger.info(`tiers: flagship=${flagship.length} spotlight=${spotlight.length} signal=${signal.length} recent=${recent.length} archive=${archive.length}`);
  logger.info(`stars: Zierax=${snapshot.totals.zieraxOwnedRepoStars} Division-36=${snapshot.totals.division36OwnedRepoStars} combined=${snapshot.totals.combinedOwnedRepoStars}`);
}

/**
 * Exit codes: 0 ok · 1 API/refresh failure (old snapshot kept) ·
 * 2 usage/config error (nothing was fetched, nothing to keep).
 *
 * --self-test runs the offline unit suite (no GitHub calls) instead of main.
 */
const invokedAsScript = (() => {
  try {
    return !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
})();

if (invokedAsScript) {
  if (process.argv.includes("--self-test")) {
    await runSelfTest();
  } else {
    try {
      await main();
    } catch (err) {
      const usageError = /no snapshot to retier|insufficient GitHub API budget/i.test(err?.message || "");
      if (existsSync(SNAPSHOT_PATH) && !usageError) {
        logger.error(`refresh failed (${err?.message}). Old snapshot kept.`);
        process.exit(1);
      }
      if (existsSync(SNAPSHOT_PATH)) {
        logger.error(`refresh aborted before fetching (${err?.message}). Old snapshot kept.`);
        process.exit(2);
      }
      logger.error(`refresh failed and no snapshot exists: ${err?.message}`);
      if (process.env.LOG_LEVEL === "debug" || process.argv.includes("--verbose")) logger.error(String(err?.stack || err));
      process.exit(1);
    }
  }
}

/**
 * Offline self-test: flaky/local HTTP server for retry + error
 * classification, plus pure-function checks. No GitHub traffic.
 */
async function runSelfTest() {
  const { default: http } = await import("node:http");
  let failures = 0;
  const check = (name, cond, extra = "") => {
    if (cond) logger.info(`PASS ${name}`);
    else {
      failures++;
      logger.error(`FAIL ${name} ${extra}`);
    }
  };

  const hits = { flaky: 0, missing: 0 };
  const server = http.createServer((req, res) => {
    if (req.url === "/flaky") {
      hits.flaky++;
      if (hits.flaky < 3) {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end("boom");
      } else {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      }
    } else if (req.url === "/missing") {
      hits.missing++;
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
    } else if (req.url === "/limited") {
      res.writeHead(403, {
        "content-type": "application/json",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(Math.round(Date.now() / 1000) + 60),
      });
      res.end(JSON.stringify({ message: "API rate limit exceeded" }));
    } else if (req.url === "/forbidden") {
      res.writeHead(403, { "content-type": "application/json", "x-ratelimit-remaining": "59" });
      res.end(JSON.stringify({ message: "Resource not accessible" }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  // 1. Transient 500s are retried, then succeed.
  const r1 = await ghJson(`${base}/flaky`, { timeoutMs: 5000, retries: 3 });
  check("retry-then-success", r1.data?.ok === true && hits.flaky === 3, `hits=${hits.flaky}`);

  // 2. 404 throws HttpError immediately (exactly one hit = no retry).
  try {
    await ghJson(`${base}/missing`, { timeoutMs: 5000 });
    check("404-throws", false);
  } catch (err) {
    check("404-throws", err instanceof HttpError && err.status === 404 && hits.missing === 1, `hits=${hits.missing}`);
  }

  // 3. Exhausted budget throws RateLimitError with retry hint.
  try {
    await ghJson(`${base}/limited`, { timeoutMs: 5000 });
    check("rate-limit-throws", false);
  } catch (err) {
    check(
      "rate-limit-throws",
      err instanceof RateLimitError && typeof err.retryAfterSec === "number" && err.retryAfterSec <= 60,
      String(err?.message)
    );
  }

  // 4. Non-budget 403 is a plain HttpError (answer, not retryable signal).
  try {
    await ghJson(`${base}/forbidden`, { timeoutMs: 5000 });
    check("403-plain", false);
  } catch (err) {
    check("403-plain", err instanceof HttpError && !(err instanceof RateLimitError) && err.status === 403);
  }

  // 5. resolveDisplay prefers human copy, falls back honestly.
  const d = resolveDisplay({
    key: "Zierax/Grafana-Final-Scanner",
    apiDescription: "api desc",
    language: "Python",
    topics: ["a", "b"],
    stars: 1,
    forks: 0,
    readmeSummary: "readme summary",
    readmeHighlightList: ["h1"],
    profileMetric: "",
  });
  check("copy-precedence", d.summary.startsWith("Practical Grafana scanner") && d.tags.includes("Grafana"));
  const d2 = resolveDisplay({
    key: "Zierax/Nope-Unknown",
    apiDescription: "",
    language: null,
    topics: [],
    stars: 0,
    forks: 0,
    readmeSummary: "",
    readmeHighlightList: [],
    profileMetric: "",
  });
  check("empty-fallback", d2.summary.includes("see README on GitHub") && d2.tags.length === 0);

  // 6. assignTiers: pins first, sketchy never in signal.
  const fake = (key, stars, updatedAt) => ({
    key, owner: key.split("/")[0], name: key.split("/")[1], stars, forks: 0,
    updatedAt, archived: false, score: stars * 2, scoreReasons: [],
    readme: { present: false }, mentions: [],
  });
  const lanes = assignTiers([
    fake("Evil/instaCracker-clone", 50, "2026-09-01T00:00:00Z"),
    fake("Zierax/Grafana-Final-Scanner", 244, "2026-09-18T00:00:00Z"),
    fake("Zierax/G-dorks", 25, "2026-09-13T00:00:00Z"),
  ]);
  check("flagship-pin", lanes.flagship[0]?.key === "Zierax/Grafana-Final-Scanner");
  check(
    "sketchy-quarantined",
    !lanes.signal.some((r) => /insta/i.test(r.key)) && lanes.signal.some((r) => r.key === "Zierax/G-dorks")
  );

  server.close();
  if (failures > 0) {
    logger.error(`self-test: ${failures} failure(s)`);
    process.exit(1);
  }
  logger.info("self-test: all passed");
}
