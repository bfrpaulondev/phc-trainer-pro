import { expect, test } from "@playwright/test";

test("página de login carrega", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("PHC TRAINER PRO")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

test("registo valida palavra-passe curta", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nome").fill("Teste");
  await page.getByLabel("E-mail").fill("teste@example.com");
  await page.getByLabel("Palavra-passe").fill("curta");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("Mínimo 8 caracteres.")).toBeVisible();
});
