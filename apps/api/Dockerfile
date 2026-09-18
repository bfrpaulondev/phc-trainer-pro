# API PHC Trainer Pro — imagem mínima (runtime tsx, sem passo de build)
FROM node:22-slim

RUN corepack enable

WORKDIR /app

# dependências primeiro (cache de camadas)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/content/package.json packages/content/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @phc/api...

# código
COPY packages ./packages
COPY apps/api ./apps/api

ENV NODE_ENV=production
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["pnpm", "--filter", "@phc/api", "start"]
