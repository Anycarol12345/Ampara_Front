import { defineConfig } from 'orval';

// Gera o client a partir de openapi.json (contrato do backend, INF-21).
// Para atualizar: copie o novo openapi.json do backend e rode `pnpm --filter @ampara/api-client generate`.
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
