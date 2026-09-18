import { defineConfig } from "@playwright/test";

/**
 * E2E (Playwright). Antes de correr:
 *   pnpm --filter @phc/web exec playwright install chromium
 *   pnpm dev   (api :4000 + web :5173, com MongoDB local/Atlas de teste)
 */
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: undefined, // arranque manual (api+web+mongo) — ver docs/DEPLOY.md
  reporter: [["list"], ["html", { open: "never" }]],
});
