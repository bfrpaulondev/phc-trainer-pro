import { create } from "zustand";
import {
  enqueue,
  isNetworkError,
  isQueueable,
  loadQueue,
  queueLength,
  saveQueue,
  type QueuedRequest,
} from "../lib/offlineQueue.ts";
import { apiFetch } from "../lib/api.ts";
import { toast } from "../components/ui/toast.tsx";
import { useProgress } from "./progress.ts";
import type { ProgressState } from "@phc/shared";

interface SyncState {
  online: boolean;
  pending: number;
  syncing: boolean;
  refresh: () => void;
  setOnline: (v: boolean) => void;
  drain: () => Promise<void>;
  /** regista pedido falhado por falta de rede (chamado pelo store de progresso) */
  queueOffline: (method: string, path: string, body?: unknown) => void;
}

export const useSync = create<SyncState>()((set, get) => ({
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  pending: queueLength(),
  syncing: false,

  refresh() {
    set({
      pending: queueLength(),
      online: typeof navigator === "undefined" ? true : navigator.onLine,
    });
  },

  setOnline(v) {
    set({ online: v, pending: queueLength() });
    if (v && queueLength() > 0) void get().drain();
  },

  queueOffline(method, path, body) {
    if (!isQueueable(path, method)) {
      toast.error("Sem ligação — esta ação precisa de rede.");
      return;
    }
    enqueue(method, path, body);
    set({ pending: queueLength() });
    toast.info(
      "📴 Sem ligação — ação guardada no dispositivo; sincroniza automaticamente quando voltar a rede.",
    );
  },

  async drain() {
    const q = loadQueue();
    if (!q.length || get().syncing) return;
    set({ syncing: true });
    const remaining: QueuedRequest[] = [];
    let ok = 0;
    let dropped = 0;
    let lastState: ProgressState | null = null;
    let offline = false;

    for (let i = 0; i < q.length; i++) {
      const entry = q[i];
      try {
        const r = await apiFetch<{ state?: ProgressState }>(entry.path, {
          method: entry.method,
          body: entry.body,
        });
        ok++;
        if (r?.state) lastState = r.state;
      } catch (e) {
        if (isNetworkError(e)) {
          // voltou a cair a rede — preserva o resto da fila e pára
          remaining.push(...q.slice(i));
          offline = true;
          break;
        }
        dropped++; // 4xx: ação inválida no servidor — descarta para não bloquear a fila
      }
    }

    saveQueue(remaining);
    if (lastState) useProgress.setState({ state: lastState, status: "ready" });
    set({ syncing: false, pending: remaining.length });

    if (ok > 0) toast.success(`☁️ ${ok} ação(ões) sincronizada(s) com a sua conta.`);
    if (dropped > 0)
      toast.error(`${dropped} ação(ões) rejeitada(s) pelo servidor — veja o progresso atual.`);
    if (offline) toast.info("Ainda sem ligação — o resto da fila fica guardado.");
  },
}));

/** liga os eventos de rede do navegador (chamar 1× no arranque) */
export function initNetworkListeners(): () => void {
  const on = () => useSync.getState().setOnline(true);
  const off = () => useSync.getState().setOnline(false);
  const queued = () => useSync.getState().refresh();
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  window.addEventListener("phc:queue", queued);
  // tenta logo ao arrancar (ex.: app aberta offline e depois recuperada)
  if (navigator.onLine && queueLength() > 0) void useSync.getState().drain();
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
    window.removeEventListener("phc:queue", queued);
  };
}
