# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.34.7

# ---------- 1) build: instala as dependências e gera os arquivos estáticos ----------
FROM node:${NODE_VERSION}-alpine AS build
ARG PNPM_VERSION
RUN npm install --global pnpm@${PNPM_VERSION}

WORKDIR /repo
COPY . .

# O cache do store acelera os builds seguintes. O filtro instala só o apps/web e o que ele usa.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store --filter "@ampara/web..."

# Sem VITE_* aqui de propósito: a URL da API vem do config.js em tempo de execução.
RUN pnpm --filter @ampara/web build

# ---------- 2) runtime: nginx (sem root) servindo os arquivos estáticos ----------
# Em produção, fixe a versão do nginx (ex.: 1.xx-alpine) para builds reproduzíveis.
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

USER root
COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=build --chown=101:101 /repo/apps/web/dist /usr/share/nginx/html
# Garante LF no script (checkout no Windows pode gerar CRLF) e permissão de execução.
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-runtime-config.sh \
 && chmod 755 /docker-entrypoint.d/40-runtime-config.sh
USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1