/**
 * Cliente HTTP da API com refresh automático de tokens.
 * - access token: só em memória (nunca em localStorage)
 * - refresh token: cookie httpOnly (same-origin) + localStorage (cross-origin)
 */
const BASE: string = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const RT_KEY = "phc.refreshToken";

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(t: string | null): void {
  accessToken = t;
}

export function storeRefreshToken(t: string | null): void {
  if (t) localStorage.setItem(RT_KEY, t);
  else localStorage.removeItem(RT_KEY);
}

export function hasRefreshToken(): boolean {
  return !!localStorage.getItem(RT_KEY);
}

export class ApiHTTPError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiHTTPError";
  }
}

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
}

function applySession(s: SessionPayload): void {
  setAccessToken(s.accessToken);
  storeRefreshToken(s.refreshToken);
}

export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const rt = localStorage.getItem(RT_KEY);
    if (!rt) return false;
    try {
      const r = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-refresh-token": rt },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!r.ok) {
        storeRefreshToken(null);
        setAccessToken(null);
        return false;
      }
      applySession((await r.json()) as SessionPayload);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** não tentar refresh em 401 (usado no próprio /auth/refresh) */
  noRetry?: boolean;
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const doFetch = async (): Promise<Response> => {
    const headers = new Headers(opts.headers);
    headers.set("Content-Type", "application/json");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(`${BASE}${path}`, {
      ...opts,
      headers,
      credentials: "include",
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  };

  let r = await doFetch();
  if (r.status === 401 && !opts.noRetry && (await refreshSession())) {
    r = await doFetch();
  }
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    let details: unknown;
    try {
      const j = (await r.json()) as { error?: string; details?: unknown };
      msg = j.error || msg;
      details = j.details;
    } catch {
      /* corpo não-JSON */
    }
    throw new ApiHTTPError(r.status, msg, details);
  }
  if (r.status === 204) return undefined as T;
  return (await r.json()) as T;
}

export { applySession, BASE };
