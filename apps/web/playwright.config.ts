import { defineConfig } from "@playwright/test";

/**
 * E2E (Playwright) — auto-contido: sobe Mongo em memória + API + Web.
 *
 * Local:   pnpm test:e2e            (1ª vez: pnpm --filter @phc/web exec playwright install chromium)
 * CI:      job "e2e" (.github/workflows/ci.yml)
 *
 * O webServer arranca os 3 processos (mongod em memória :27017, API :4000, Vite :5173)
 * e o Playwright espera pela readiness de cada um antes dos testes.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // os testes partilham o servidor; sequência evita races
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: {
      // ambientes com pouca RAM (sandbox/CI pequeno): 1 renderer, sem zygote
      args: process.env.PW_LOW_MEM
        ? ["--single-process", "--no-zygote", "--renderer-process-limit=1"]
        : [],
    },
  },
  webServer: [
    {
      command: "pnpm --filter @phc/api mongo:dev",
      url: "http://localhost:4101/ready",
      timeout: 300_000, // 1ª vez descarrega o binário do mongod (~70 MB)
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter @phc/api start",
      url: "http://localhost:4000/api/health",
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter @phc/web exec vite preview --port 5173 --strictPort",
      url: "http://localhost:5173",
      timeout: 120_000, // requer `pnpm build` antes (o CI fá-lo no job quality; local: pnpm build)
      reuseExistingServer: !process.env.CI,
    },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
});
