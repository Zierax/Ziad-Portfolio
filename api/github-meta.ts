/**
 * GET /api/github-meta — public portfolio evidence metadata.
 *
 * Serves a small summary of the build-time GitHub snapshot that already
 * ships to every browser with the site: refresh timestamps, owned-star
 * totals, lane sizes, and the flagship list. No per-visitor state, no
 * telemetry, no secrets — safe to cache at the edge.
 */
import snapshot from "../src/data/generated/github-snapshot.json";
import { publicCache, requireMethod, safeHandler, sendJson } from "./_util";
import type { ApiRequest, ApiResponse } from "./_util";

interface SnapshotMeta {
  refreshedAt?: string;
  retieredAt?: string;
  source?: string;
  schemaVersion?: number;
  totals?: Record<string, number>;
  tiers?: Record<string, string[]>;
  ranked?: { key: string; stars: number; tier: string }[];
  excluded?: {
    hidden?: string[];
    thirdParty?: string[];
    forks?: { count?: number };
  };
  warnings?: string[];
}

const data = snapshot as unknown as SnapshotMeta;

function laneCount(name: string): number {
  return Array.isArray(data.tiers?.[name]) ? (data.tiers as Record<string, string[]>)[name].length : 0;
}

async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireMethod(req, res, ["GET"])) return;

  const ranked = Array.isArray(data.ranked) ? data.ranked : [];
  const flagship = ranked.filter((r) => r.tier === "flagship").map((r) => ({ key: r.key, stars: r.stars }));

  return sendJson(req, res, 200, {
    code: "ok",
    refreshedAt: data.refreshedAt ?? null,
    retieredAt: data.retieredAt ?? null,
    source: data.source ?? "github-api",
    schemaVersion: data.schemaVersion ?? null,
    totals: data.totals ?? {},
    lanes: {
      flagship: laneCount("flagship"),
      spotlight: laneCount("spotlight"),
      signal: laneCount("signal"),
      recent: laneCount("recent"),
      archive: laneCount("archive"),
    },
    flagship,
    excluded: {
      hidden: data.excluded?.hidden?.length ?? 0,
      thirdParty: data.excluded?.thirdParty?.length ?? 0,
      forks: data.excluded?.forks?.count ?? 0,
    },
    warnings: data.warnings ?? [],
    note: "Owned public repository stars — not the GitHub profile Stars tab. Full data ships with the site; regenerate with `npm run refresh:github`.",
  }, publicCache(3600, 86400));
}

export default safeHandler(handler);
