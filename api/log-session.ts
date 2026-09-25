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
 *   carry method/path/status/error-class only (see api/_util.ts).
 * - Bodies are capped at 1 MB by the platform parser; this handler never
 *   parses, reads, or reflects them (chunked bodies included).
 * - Every response carries x-request-id for correlation without identity.
 */
import { NO_STORE, safeHandler, sendJson, declaredBodyBytes, serverLog } from "./_util";
import type { ApiRequest, ApiResponse, RouteInfo } from "./_util";

export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" },
  },
};

export const ENDPOINT_VERSION = 2;
const MAX_ACCEPTED_BYTES = 1024 * 1024;

/** Normalize content-type to a class — never record or echo the raw value. */
function contentClass(req: ApiRequest): "json" | "other" | "absent" {
  const raw = req.headers["content-type"];
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string" || first.trim() === "") return "absent";
  return first.toLowerCase().includes("json") ? "json" : "other";
}

/** Whether a query string is present — never its values (may carry PII). */
function hasQuery(req: ApiRequest): boolean {
  return typeof req.url === "string" && req.url.includes("?");
}

async function handler(req: ApiRequest, res: ApiResponse, info: RouteInfo) {
  // CORS preflight: answer honestly so browser clients fail cleanly too.
  if (info.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "POST, OPTIONS");
    res.setHeader("access-control-max-age", "86400");
    serverLog("info", info, 204, "preflight");
    return res.status(204).json({});
  }

  if (info.method !== "POST") {
    return sendJson(req, res, 405, {
      code: "method_not_allowed",
      title: "Only POST reaches this endpoint — and POST is retired.",
      status: 405,
      instance: info.path,
      endpoint: "log-session",
      version: ENDPOINT_VERSION,
      allowed: ["POST", "OPTIONS"],
      hint: "If you are an old site client still phoning home: stop. There is nothing to phone home to.",
    }, { ...NO_STORE, Allow: "POST, OPTIONS" });
  }

  const bytes = declaredBodyBytes(req);
  if (bytes !== null && bytes > MAX_ACCEPTED_BYTES) {
    serverLog("warn", info, 413, "body_too_large");
    return sendJson(req, res, 413, {
      code: "body_too_large",
      title: "Declared body exceeds the cap.",
      status: 413,
      instance: info.path,
      endpoint: "log-session",
      version: ENDPOINT_VERSION,
      detail: `Declared ${bytes} bytes against a ${MAX_ACCEPTED_BYTES} byte cap. The body was not read, not parsed, not stored.`,
      limitBytes: MAX_ACCEPTED_BYTES,
    }, NO_STORE);
  }

  const content = contentClass(req);
  const query = hasQuery(req);

  return sendJson(req, res, 410, {
    code: "telemetry_retired",
    title: "Session logging has been retired. This endpoint accepts nothing.",
    status: 410,
    instance: info.path,
    endpoint: "log-session",
    version: ENDPOINT_VERSION,
    detail: "An earlier version of this portfolio collected passive visitor telemetry. That was removed as an OPSEC defect and will not return.",
    policy: [
      "No passive visitor telemetry is collected, stored, or forwarded.",
      "No browser fingerprinting, WebRTC probing, or stealth logging runs on this site.",
      "Server logs contain method/path/status only — never IPs, headers, bodies, or query values.",
    ],
    received: {
      method: info.method,
      path: info.path,
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
  }, NO_STORE);
}

export default safeHandler(handler);
