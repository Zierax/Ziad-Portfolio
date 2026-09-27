/**
 * GET /api/github-meta — public portfolio evidence metadata.
 *
 * Serves a small summary of the build-time GitHub snapshot that already
 * ships to every browser with the site: refresh timestamps, owned-star
 * totals, lane sizes, and the flagship list. No per-visitor state, no
 * telemetry, no secrets — safe to cache at the edge.
 *
 * NOTE: deliberately self-contained (no cross-file imports) so the
 * serverless bundle has zero resolution risk. The snapshot is loaded
 * dynamically with a clean fallback so a bundling miss degrades to a
 * diagnosable 500 instead of a cold-start crash.
 */

interface Req {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => Res;
}

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

async function loadSnapshot(): Promise<SnapshotMeta> {
  const mod = await import("../src/data/generated/github-snapshot.json");
  return (mod as { default?: SnapshotMeta }).default ?? (mod as unknown as SnapshotMeta);
}

async function route(req: Req, res: Res) {
  const method = (req.method || "").toUpperCase();
  if (method !== "GET") {
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("x-request-id", `${Date.now().toString(36)}`);
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      code: "method_not_allowed",
      error: "Use GET on this endpoint.",
      allowed: ["GET"],
    });
  }

  let data: SnapshotMeta;
  try {
    data = await loadSnapshot();
  } catch (err) {
    console.error(JSON.stringify({
      ts: new Date().toISOString(), level: "error",
      detail: `snapshot_unavailable:${err instanceof Error ? err.message : typeof err}`,
    }));
    res.setHeader("content-type", "application/json; charset=utf-8");
    return res.status(500).json({
      code: "snapshot_unavailable",
      error: "Evidence snapshot could not be loaded. The site itself carries the same data.",
    });
  }

  const laneCount = (name: string): number => {
    const arr = data.tiers?.[name];
    return Array.isArray(arr) ? arr.length : 0;
  };
  const ranked = Array.isArray(data.ranked) ? data.ranked : [];
  const flagship = ranked.filter((r) => r.tier === "flagship").map((r) => ({ key: r.key, stars: r.stars }));

  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("cache-control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({
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
  });
}

export default async function handler(req: Req, res: Res) {
  try {
    await route(req, res);
  } catch (err) {
    console.error(JSON.stringify({
      ts: new Date().toISOString(), level: "error",
      detail: `unhandled:${err instanceof Error ? err.name : typeof err}`,
    }));
    res.setHeader("content-type", "application/json; charset=utf-8");
    return res.status(500).json({
      code: "internal_error",
      error: "Unexpected server error. Nothing was stored.",
    });
  }
}
