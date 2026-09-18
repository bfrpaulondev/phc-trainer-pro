import { create } from "zustand";

export type MascotMood = "idle" | "talk" | "think" | "cheer";

interface MascotState {
  mood: MascotMood;
  bubble: string;
  setMood: (m: MascotMood) => void;
  /** mostra uma fala do Professor (bolha + mood), com auto-limpeza */
  say: (text: string, mood?: MascotMood, ms?: number) => void;
  clear: () => void;
}

let sayTimer: ReturnType<typeof setTimeout> | null = null;

export const useMascot = create<MascotState>()((set) => ({
  mood: "idle",
  bubble: "",
  setMood: (mood) => set({ mood }),
  say: (text, mood = "talk", ms = 9000) => {
    if (sayTimer) clearTimeout(sayTimer);
    set({ bubble: text, mood });
    sayTimer = setTimeout(() => set({ bubble: "", mood: "idle" }), ms);
  },
  clear: () => set({ bubble: "", mood: "idle" }),
}));
