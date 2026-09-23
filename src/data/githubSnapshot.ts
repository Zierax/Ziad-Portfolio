/**
 * Typed view over the generated GitHub snapshot.
 *
 * Single source of truth for all GitHub-derived portfolio data:
 *   src/data/generated/github-snapshot.json  (written by scripts/refresh-github-data.mjs)
 *
 * The frontend never calls the GitHub API at runtime — it reads this
 * build-time snapshot, so the site renders even if GitHub is down and never
 * hammers the API on every page view.
 */
import snapshotJson from "./generated/github-snapshot.json";

export type RepoTier = "flagship" | "spotlight" | "signal" | "recent" | "archive";

export type MentionConfidence = "high" | "medium" | "low";
export type MentionSourceType = "editorial" | "aggregator" | "reference" | "trending" | "mirror";

export interface SnapshotMention {
  outlet: string;
  title: string;
  detail: string;
  url: string;
  repo: string;
  confidence: MentionConfidence;
  sourceType: MentionSourceType;
  linkCheck: string;
}

export interface ReadmeSignals {
  present: boolean;
  url: string;
  summary: string;
  highlights: string[];
}

export interface RankedRepo {
  key: string;
  owner: string;
  name: string;
  /** Human-readable display name when the repo name is unwieldy; null otherwise. */
  label: string | null;
  /** SPDX license id from the GitHub API; null when unlicensed. */
  license: string | null;
  url: string;
  apiDescription: string;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  pushedAt: string;
  createdAt: string;
  archived: boolean;
  score: number;
  scoreReasons: string[];
  summary: string;
  highlights: string;
  /** Editorial one-liner (curated override); null when absent. */
  story: string | null;
  tags: string[];
  mentions: SnapshotMention[];
  readme: ReadmeSignals;
  tier: RepoTier;
}

export interface SnapshotProfiles {
  zierax: {
    login: string;
    htmlUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    location: string | null;
    company: string | null;
    blog: string | null;
    avatarUrl: string;
  };
  division36: {
    login: string;
    htmlUrl: string;
    publicRepos: number;
    followers: number;
    description: string | null;
  };
  /** The profile "Stars" tab (repos starred) — NOT owned repo stars. */
  starredTabCount: number | null;
}

export interface SnapshotTotals {
  zieraxOwnedRepoStars: number;
  zieraxOwnedRepoForks: number;
  zieraxOwnedRepoCount: number;
  division36OwnedRepoStars: number;
  division36OwnedRepoForks: number;
  division36OwnedRepoCount: number;
  combinedOwnedRepoStars: number;
  combinedOwnedRepoForks: number;
}

export interface GithubSnapshot {
  refreshedAt: string;
  /** Set when tiers/copy were re-applied without new API calls. */
  retieredAt?: string;
  source: string;
  /** Absent on v1 snapshots — see snapshotMethod fallback below. */
  schemaVersion?: number;
  method?: {
    formula: string;
    lanes: Record<string, string>;
    excluded: string;
  };
  profiles: SnapshotProfiles;
  totals: SnapshotTotals;
  tiers: Record<RepoTier, string[]>;
  ranked: RankedRepo[];
  excluded: {
    hidden: string[];
    thirdParty: string[];
    forks: { count: number; names: string[] };
  };
  profileReadme: {
    url: string;
    highlights: { repo: string; metric: string }[];
  };
  readmeFetch?: {
    requested: number;
    fetched: number;
    failed: string[];
  };
}

export const githubSnapshot = snapshotJson as unknown as GithubSnapshot;

const repoByKey = new Map<string, RankedRepo>(githubSnapshot.ranked.map((r) => [r.key, r]));

export function getRepo(key: string): RankedRepo | undefined {
  return repoByKey.get(key);
}

/** Ranking contract, with a static fallback so v1 snapshots never white-screen. */
export const snapshotMethod = githubSnapshot.method ?? {
  formula: "score = stars×2 + forks×3 + recency + org + domainBoost + readme + mentions − penalties (see scripts/refresh-github-data.mjs)",
  lanes: {
    flagship: "human-pinned, fixed order",
    spotlight: "curated research set, score-ordered",
    signal: "strict score order, top 10",
    recent: "activity feed across lanes",
    archive: "everything else",
  },
  excluded: "forks, profile configs, duplicates, third-party repos",
};

export const snapshotExcluded = githubSnapshot.excluded;

/** One-line audit trail for why a repo ranks where it does. */
export function whyRanked(repo: RankedRepo): string {
  return repo.scoreReasons.length > 0 ? `score ${repo.score} · ${repo.scoreReasons.join(" · ")}` : `score ${repo.score}`;
}

/** Repos of one tier, in snapshot order (flagship order is curated; all other lanes are score-ordered). */
export function lane(tier: RepoTier): RankedRepo[] {
  const keys = githubSnapshot.tiers[tier] || [];
  return keys
    .map((k) => repoByKey.get(k))
    .filter((r): r is RankedRepo => Boolean(r));
}

