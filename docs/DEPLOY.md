# 🚀 Deploy — PHC Trainer Pro v6 (100% free tier)

Alvo: **Web na Vercel** (ou Cloudflare Pages) · **API no Render** (ou Railway) · **MongoDB Atlas M0** · **Sentry free** (opcional).

## 1. MongoDB Atlas (5 min)

1. https://cloud.mongodb.com → **Create** → cluster **M0 free** (região EU-West/Iberia).
2. Database Access → utilizador `phcapi` com password forte.
3. Network Access → `0.0.0.0/0` (free tier não tem VPC; aceite para começar) ou o IP do Render.
4. **Connect → Drivers** → copie a URI:
   `mongodb+srv://phcapi:<password>@cluster0.xxxxx.mongodb.net/phc-trainer`
5. GUI: **MongoDB Compass** (desktop) ou Data Explorer no site.

## 2. API no Render

1. https://render.com → **New → Web Service** → repo `bfrpaulondev/phc-trainer-pro`.
2. Configuração:
   - **Root Directory:** `apps/api`
   - **Runtime:** Node 22 · **Build:** `corepack enable && pnpm install` (ou `pnpm install` se já tiver pnpm)
   - **Start:** `pnpm start` (tsx src/index.ts)
   - **Env vars:**
     ```
     NODE_ENV=production
     PORT=10000                      # Render injeta; o código usa 4000 por omissão
     MONGODB_URI=mongodb+srv://...
     JWT_ACCESS_SECRET=<aleatório 48B base64url>
     JWT_REFRESH_SECRET=<aleatório 48B base64url>
     ENCRYPTION_KEY=<aleatório 48B base64url>
     CORS_ORIGIN=https://<a-sua-web>.vercel.app
     SENTRY_DSN=            (opcional)
     AI_KEY_GROQ=           (opcional — chaves globais de fallback)
     ```
     Gere segredos com: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
3. Deploy → teste `https://<api>.onrender.com/api/health` → `{"ok":true,...,"mongo":true}`.

> **Alternativa Railway:** mesmo processo (New Project → repo → root `apps/api` → variáveis).

## 3. Web na Vercel

1. https://vercel.com → **Add New → Project** → importar o repo.
2. **Framework:** Vite · **Root Directory:** `apps/web`.
3. **Env vars:** `VITE_API_URL=https://<api>.onrender.com` · `VITE_SENTRY_DSN` (opcional).
4. Deploy. A Vercel deteta o workspace pnpm automaticamente.

> **Alternativa Cloudflare Pages:** build command `pnpm --filter @phc/web build`, output `apps/web/dist`.

⚠️ **Cookies cross-site:** com web e API em domínios diferentes, o refresh por cookie exige
`SameSite=None; Secure` (já configurado em produção). O cliente também guarda o refresh token em
localStorage e envia-o por header — funciona mesmo onde cookies 3rd-party são bloqueados (Safari).

## 4. Sentry (opcional, free)

1. sentry.io → dois projetos: `phc-api` (Node/Express) e `phc-web` (React).
2. `SENTRY_DSN` no Render · `VITE_SENTRY_DSN` na Vercel. Sem DSN, nada é inicializado.

## 5. Smoke test pós-deploy

```bash
curl https://<api>.onrender.com/api/health
curl https://<api>.onrender.com/api/meta/content-stats   # labs:90, cards:139...
# na web: criar conta → criar equipa → colar 1 chave (Groq grátis) → 🧠 Explicar numa missão
```

## 6. Legado (GitHub Pages)

O PWA v5.3 continua publicado a partir da **raiz do repo** (Settings → Pages → main / root).
Mantenha-o até ao corte final da v6 (ver `docs/MIGRACAO.md`). Depois do corte: mover legado
para `legacy/` ou desligar o Pages e servir tudo da Vercel.

## Operação

- **Backups:** Atlas free faz snapshots diários (7 dias). Export adicional: cada utilizador pode
  exportar o seu progresso em JSON (Definições → 💾).
- **Rotação de chaves de IA:** Equipa → Fornecedores de IA (formador) — cifrado em repouso.
- **Rotação de ENCRYPTION_KEY:** invalida as chaves de equipa guardadas (voltar a colá-las).
- **Logs:** Render → Logs do serviço; erros Sentry.
