/**
 * GET /api/github-meta — public portfolio evidence metadata.
 *
 * Serves a small summary of the build-time GitHub snapshot that already
 * ships to every browser with the site: refresh timestamps, owned-star
 * totals, lane sizes, and the flagship list. No per-visitor state, no
 * telemetry, no secrets — safe to cache at the edge.
 *
 * NOTE: the payload below is inlined (not imported) because cross-file
 * TS imports demonstrably fail to resolve in this serverless runtime.
 * Rewritten by scripts/refresh-github-data.mjs — do not hand-edit it.
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

// <GENERATED-PAYLOAD-START>
const PAYLOAD = {
  "refreshedAt": "2026-09-25T19:05:44.702Z",
  "retieredAt": "2026-09-27T03:06:29.357Z",
  "source": "github-api",
  "schemaVersion": 2,
  "totals": {
    "zieraxOwnedRepoStars": 532,
    "zieraxOwnedRepoForks": 102,
    "zieraxOwnedRepoCount": 93,
    "division36OwnedRepoStars": 95,
    "division36OwnedRepoForks": 15,
    "division36OwnedRepoCount": 10,
    "combinedOwnedRepoStars": 627,
    "combinedOwnedRepoForks": 117
  },
  "lanes": {
    "flagship": 10,
    "spotlight": 13,
    "signal": 10,
    "recent": 6,
    "archive": 4
  },
  "flagship": [
    {
      "key": "Zierax/Grafana-Final-Scanner",
      "stars": 244
    },
    {
      "key": "Division-36/Z-Jail",
      "stars": 74
    },
    {
      "key": "Zierax/My-Recon-Methology",
      "stars": 79
    },
    {
      "key": "Division-36/Planck-99_PublicBenchmarks",
      "stars": 9
    },
    {
      "key": "Division-36/Z-Privesc",
      "stars": 9
    },
    {
      "key": "Zierax/Axiom-Zspace",
      "stars": 4
    },
    {
      "key": "Zierax/Axiom-Astrophysics",
      "stars": 1
    },
    {
      "key": "Zierax/NHE-Architecture",
      "stars": 0
    },
    {
      "key": "Zierax/AdmitGPT",
      "stars": 3
    },
    {
      "key": "Zierax/Axiom-02",
      "stars": 4
    }
  ],
  "excluded": {
    "hidden": 68,
    "thirdParty": 1,
    "forks": 37
  },
  "warnings": []
} as const;
// <GENERATED-PAYLOAD-END>


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
    ...PAYLOAD,
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
