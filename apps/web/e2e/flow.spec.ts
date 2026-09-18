import { expect, test, type Page } from "@playwright/test";

/* helpers ------------------------------------------------------------ */

const uniqueEmail = (tag: string) =>
  `e2e.${tag}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@test.local`;

async function register(page: Page, name: string, email: string, password = "e2e-pass-123") {
  await page.goto("/register");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Palavra-passe").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  // entra na jornada (ou o wizard de onboarding abre ~600ms depois)
  await expect(page.getByText("PHC TRAINER PRO").first()).toBeVisible();
}

async function dismissOnboarding(page: Page) {
  const dialog = page.getByRole("dialog", { name: /empresa de treino/i });
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole("button", { name: "Fechar" }).click();
    await expect(dialog).toBeHidden();
  }
}

/* testes --------------------------------------------------------------- */

test("registo + onboarding com plano padrão define empresa e mostra jornada", async ({ page }) => {
  await register(page, "E2E Formador", uniqueEmail("onb"));

  // o wizard abre sozinho na 1ª sessão
  const wizard = page.getByRole("dialog", { name: /empresa de treino/i });
  await expect(wizard).toBeVisible({ timeout: 8000 });

  // passo 1: segmento (primeiro cartão da grelha)
  await wizard.locator(".segGrid button").first().click();
  await wizard.getByRole("button", { name: "Continuar ➡" }).click();

  // passo 2: empresa
  await expect(wizard.getByText("Pré-visualização")).toBeVisible();
  await wizard.getByRole("button", { name: "Continuar ➡" }).click();

  // passo 3: objetivos → gerar
  await wizard.getByRole("button", { name: "Gerar curso ➡" }).click();

  // passo 4: plano padrão (sem IA) + aplicar
  await wizard.getByRole("button", { name: /plano padrão do segmento/i }).click();
  await expect(wizard.getByText("Plano gerado")).toBeVisible();
  await wizard.getByRole("button", { name: "Aplicar empresa + curso" }).click();

  await expect(page.getByText("Empresa de treino + curso aplicados!")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Missão atual")).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("link", { name: /Curso personalizado|Crie o seu curso/i }),
  ).toHaveCount(0);
});

test("missão L00: registar repetição atualiza contador e evidencia aparece", async ({ page }) => {
  await register(page, "E2E Técnico", uniqueEmail("rep"));
  await dismissOnboarding(page);

  await page.goto("/missoes/L00");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/EMPRESA|MODELO|Preparar/i);

  // cronometrar não é necessário; regista a repetição
  await page.getByRole("button", { name: "Registar repetição" }).click();
  await expect(page.getByText("+1 repetição registada")).toBeVisible();
  await expect(page.getByText("1/5 repetições")).toBeVisible();

  // marcar um passo
  const firstStep = page.locator("ol li label").first();
  await firstStep.locator("input[type=checkbox]").check();
  await expect(page.locator("ol li label").first()).toHaveClass(/line-through/);

  // registar uma prova no portefólio
  await page.getByPlaceholder("Descrição / nome do ficheiro").fill("e2e-print-teste.png");
  await page.getByRole("button", { name: "+ Registar" }).click();
  await expect(page.getByText("Prova registada! 📸")).toBeVisible();
  await expect(page.getByText("e2e-print-teste.png")).toBeVisible();
});

test("equipa: formador cria, técnico entra por código e painel mostra os dois", async ({
  browser,
}) => {
  // --- formador ---
  const ctxA = await browser.newContext();
  const trainer = await ctxA.newPage();
  await register(trainer, "E2E Boss", uniqueEmail("boss"));
  await dismissOnboarding(trainer);

  await trainer.goto("/equipa");
  await trainer.getByLabel("Nome da equipa / empresa").fill("Equipa E2E");
  await trainer.getByRole("button", { name: "Criar equipa" }).click();

  const codeEl = trainer.getByTestId("invite-code");
  await expect(codeEl).toBeVisible({ timeout: 10000 });
  const code = (await codeEl.textContent())!.trim();
  expect(code).toMatch(/^[A-Z2-9]{8}$/);

  // --- técnico (novo contexto = novo navegador) ---
  const ctxB = await browser.newContext();
  const student: Page = await ctxB.newPage();
  await register(student, "E2E Newbie", uniqueEmail("newb"));
  await dismissOnboarding(student);

  await student.goto("/equipa");
  await student.getByPlaceholder("Ex.: K7M2QX9P").fill(code);
  await student.getByRole("button", { name: "Entrar na equipa" }).click();
  await expect(student.getByText(/Bem-vindo à equipa/)).toBeVisible({ timeout: 10000 });

  // --- painel do formador lista os 2 membros ---
  await trainer.goto("/equipa");
  const rows = trainer.getByTestId("member-row");
  await expect(rows).toHaveCount(2, { timeout: 15000 });
  await expect(rows.filter({ hasText: "E2E Newbie" })).toHaveCount(1);
  await expect(rows.filter({ hasText: "formador" })).toHaveCount(1);

  await ctxA.close();
  await ctxB.close();
});

test("convite por link: /entrar/:CODE pré-preenche e entra na equipa", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const trainer = await ctxA.newPage();
  await register(trainer, "E2E Boss2", uniqueEmail("boss2"));
  await dismissOnboarding(trainer);
  await trainer.goto("/equipa");
  await trainer.getByLabel("Nome da equipa / empresa").fill("Equipa Link");
  await trainer.getByRole("button", { name: "Criar equipa" }).click();
  const code = (await trainer.getByTestId("invite-code").textContent())!.trim();

  const ctxB = await browser.newContext();
  const student = await ctxB.newPage();
  await register(student, "E2E Linkado", uniqueEmail("link"));
  await dismissOnboarding(student);
  await student.goto(`/entrar/${code}`);
  await expect(student.getByText(/Entrar na equipa/i).first()).toBeVisible({ timeout: 15000 });
  // o join é automático ao abrir o link autenticado
  await expect(student).toHaveURL(/\/equipa/, { timeout: 15000 });
  await expect(student.getByText("Equipa Link").first()).toBeVisible();

  await ctxA.close();
  await ctxB.close();
});
