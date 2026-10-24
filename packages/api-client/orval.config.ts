import { defineConfig } from 'orval';

/// Gera o client a partir de openapi.json (contrato do backend, INF-21).
// Para atualizar o backend: edite a versão em backend-version.json e rode `pnpm api:generate`.
export default defineConfig({
  ampara: {
    input: './openapi.json',
    output: {
      mode: 'single',
      target: './src/generated/api.ts',
      schemas: './src/generated/model',
      client: 'fetch',
      clean: true,
      override: {
        mutator: { path: './src/http.ts', name: 'customFetch' },
      },
    },
  },
});
