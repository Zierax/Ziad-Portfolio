/**
 * POST /api/log-session — intentionally retired (HTTP 410 Gone).
 *
 * History: an earlier version of this portfolio collected passive visitor
 * telemetry. That was removed as an OPSEC defect: a security portfolio must
 * not run a visitor trap. This route survives only as an explicit tombstone
 * so old clients get a clear, actionable answer instead of a silent 404.
 *
 * Guarantees:
 * - Nothing is ever stored, logged, or echoed from the request — not the
 *   body, not headers, not identifiers, not even query values. Server logs
 *   carry method/path/status/error-class only.
 * - Bodies are never parsed, read, or reflected (chunked bodies included).
 * - Every response carries x-request-id for correlation without identity.
 *
 * NOTE: deliberately self-contained (no cross-file imports) so the
 * serverless bundle has zero resolution risk.
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

export const ENDPOINT_VERSION = 2;
const MAX_ACCEPTED_BYTES = 1024 * 1024;

const rid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function log(level: "info" | "warn" | "error", requestId: string, method: string, path: string, status: number, detail: string) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, requestId, method, path, status, detail });
  if (level === "error") console.error(line);
  else console.log(line);
}

function send(req: Req, res: Res, status: number, body: Record<string, unknown>, extraHeaders: Record<string, string> = {}) {
  const requestId = rid();
  const rawUrl = typeof req.url === "string" ? req.url : "/";
  const method = (req.method || "UNKNOWN").toUpperCase();
  const path = rawUrl.split("?")[0];
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("x-request-id", requestId);
  res.setHeader("cache-control", "no-store");
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  log(status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    requestId, method, path, status, String(body["code"] || "ok"));
  return res.status(status).json({ requestId, ...body });
}

/** Byte size of the declared body without reading or logging it. */
function declaredBytes(req: Req): number | null {
  const raw = req.headers["content-length"];
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first === undefined) return null;
  const n = Number(first);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Normalize content-type to a class — never record or echo the raw value. */
function contentClass(req: Req): "json" | "other" | "absent" {
  const raw = req.headers["content-type"];
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string" || first.trim() === "") return "absent";
  return first.toLowerCase().includes("json") ? "json" : "other";
}

/** Whether a query string is present — never its values (may carry PII). */
function hasQuery(req: Req): boolean {
  return typeof req.url === "string" && req.url.includes("?");
}

async function route(req: Req, res: Res) {
  const method = (req.method || "").toUpperCase();
  const rawUrl = typeof req.url === "string" ? req.url : "/";
  const path = rawUrl.split("?")[0];

  // CORS preflight: answer honestly so browser clients fail cleanly too.
  if (method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "POST, OPTIONS");
    res.setHeader("access-control-max-age", "86400");
    log("info", rid(), method, path, 204, "preflight");
    return res.status(204).json({});
  }

  if (method !== "POST") {
    return send(req, res, 405, {
      code: "method_not_allowed",
      title: "Only POST reaches this endpoint — and POST is retired.",
      status: 405,
      instance: path,
      endpoint: "log-session",
      version: ENDPOINT_VERSION,
      allowed: ["POST", "OPTIONS"],
      hint: "If you are an old site client still phoning home: stop. There is nothing to phone home to.",
    }, { Allow: "POST, OPTIONS" });
  }

  const bytes = declaredBytes(req);
  if (bytes !== null && bytes > MAX_ACCEPTED_BYTES) {
    return send(req, res, 413, {
      code: "body_too_large",
      title: "Declared body exceeds the cap.",
      status: 413,
      instance: path,
      endpoint: "log-session",
      version: ENDPOINT_VERSION,
      detail: `Declared ${bytes} bytes against a ${MAX_ACCEPTED_BYTES} byte cap. The body was not read, not parsed, not stored.`,
      limitBytes: MAX_ACCEPTED_BYTES,
    });
  }

  const content = contentClass(req);
  const query = hasQuery(req);

  return send(req, res, 410, {
    code: "telemetry_retired",
    title: "Session logging has been retired. This endpoint accepts nothing.",
    status: 410,
    instance: path,
    endpoint: "log-session",
    version: ENDPOINT_VERSION,
    detail: "An earlier version of this portfolio collected passive visitor telemetry. That was removed as an OPSEC defect and will not return.",
    policy: [
      "No passive visitor telemetry is collected, stored, or forwarded.",
      "No browser fingerprinting, WebRTC probing, or stealth logging runs on this site.",
      "Server logs contain method/path/status only — never IPs, headers, bodies, or query values.",
    ],
    received: {
      method,
      path,
      contentClass: content,
      declaredBodyBytes: bytes,
      queryPresent: query,
      note: "Body content was not read, not parsed, not stored. Query values are never inspected.",
      contentHint:
        content === "other"
          ? "Content type is irrelevant here — bodies of every type are refused."
          : undefined,
      queryHint: query ? "Query strings change nothing — this endpoint has no inputs." : undefined,
    },
    retryable: false,
    alternatives: {
      privacy: "/privacy",
      evidenceMetadata: "/api/github-meta",
      sourceCode: "https://github.com/Zierax/Ziad-Portfolio",
      issues: "https://github.com/Zierax/Ziad-Portfolio/issues",
    },
  });
}

export default async function handler(req: Req, res: Res) {
  try {
    await route(req, res);
  } catch (err) {
    const requestId = rid();
    console.error(JSON.stringify({
      ts: new Date().toISOString(), level: "error", requestId,
      method: req.method || "UNKNOWN", path: "/", status: 500,
      detail: `unhandled:${err instanceof Error ? err.name : typeof err}`,
    }));
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("x-request-id", requestId);
    return res.status(500).json({
      requestId,
      code: "internal_error",
      error: "Unexpected server error. Nothing was stored.",
    });
  }
}
