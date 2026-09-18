/** Estado inicial de progresso (equivalente ao defaultState() do legado, sem chaves). */
import type { ProgressState, UserSettings } from "./types.ts";
import { defaultCompany } from "./company.ts";

export function defaultSettings(): UserSettings {
  return {
    tts: true,
    rate: 1,
    economy: false,
    ttsProvider: "browser",
    gmVoice: "Sulafat",
    gmModel: "gemini-3.1-flash-tts-preview",
    elVoice: "ErXwobaYiN019PkySvjV",
    grVoice: "troy",
    ttsFallback: true,
    freeMode: false,
  };
}

export function defaultProgress(): ProgressState {
  return {
    v: 3,
    labs: {},
    cards: {},
    quiz: {},
    evid: [],
    streak: { last: null, n: 0 },
    daily: { d: "", reps: 0, cards: 0, proofs: 0, lessons: 0 },
    stats: { lessons: 0, chats: 0, dict: 0, circ: 0, explics: 0 },
    achs: {},
    company: defaultCompany(),
    plan: null,
    contexto: { pais: "PT", gama: "Advanced" },
    settings: defaultSettings(),
    aiCache: {},
    dbSchema: "",
    onboarded: false,
  };
}
