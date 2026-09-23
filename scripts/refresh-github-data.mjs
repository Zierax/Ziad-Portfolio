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
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDES_PATH = join(ROOT, "src", "data", "github-overrides.json");
const SNAPSHOT_PATH = join(ROOT, "src", "data", "generated", "github-snapshot.json");

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const HEADERS = {
  "User-Agent": "ziad-portfolio-refresh-script",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

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

async function ghJson(url, { timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
    if (!res.ok) {
      const err = new Error(`GitHub API ${res.status} for ${url}`);
      err.status = res.status;
      throw err;
    }
    return { data: await res.json(), headers: res.headers };
  } finally {
    clearTimeout(t);
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

async function fetchReadme(owner, name) {
  try {
    const { data } = await ghJson(`https://api.github.com/repos/${owner}/${name}/readme`, { timeoutMs: 15000 });
    if (!data.content) return null;
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch {
    return null; // README missing or fetch failed — never fatal
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

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = await fn(items[idx]);
      } catch {
        results[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
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
  console.log(`Snapshot re-tiered (no API calls): ${SNAPSHOT_PATH}`);
  console.log(`  data from: ${old.refreshedAt} · curation applied: ${nowIso}`);
  console.log(`  tiers: flagship=${flagship.length} spotlight=${spotlight.length} signal=${signal.length} recent=${recent.length} archive=${archive.length}`);
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
  if (budget !== null && budget < MIN_API_BUDGET) {
    throw new Error(
      `insufficient GitHub API budget (remaining=${budget}, need>=${MIN_API_BUDGET}). ` +
        `Set GITHUB_TOKEN or wait for reset. Old snapshot kept.`
    );
  }

  const [{ data: zierax }, { data: div36 }] = await Promise.all([
    ghJson("https://api.github.com/users/Zierax"),
    ghJson("https://api.github.com/orgs/Division-36"),
  ]);
  const [zieraxRepos, div36Repos, starredTabCount] = await Promise.all([
    fetchAllRepos("Zierax", false),
    fetchAllRepos("Division-36", true),
    fetchStarredTabCount().catch(() => null),
  ]);

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
  await pool(readmeKeys, 4, async (key) => {
    const [owner, ...rest] = key.split("/");
    const text = await fetchReadme(owner, rest.join("/"));
    if (text) readmeTexts.set(key, text);
  });
  console.log(`  readmes: ${readmeTexts.size}/${readmeKeys.length} fetched`);
  const profileReadmeText = await fetchReadme("Zierax", "Zierax");
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
    // failed this run (see failed[]). UI copy never depends on this.
    readmeFetch: {
      requested: readmeKeys.length,
      fetched: readmeTexts.size,
      failed: readmeKeys.filter((k) => !readmeTexts.has(k)).sort(),
    },
  };

  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + "\n");

  console.log(`Snapshot written: ${SNAPSHOT_PATH}`);
  console.log(`  refreshedAt: ${nowIso}`);
  console.log(`  owned repos ranked: ${ranked.length} (+${forked.length} forks tracked, +${snapshot.excluded.hidden.length} hidden, +${thirdParty.length} third-party quarantined)`);
  console.log(`  tiers: flagship=${flagship.length} spotlight=${spotlight.length} signal=${signal.length} recent=${recent.length} archive=${archive.length}`);
  console.log(`  stars: Zierax=${snapshot.totals.zieraxOwnedRepoStars} Division-36=${snapshot.totals.division36OwnedRepoStars} combined=${snapshot.totals.combinedOwnedRepoStars}`);
}

try {
  await main();
} catch (err) {
  if (existsSync(SNAPSHOT_PATH)) {
    console.error(`GitHub refresh failed (${err.message}). Keeping last known snapshot.`);
    process.exit(1);
  }
  console.error(`GitHub refresh failed and no snapshot exists: ${err.message}`);
  process.exit(1);
}
