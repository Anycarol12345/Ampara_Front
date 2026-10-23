import { identidadeVisual } from '@ampara/api-client';
import { env } from '@/shared/lib/env';
import { isHexColor } from '@/shared/lib/color';

/** Identidade visual da funerária (GET /api/v1/tenant/configuracoes, TEN-03). */
export interface TenantConfig {
  slug: string | null;
  nome: string;
  logoUrl: string | null;
  cores: {
    /** cor_primaria: botões, links e foco. */
    primaria?: string;
    /** cor_secundaria: destaque (accent). */
    secundaria?: string;
  };
}

export const DEFAULT_TENANT: TenantConfig = {
  slug: null,
  nome: 'Ampara',
  logoUrl: null,
  cores: {},
};

const CACHE_KEY = 'ampara:tenant-config';

function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, env.apiUrl);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Cores só entram se forem hex válido e a logo só se for http(s): nunca strings arbitrárias no CSS/DOM. */
function sanitize(raw: Partial<TenantConfig> & { cores?: Record<string, unknown> }): TenantConfig {
  const cores = raw.cores ?? {};
  const nome = typeof raw.nome === 'string' ? raw.nome.trim() : '';
  return {
    slug: typeof raw.slug === 'string' ? raw.slug : null,
    nome: nome || DEFAULT_TENANT.nome,
    logoUrl: safeUrl(raw.logoUrl),
    cores: {
      primaria: isHexColor(cores.primaria) ? cores.primaria : undefined,
      secundaria: isHexColor(cores.secundaria) ? cores.secundaria : undefined,
    },
  };
}

export async function fetchTenantConfig(signal?: AbortSignal): Promise<TenantConfig> {
  const res = await identidadeVisual({ signal });
  if (res.status !== 200) throw new Error(`GET /tenant/configuracoes falhou (${res.status})`);

  const { slug, nome_fantasia, identidade_visual: visual } = res.data;
  return sanitize({
    slug,
    nome: visual.nome_exibicao || nome_fantasia,
    logoUrl: visual.logo_url,
    cores: { primaria: visual.cor_primaria, secundaria: visual.cor_secundaria },
  });
}

/** Último config conhecido da funerária: evita o "flash" com as cores padrão a cada reload. */
export function readCachedTenant(slug: string | null): TenantConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const config = sanitize(JSON.parse(raw) as TenantConfig);
    return config.slug === slug ? config : null;
  } catch {
    return null;
  }
}

export function cacheTenant(config: TenantConfig): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch {
    // ignora
  }
}
