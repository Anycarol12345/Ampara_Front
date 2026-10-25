import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      clearMocks: true,
      css: false,
      // Sem .env (CI, container), o env.ts falharia ao ser importado.
      env: { VITE_API_URL: 'http://api.test' },
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/test/**',
          'src/**/*.d.ts',
          'src/**/index.ts',
          'src/main.tsx',
          'src/shared/ui/**', // código gerado pelo shadcn
          'src/app/DesignPreview.tsx', // páginas temporárias
          'src/app/FormExample.tsx',
          'src/app/RealtimeExample.tsx',
        ],
        // Valores iniciais, ainda não medidos: veja a seção "Meta de cobertura".
        thresholds: {
          statements: 25,
          branches: 25,
          functions: 25,
          lines: 25,
          'src/shared/forms/{masks,schemas,apply-api-errors}.ts': {
            statements: 90,
            branches: 75,
            functions: 90,
            lines: 90,
          },
          'src/shared/lib/api-error.ts': { statements: 90, branches: 80, functions: 90, lines: 90 },
          'src/features/auth/{session,roles,usePermissao}.{ts,tsx}': {
            statements: 80,
            branches: 70,
            functions: 80,
            lines: 80,
          },
        },
      },
    },
  }),
);
