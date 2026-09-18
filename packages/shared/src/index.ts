/**
 * @phc/shared — contratos + domínio partilhado (web ⇄ api).
 */
export * from "./types.ts";
export * from "./date.ts";
export * from "./srs.ts";
export * from "./achievements.ts";
export * from "./company.ts";
export * from "./defaults.ts";
export * from "./prompts.ts";

export * from "./schemas/auth.ts";
export * from "./schemas/teams.ts";
export * from "./schemas/ai.ts";
export * from "./schemas/progress.ts";

/** resumo derivado de progresso (usado no dashboard de equipa) */
import type { ProgressState, ProgressSummary } from "./types.ts";
import {
  cardsMastered,
  currentBelt,
  labsMastered,
  overallPct,
  quizzesPassed,
  totalReps,
  xpTotal,
} from "./srs.ts";

export function summarizeProgress(
  s: ProgressState,
  lastActive: string | null = null,
): ProgressSummary {
  return {
    reps: totalReps(s),
    mastered: labsMastered(s),
    cardsMastered: cardsMastered(s),
    quizzesPassed: quizzesPassed(s),
    evidences: s.evid.length,
    streak: s.streak?.n ?? 0,
    xp: xpTotal(s),
    pct: overallPct(s),
    belt: currentBelt(s),
    lastActive,
    achievements: Object.keys(s.achs || {}).length,
  };
}
