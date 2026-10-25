import '@testing-library/jest-dom/vitest';
import { configureApiClient } from '@ampara/api-client';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

// O client gerado precisa estar configurado, como o app faz em setupApi().
configureApiClient({
  baseUrl: 'http://api.test',
  getTenant: () => 'demo',
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
});

// Requisição sem handler derruba o teste: ele nunca fala com a API de verdade.
const semHandler: string[] = [];
server.events.on('request:unhandled', ({ request }) => {
  semHandler.push(`${request.method} ${request.url}`);
});

beforeAll(() => server.listen());

afterEach(() => {
  cleanup();
  server.resetHandlers();
  if (semHandler.length > 0) {
    const lista = semHandler.splice(0).join('\n');
    throw new Error(`Requisição sem handler do MSW:\n${lista}`);
  }
});

afterAll(() => server.close());
