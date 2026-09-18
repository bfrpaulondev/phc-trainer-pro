/** Contratos de equipas (formador + técnicos). */
import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2).max(80),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const joinTeamSchema = z.object({
  /** código de convite (8 chars) */
  code: z.string().min(4).max(16),
});
export type JoinTeamInput = z.infer<typeof joinTeamSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** visível apenas para o formador/dono */
  inviteCode: z.string().optional(),
  ownerId: z.string(),
  memberCount: z.number(),
  createdAt: z.string(),
});
export type Team = z.infer<typeof teamSchema>;

export const memberSummarySchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["student", "trainer"]),
  belt: z.number(),
  pct: z.number(),
  mastered: z.number(),
  reps: z.number(),
  cardsMastered: z.number(),
  quizzesPassed: z.number(),
  evidences: z.number(),
  streak: z.number(),
  xp: z.number(),
  achievements: z.number(),
  lastActive: z.string().nullable(),
});
export type MemberSummary = z.infer<typeof memberSummarySchema>;

export const teamDashboardSchema = z.object({
  team: teamSchema,
  members: z.array(memberSummarySchema),
});
export type TeamDashboard = z.infer<typeof teamDashboardSchema>;

/** chaves de IA da equipa (guardadas cifradas no servidor) */
export const aiProviderIds = [
  "groq",
  "gemini",
  "mistral",
  "cerebras",
  "nvidia",
  "openrouter",
] as const;
export const aiProviderIdSchema = z.enum(aiProviderIds);
/** fornecedores de voz (chave própria) aceites nas definições da equipa */
export const aiKeyNames = [...aiProviderIds, "elevenlabs"] as const;
export const aiKeyNameSchema = z.enum(aiKeyNames);

export const teamAiSettingsSchema = z.object({
  /** chave por fornecedor; string vazia apaga */
  keys: z.record(aiKeyNameSchema, z.string().max(300)).optional(),
  order: z.array(aiProviderIdSchema).max(8).optional(),
});
export type TeamAiSettingsInput = z.infer<typeof teamAiSettingsSchema>;

export const providerStatusSchema = z.object({
  id: aiProviderIdSchema,
  nome: z.string(),
  configured: z.boolean(),
  /** de onde vem a chave: team | env | (vazio = não configurado) */
  source: z.string(),
  /** últimos 4 chars da chave (identificação sem exposição) */
  hint: z.string().optional(),
});
export type ProviderStatus = z.infer<typeof providerStatusSchema>;
