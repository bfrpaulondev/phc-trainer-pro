import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/phc-trainer"),
  JWT_ACCESS_SECRET: z.string().min(16).default("dev-only-access-secret-0123456789"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-only-refresh-secret-0123456789"),
  ENCRYPTION_KEY: z.string().min(16).default("dev-only-encryption-key-0123456789"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  ACCESS_TTL: z.string().default("15m"),
  REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  SENTRY_DSN: z.string().optional(),
  AI_KEY_GROQ: z.string().optional(),
  AI_KEY_GEMINI: z.string().optional(),
  AI_KEY_MISTRAL: z.string().optional(),
  AI_KEY_CEREBRAS: z.string().optional(),
  AI_KEY_NVIDIA: z.string().optional(),
  AI_KEY_OPENROUTER: z.string().optional(),
  AI_MODEL_OPENROUTER: z.string().default("openai/gpt-4o-mini"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";

if (isProd) {
  const devDefaults = [
    env.JWT_ACCESS_SECRET.startsWith("dev-only"),
    env.JWT_REFRESH_SECRET.startsWith("dev-only"),
    env.ENCRYPTION_KEY.startsWith("dev-only"),
  ];
  if (devDefaults.some(Boolean)) {
    throw new Error(
      "Em produção, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET e ENCRYPTION_KEY têm de ser definidos (ver .env.example).",
    );
  }
}

export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** chaves de IA globais (fallback), por fornecedor */
export const globalAiKeys: Record<string, string> = Object.fromEntries(
  Object.entries({
    groq: env.AI_KEY_GROQ,
    gemini: env.AI_KEY_GEMINI,
    mistral: env.AI_KEY_MISTRAL,
    cerebras: env.AI_KEY_CEREBRAS,
    nvidia: env.AI_KEY_NVIDIA,
    openrouter: env.AI_KEY_OPENROUTER,
  }).filter(([, v]) => !!v) as [string, string][],
);
