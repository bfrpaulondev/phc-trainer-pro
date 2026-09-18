/**
 * Conquistas (24) — regras portadas dos `ck` do legado (ACHS).
 * Conteúdo declarativo vem de @phc/content; aqui vive a lógica de verificação.
 */
import { ACHIEVEMENTS, LABS, QUIZZES, type Achievement } from "@phc/content";
import type { ProgressState } from "./types.ts";
import { cardsMastered, labsMastered, quizzesPassed, totalReps } from "./srs.ts";
import { todayISO } from "./date.ts";

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

type Check = (s: ProgressState) => boolean;

function allPackMastered(s: ProgressState, lv: number): boolean {
  const ls = LABS.filter((l) => l.lv === lv);
  return ls.length > 0 && ls.every((l) => s.labs[l.id]?.mem);
}

export const ACHIEVEMENT_CHECKS: Record<string, Check> = {
  "primeira-pratica": (s) => totalReps(s) >= 1,
  "reps-25": (s) => totalReps(s) >= 25,
  "reps-100": (s) => totalReps(s) >= 100,
  "primeira-memoria": (s) => labsMastered(s) >= 1,
  "dez-memoria": (s) => labsMastered(s) >= 10,
  "todas-memoria": (s) => labsMastered(s) >= LABS.length,
  "streak-7": (s) => s.streak.n >= 7,
  "streak-30": (s) => s.streak.n >= 30,
  "cartas-25": (s) => cardsMastered(s) >= 25,
  "cartas-100": (s) => cardsMastered(s) >= 100,
  "testes-5": (s) => quizzesPassed(s) >= 5,
  "testes-todos": (s) => quizzesPassed(s) >= QUIZZES.length,
  "provas-25": (s) => s.evid.length >= 25,
  "provas-100": (s) => s.evid.length >= 100,
  "curso-ia": (s) => !!(s.plan && s.plan.porIA),
  empresa: (s) => !!(s.company && s.company.segId && s.company.segId !== "distrib"),
  "licoes-10": (s) => (s.stats.lessons || 0) >= 10,
  fiscal: (s) => (s.labs["L33"]?.c ?? 0) > 0,
  dev: (s) => (s.labs["L46"]?.c ?? 0) > 0,
  projeto: (s) => (s.labs["L56"]?.c ?? 0) > 0,
  contabilista: (s) => allPackMastered(s, 9),
  rh: (s) => allPackMastered(s, 10),
  pos: (s) => allPackMastered(s, 11),
  suporte: (s) => allPackMastered(s, 12),
};

/** devolve os ids de conquistas atualmente satisfeitas */
export function evaluateAchievements(s: ProgressState): string[] {
  const out: string[] = [];
  for (const a of ACHIEVEMENTS as Achievement[]) {
    const ck = ACHIEVEMENT_CHECKS[a.id];
    if (ck && ck(s)) out.push(a.id);
  }
  return out;
}

/** aplica conquistas novas ao estado (id → data ISO); devolve as newly unlocked */
export function applyAchievements(s: ProgressState, today = todayISO()): string[] {
  const fresh: string[] = [];
  for (const id of evaluateAchievements(s)) {
    if (!s.achs[id]) {
      s.achs[id] = today;
      fresh.push(id);
    }
  }
  return fresh;
}
