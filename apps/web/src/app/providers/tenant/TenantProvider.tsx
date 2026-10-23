import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { resolveTenantSlug } from '@/shared/lib/tenant-slug';
import { useTheme } from '@/shared/theme';
import { applyTenantTheme } from './apply-tenant-theme';
import {
  cacheTenant,
  DEFAULT_TENANT,
  fetchTenantConfig,
  readCachedTenant,
  type TenantConfig,
} from './tenant-config';
import { TenantContext, type TenantStatus } from './tenant-context';

/**
 * Carrega nome, logo e cores da funerária ao iniciar e as aplica como variáveis CSS.
 * Se o endpoint falhar, o app segue com o último config em cache ou com o tema padrão.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [slug] = useState(resolveTenantSlug);
  const [tenant, setTenant] = useState<TenantConfig>(
    () => readCachedTenant(slug) ?? DEFAULT_TENANT,
  );
  // Sem slug (domínio da plataforma) não há funerária para carregar: segue com o tema padrão.
  const [status, setStatus] = useState<TenantStatus>(slug ? 'loading' : 'ready');

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    fetchTenantConfig(controller.signal)
      .then((config) => {
        setTenant(config);
        cacheTenant(config);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setStatus('error');
      });
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    applyTenantTheme(tenant, resolvedTheme);
  }, [tenant, resolvedTheme]);

  useEffect(() => {
    document.title = tenant.nome;
  }, [tenant.nome]);

  const value = useMemo(() => ({ tenant, status }), [tenant, status]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
