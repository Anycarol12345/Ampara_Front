import { env } from './env';

/**
 * Slug da funerária para o cabeçalho X-Tenant.
 * `VITE_TENANT` tem prioridade (dev); senão vem do subdomínio (demo.funeraria.app, demo.localhost).
 * Retorna null no domínio da plataforma.
 */
export function resolveTenantSlug(): string | null {
  if (env.tenant) return env.tenant;

  const labels = window.location.hostname.toLowerCase().split('.');
  const hasSubdomain = labels.length >= 3 || (labels.length === 2 && labels[1] === 'localhost');
  return hasSubdomain ? (labels[0] ?? null) : null;
}
