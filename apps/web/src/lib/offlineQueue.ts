/**
 * Fila de sincronização offline (localStorage).
 * Ações de progresso sem rede são guardadas aqui e repetidas por ordem
 * quando a ligação volta. Storage injetável para testabilidade.
 */

export interface QueuedRequest {
  id: string;
  method: string;
  path: string;
  body?: unknown;
  ts: number;
}

const KEY = "phc.offlineQueue.v1";

interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

function store(): StorageLike | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadQueue(): QueuedRequest[] {
  try {
    const raw = store()?.getItem(KEY);
    const q = raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
    return Array.isArray(q) ? q : [];
  } catch {
    return [];
  }
}

export function saveQueue(q: QueuedRequest[]): void {
  try {
    store()?.setItem(KEY, JSON.stringify(q.slice(-200)));
  } catch {
    /* quota — ignora */
  }
}

export function enqueue(method: string, path: string, body?: unknown): QueuedRequest {
  const entry: QueuedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method,
    path,
    body,
    ts: Date.now(),
  };
  saveQueue([...loadQueue(), entry]);
  return entry;
}

export function queueLength(): number {
  return loadQueue().length;
}

export function clearQueue(): void {
  saveQueue([]);
}

/** só mutações de progresso são enfileiráveis (auth/equipas/IA exigem rede) */
export function isQueueable(path: string, method: string): boolean {
  return method !== "GET" && path.startsWith("/api/progress");
}

/** erro de rede (fetch falha com TypeError) vs erro HTTP */
export function isNetworkError(e: unknown): boolean {
  return (
    e instanceof TypeError ||
    /failed to fetch|networkerror|load failed/i.test(String((e as Error)?.message ?? e))
  );
}
