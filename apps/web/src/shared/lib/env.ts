/**
 * Configuração do app. Ordem de leitura:
 * 1. window.__APP_CONFIG__ (public/config.js): em produção é gerado pelo container
 *    na inicialização, sem rebuild.
 * 2. import.meta.env.VITE_*: usado em desenvolvimento (.env).
 */
interface RuntimeConfig {
  apiUrl?: string;
  tenant?: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

const runtime = window.__APP_CONFIG__ ?? {};

function pick(runtimeValue?: string, buildValue?: string): string | undefined {
  return runtimeValue?.trim() || buildValue?.trim() || undefined;
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Configuração ausente: ${name}`);
  return value;
}

export const env = {
  apiUrl: required(
    'API_URL / VITE_API_URL',
    pick(runtime.apiUrl, import.meta.env.VITE_API_URL),
  ).replace(/\/+$/, ''),
  tenant: pick(runtime.tenant, import.meta.env.VITE_TENANT),
} as const;
