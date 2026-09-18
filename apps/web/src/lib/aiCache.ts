/** Cache local de respostas de IA (explicações/aulas) — evita gastar créditos 2×. */
import { hashStr } from "@phc/shared";

const LS_KEY = "phc.aiCache.v6";
const MAX = 400;

type Cache = Record<string, { t: string; ts: number }>;

function load(): Cache {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as Cache;
  } catch {
    return {};
  }
}

function save(c: Cache): void {
  const ks = Object.keys(c);
  if (ks.length > MAX) {
    ks.sort((a, b) => c[a].ts - c[b].ts)
      .slice(0, ks.length - MAX)
      .forEach((k) => delete c[k]);
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(c));
  } catch {
    /* quota — ignora */
  }
}

export function aiCacheGet(key: string): string | null {
  return load()[key]?.t ?? null;
}

export function aiCacheSet(key: string, text: string): void {
  const c = load();
  c[key] = { t: text, ts: Date.now() };
  save(c);
}

export function aiCacheKeyFor(parts: string[]): string {
  return hashStr(parts.join("|"));
}

export function aiCacheClear(): void {
  localStorage.removeItem(LS_KEY);
}
