import { create } from "zustand";
import type { ProgressState } from "@phc/shared";
import { apiFetch } from "../lib/api.ts";

interface StateResponse {
  state: ProgressState;
  unlocked?: string[];
}

interface ProgressStore {
  state: ProgressState | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  loadedFor: string | null;

  load: (userId: string, force?: boolean) => Promise<void>;
  reset: () => void;

  registerRep: (labId: string, timedSec?: number) => Promise<string[]>;
  toggleStep: (labId: string, index: number) => Promise<void>;
  toggleProof: (labId: string, index: number) => Promise<void>;
  markMastered: (labId: string) => Promise<string[]>;
  addEvidence: (lab: string, kind: string, txt: string) => Promise<string[]>;
  removeEvidence: (index: number) => Promise<void>;
  rateCard: (idx: number, q: 0 | 1 | 2) => Promise<void>;
  bumpStat: (kind: "lesson" | "chat" | "dict" | "circ" | "explic") => Promise<void>;
  submitQuiz: (lv: number, pct: number) => Promise<string[]>;
  setCompany: (segId: string, nome?: string, cidade?: string) => Promise<void>;
  setContexto: (pais: string, gama: string) => Promise<void>;
  updateSettings: (patch: Partial<ProgressState["settings"]>) => Promise<void>;
  syncFull: (patch: Partial<ProgressState>) => Promise<void>;
  importLegacy: (
    raw: string,
  ) => Promise<{ labs: number; cards: number; evidences: number; achievements: number }>;
  resetProgress: () => Promise<void>;
}

export const useProgress = create<ProgressStore>()((set, get) => {
  const apply = (r: StateResponse): string[] => {
    set({ state: r.state, status: "ready", error: null });
    return r.unlocked ?? [];
  };
  const call = async (path: string, body?: unknown): Promise<StateResponse> =>
    apiFetch<StateResponse>(path, { method: body !== undefined ? "POST" : "GET", body });

  return {
    state: null,
    status: "idle",
    error: null,
    loadedFor: null,

    async load(userId, force = false) {
      const cur = get();
      if (!force && cur.loadedFor === userId && cur.state) return;
      if (cur.status === "loading") return;
      set({ status: "loading", error: null });
      try {
        const r = await apiFetch<{ state: ProgressState }>("/api/progress");
        set({ state: r.state, status: "ready", loadedFor: userId });
      } catch (e) {
        set({ status: "error", error: (e as Error).message });
      }
    },

    reset() {
      set({ state: null, status: "idle", error: null, loadedFor: null });
    },

    async registerRep(labId, timedSec) {
      return apply(await call("/api/progress/reps", { labId, timedSec }));
    },
    async toggleStep(labId, index) {
      apply(await call("/api/progress/steps", { labId, index }));
    },
    async toggleProof(labId, index) {
      apply(await call("/api/progress/proofs", { labId, index }));
    },
    async markMastered(labId) {
      return apply(await call("/api/progress/mastered", { labId }));
    },
    async addEvidence(lab, kind, txt) {
      return apply(await call("/api/progress/evid", { lab, kind, txt }));
    },
    async removeEvidence(index) {
      apply(await apiFetch<StateResponse>(`/api/progress/evid/${index}`, { method: "DELETE" }));
    },
    async rateCard(idx, q) {
      apply(await call("/api/progress/cards/rate", { idx, q }));
    },
    async bumpStat(kind) {
      apply(await call("/api/progress/stats", { kind }));
    },
    async submitQuiz(lv, pct) {
      return apply(await call("/api/progress/quiz", { lv, pct }));
    },
    async setCompany(segId, nome, cidade) {
      apply(
        await apiFetch<StateResponse>("/api/progress/company", {
          method: "PUT",
          body: { segId, nome, cidade },
        }),
      );
    },
    async setContexto(pais, gama) {
      apply(
        await apiFetch<StateResponse>("/api/progress/contexto", {
          method: "PUT",
          body: { pais, gama },
        }),
      );
    },
    async updateSettings(patch) {
      const cur = get().state;
      const merged = { ...(cur?.settings ?? {}), ...patch };
      apply(
        await apiFetch<StateResponse>("/api/progress/settings", { method: "PUT", body: merged }),
      );
    },
    async syncFull(patch) {
      apply(await apiFetch<StateResponse>("/api/progress", { method: "PUT", body: patch }));
    },
    async importLegacy(raw) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("JSON inválido — cole o ficheiro exportado pelo app legado.");
      }
      const r = await apiFetch<{
        imported: { labs: number; cards: number; evidences: number; achievements: number };
        state: ProgressState;
      }>("/api/meta/import-legacy", { method: "POST", body: parsed });
      set({ state: r.state, status: "ready" });
      return r.imported;
    },
    async resetProgress() {
      const r = await apiFetch<StateResponse>("/api/meta/reset", { method: "POST" });
      apply(r);
    },
  };
});
