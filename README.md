# Ampara Frontend

Monorepo do frontend da Ampara, gerenciado com **pnpm workspaces** e **Turborepo**.

## Estrutura

```
Ampara_Front/
├── apps/
│   ├── web/        Sistema (área do cliente, área interna e plataforma). Vite + React. Porta 5173
│   └── landing/    Página pública. Next.js. Porta 3000
├── packages/
│   ├── config/     tsconfig, ESLint e Prettier compartilhados
│   ├── ui/         (a criar) componentes shadcn/ui e tema compartilhados
│   ├── api-client/ client gerado pelo Orval a partir do openapi.json do backend
│   └── e2e/        (a criar) testes Playwright
├── pnpm-workspace.yaml
└── turbo.json
```

## Pré-requisitos

- Node 22 ou superior (veja `.nvmrc`)
- pnpm 10 (via Corepack: `corepack enable`)

## Primeiros passos

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/landing/.env.example apps/landing/.env.local
pnpm dev
```

No PowerShell, troque `cp` por `Copy-Item`.

## Comandos

| Comando             | O que faz                                  |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Sobe todos os apps em modo desenvolvimento |
| `pnpm build`        | Build de todos os pacotes e apps           |
| `pnpm lint`         | ESLint, incluindo as regras de dependência |
| `pnpm typecheck`    | Checagem de tipos (TypeScript strict)      |
| `pnpm test`         | Testes                                     |
| `pnpm format`       | Formata o código com Prettier              |
| `pnpm format:check` | Verifica a formatação sem alterar arquivos |

Para rodar um app isolado:

```bash
pnpm --filter @ampara/web dev
pnpm --filter @ampara/landing dev
```

## Variáveis de ambiente

| App       | Arquivo local | Variáveis                                    |
| --------- | ------------- | -------------------------------------------- |
| `web`     | `.env`        | `VITE_API_URL`, `VITE_TENANT` (slug em dev)  |
| `landing` | `.env.local`  | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL` |

- Os arquivos `.env.example` são versionados; os `.env` reais não.
- Tudo que começa com `VITE_` ou `NEXT_PUBLIC_` vai para o navegador. **Nunca coloque segredos aí.**
- Leia as variáveis sempre pelo módulo `env.ts` de cada app (`shared/lib/env.ts` no web, `lib/env.ts` na landing), nunca direto de `import.meta.env` ou `process.env`.
- O Vite só lê o `.env` ao iniciar: reinicie o dev server após alterá-lo.

## Integração com o backend

O backend ([Ampara, branch `developer`](https://github.com/ArturRibeiroB/Ampara/tree/developer)) sobe em `http://localhost:5080`
(`docker compose up -d --build`; veja o README dele). Com a API no ar, o `VITE_API_URL` do `.env` deve apontar para ela e o
`VITE_TENANT=demo` identifica a funerária de demonstração (cabeçalho `X-Tenant`). Em produção o slug vem do subdomínio.

- **Client:** `packages/api-client` é gerado com Orval a partir do `openapi.json`. Para atualizar, copie o novo
  `artifacts/openapi/openapi.json` do backend (`dotnet build src/Funeraria.Api -p:OpenApiGenerateDocumentsOnBuild=true`)
  e rode `pnpm --filter @ampara/api-client generate`.
- **Transporte:** `packages/api-client/src/http.ts` envia `X-Tenant` e o `Bearer`, renova o access token em caso de 401
  (uma vez, sem requisições paralelas) e lança `ApiError` com `code`, `traceId` e `errors` por campo.
- **Sessão:** access token (15 min) só em memória; o refresh token fica em cookie httpOnly. `features/auth` restaura a
  sessão ao abrir o app e expõe `useAuth()` (`login`, `logout`, `user`, `status`).
- **CORS:** o backend em Development já libera `http://localhost:5173` com credenciais.

## Organização do `apps/web`

O código é organizado por feature, espelhando os módulos do backend:

```
apps/web/src/
├── app/        providers, rotas, layouts
├── features/
│   ├── auth/  clientes/  dependentes/  planos/  contratos/  financeiro/
│   └── funeral/  translado/  documentos/  notificacoes/  admin/
│       (cada uma com components/, hooks/, schemas/, pages/ e index.ts)
└── shared/     utilitários e hooks genéricos
```

O alias `@/` aponta para `apps/web/src/`.

## Regras de dependência

1. Pacotes (`packages/`) nunca importam código dos apps.
2. Uma feature não importa arquivos internos de outra, apenas o que ela expõe no `index.ts`.
3. Features não importam `app/`.
4. `shared/` não conhece features nem `app/`.
5. Só `app/` conhece todas as features.

Exemplo:

```ts
import { LoginPage } from '@/features/auth'; // correto
import { useAuth } from '@/features/auth/hooks/useAuth'; // erro de lint
```

As regras são verificadas pelo ESLint (`no-restricted-imports`), configuradas em
`packages/config/eslint/boundaries.js` (features e shared) e
`packages/config/eslint/packages.js` (pacotes). Ao criar uma nova feature,
adicione o nome na lista `FEATURES` do `boundaries.js`.

## Padrões

- TypeScript em modo estrito.
- Prettier para formatação, ESLint para qualidade e dependências.
- Commits no formato Conventional Commits (`feat:`, `fix:`, `chore:`).

## Docker

```bash
cp .env.example .env
docker compose up --build        # frontend em http://localhost:8081
docker compose --profile api up  # inclui a API (veja INF-15)
```

A URL da API é lida em tempo de execução (`API_URL`), então a mesma imagem serve a qualquer
ambiente sem novo build: `docker run -p 8081:8080 -e API_URL=https://api.exemplo.com.br ampara-web`.
