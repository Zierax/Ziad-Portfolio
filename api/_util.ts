/**
 * Shared serverless helpers for /api routes.
 *
 * OPSEC CONTRACT (do not weaken):
 * - These routes never persist, log, or echo visitor identifiers:
 *   no IPs, no user-agents, no headers, no request bodies in logs.
 * - Server logs carry only: timestamp, request id, method, path,
 *   status code, and error class. That is observability, not telemetry.
 * - Request bodies are never reflected back (no reflection/XSS surface,
 *   no chance of PII bouncing through the API).
 */

export interface ApiRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => ApiResponse;
}

export interface RouteInfo {
  requestId: string;
  method: string;
  path: string;
}

const rid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Structured server log. Deliberately free of visitor identifiers. */
export function serverLog(level: "info" | "warn" | "error", info: RouteInfo, status: number, detail: string) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    requestId: info.requestId,
    method: info.method,
    path: info.path,
    status,
    detail,
  });
  if (level === "error") console.error(line);
  else console.log(line);
}

export function routeInfo(req: ApiRequest): RouteInfo {
  const rawUrl = typeof req.url === "string" ? req.url : "/";
  return {
    requestId: rid(),
    method: (req.method || "UNKNOWN").toUpperCase(),
    path: rawUrl.split("?")[0],
  };
}

function applyHeaders(res: ApiResponse, headers: Record<string, string>) {
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
}

/** Send JSON with sane security headers. Never passes through req data. */
export function sendJson(
  req: ApiRequest,
  res: ApiResponse,
  status: number,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {}
) {
  const info = routeInfo(req);
  applyHeaders(res, {
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-request-id": info.requestId,
    ...extraHeaders,
  });
  serverLog(status >= 500 ? "error" : status >= 400 ? "warn" : "info", info, status, String(body["code"] || "ok"));
  return res.status(status).json({ requestId: info.requestId, ...body });
}

/** Enforce an allowlist of methods. Otherwise 405 + Allow header. */
export function requireMethod(
  req: ApiRequest,
  res: ApiResponse,
  allowed: string[]
): boolean {
  const method = (req.method || "").toUpperCase();
  if (allowed.map((m) => m.toUpperCase()).includes(method)) return true;
  sendJson(req, res, 405, {
    code: "method_not_allowed",
    error: `Use ${allowed.join(" or ")} on this endpoint.`,
    allowed,
  }, { Allow: allowed.join(", ") });
  return false;
}

/**
 * Wrap a handler so unexpected throws become a safe 500 (no stack, no
 * internals to the client) while the server log keeps the error class.
 */
export function safeHandler(
  fn: (req: ApiRequest, res: ApiResponse, info: RouteInfo) => unknown | Promise<unknown>
) {
  return async (req: ApiRequest, res: ApiResponse) => {
    const info = routeInfo(req);
    try {
      await fn(req, res, info);
    } catch (err) {
      const errClass = err instanceof Error ? err.name : typeof err;
      serverLog("error", info, 500, `unhandled:${errClass}`);
      applyHeaders(res, { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff" });
      return res.status(500).json({
        requestId: info.requestId,
        code: "internal_error",
        error: "Unexpected server error. Nothing was stored.",
      });
    }
  };
}

/** Byte size of the declared body without reading or logging it. */
export function declaredBodyBytes(req: ApiRequest): number | null {
  const raw = req.headers["content-length"];
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first === undefined) return null;
  const n = Number(first);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const NO_STORE: Record<string, string> = {
  "cache-control": "no-store",
};

export function publicCache(maxAgeSec: number, staleWhileRevalidateSec: number): Record<string, string> {
  return {
    "cache-control": `public, s-maxage=${maxAgeSec}, stale-while-revalidate=${staleWhileRevalidateSec}`,
  };
}