export const flagshipRepos: RankedRepo[] = lane("flagship");
export const spotlightRepos: RankedRepo[] = lane("spotlight");
export const signalRepos: RankedRepo[] = lane("signal");
export const recentRepos: RankedRepo[] = lane("recent");
export const archiveRepos: RankedRepo[] = lane("archive");

export function displayName(repo: RankedRepo): string {
  return repo.label || repo.name;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-18T..." -> "Sep 2026". Falls back to "2026" on bad input. */
export function updatedLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "2026";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-09-22T02:45:00.027Z" -> "Verified from GitHub API on Sep 22, 2026". */
export function refreshedLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Verified from GitHub API";
  return `Verified from GitHub API on ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * GitHub evidence summary. Field names are exact on purpose: owned repo
 * stars/forks are precomputed sums, never to be confused with the profile
 * Stars tab (profileStarredCount) or with external mentions.
 */
export interface GithubSignal {
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  ownedRepoStars: number;
  ownedRepoForks: number;
  division36PublicRepos: number;
  division36RepoStars: number;
  division36RepoForks: number;
  combinedOwnedRepoStars: number;
  combinedOwnedRepoForks: number;
  profileStarredCount: number | null;
  affiliation: string;
  location: string;
  refreshed: string;
  refreshedAt: string;
  starNote: string;
  visibleLinks: { label: string; url: string }[];
}

export const githubSignal: GithubSignal = {
  profileUrl: githubSnapshot.profiles.zierax.htmlUrl,
  publicRepos: githubSnapshot.profiles.zierax.publicRepos,
  followers: githubSnapshot.profiles.zierax.followers,
  following: githubSnapshot.profiles.zierax.following,
  ownedRepoStars: githubSnapshot.totals.zieraxOwnedRepoStars,
  ownedRepoForks: githubSnapshot.totals.zieraxOwnedRepoForks,
  division36PublicRepos: githubSnapshot.profiles.division36.publicRepos,
  division36RepoStars: githubSnapshot.totals.division36OwnedRepoStars,
  division36RepoForks: githubSnapshot.totals.division36OwnedRepoForks,
  combinedOwnedRepoStars: githubSnapshot.totals.combinedOwnedRepoStars,
  combinedOwnedRepoForks: githubSnapshot.totals.combinedOwnedRepoForks,
  profileStarredCount: githubSnapshot.profiles.starredTabCount,
  affiliation: "Division-36",
  location: githubSnapshot.profiles.zierax.location || "Egypt",
  refreshed: refreshedLabel(githubSnapshot.refreshedAt),
  refreshedAt: githubSnapshot.refreshedAt,
  starNote: "Owned public repository stars, not the GitHub profile Stars tab",
  visibleLinks: [
    { label: "Cal", url: "https://cal.com/zierax" },
    { label: "ORCID", url: "https://orcid.org/0009-0002-6813-2416" },
    { label: "Planck-99", url: "https://planck-99.pages.dev" },
    { label: "Truthisite", url: "https://truthisite.pages.dev" },
  ],
};

/**
 * Portfolio-ready project row. Same ranked list the Portfolio page, the
 * terminal `projects` command, and the document view all consume — no
 * separate stale manual list.
 */
export interface PortfolioProject {
  title: string;
  date: string;
  description: string;
  tags: string[];
  highlights: string;
  github: string;
  performance?: string;
  tier: RepoTier;
  stars: number;
  forks: number;
  score: number;
  scoreReasons: string[];
  updatedAt: string;
  owner: string;
  mentions: SnapshotMention[];
}

export function toPortfolioProject(repo: RankedRepo): PortfolioProject {
  const hasSignal = repo.stars > 0 || repo.forks > 0;
  return {
    title: displayName(repo),
    date: updatedLabel(repo.updatedAt),
    description: repo.summary,
    tags: repo.tags,
    highlights: repo.highlights,
    github: repo.url,
    performance: hasSignal ? `${repo.stars} stars / ${repo.forks} forks` : undefined,
    tier: repo.tier,
    stars: repo.stars,
    forks: repo.forks,
    score: repo.score,
    scoreReasons: repo.scoreReasons,
    updatedAt: repo.updatedAt,
    owner: repo.owner,
    mentions: repo.mentions,
  };
}

/** Every ranked repo as a portfolio project, tier order: flagship → spotlight → signal → recent → archive. */
export const rankedProjects: PortfolioProject[] = (
  ["flagship", "spotlight", "signal", "recent", "archive"] as RepoTier[]
).flatMap((tier) => lane(tier).map(toPortfolioProject));

export function mentionsForRepo(key: string): SnapshotMention[] {
  return repoByKey.get(key)?.mentions || [];
}
