/**
 * GET /api/github-meta — public portfolio evidence metadata.
 *
 * Serves a small summary of the build-time GitHub snapshot that already
 * ships to every browser with the site: refresh timestamps, owned-star
 * totals, lane sizes, and the flagship list. No per-visitor state, no
 * telemetry, no secrets — safe to cache at the edge.
 *
 * NOTE: imports a tiny generated TS module (not the 144KB snapshot JSON),
 * so the serverless bundler inlines it with zero file-tracing risk.
 */
import { githubMetaPayload } from "../src/data/generated/github-meta.payload";

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

  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("cache-control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({
    code: "ok",
    ...githubMetaPayload,
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
