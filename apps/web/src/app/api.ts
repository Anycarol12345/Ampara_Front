import { configureApiClient } from '@ampara/api-client';
import { expireSession, getAccessToken, refreshSession } from '@/features/auth';
import { env } from '@/shared/lib/env';
import { resolveTenantSlug } from '@/shared/lib/tenant-slug';

/** Liga o client da API (URL, tenant, token e renovação de sessão). Chamar uma vez, antes do render. */
export function setupApi(): void {
  configureApiClient({
    baseUrl: env.apiUrl,
    getTenant: resolveTenantSlug,
    getAccessToken: getAccessToken,
    refreshAccessToken: refreshSession,
    onSessionExpired: expireSession,
  });
}
