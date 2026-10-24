/**
 * Transporte HTTP do client gerado pelo Orval (mutator).
 * O app configura uma vez com `configureApiClient` (URL, tenant, token e renovação de sessão).
 */

export interface ApiClientConfig {
  /** Origem da API, sem barra final nem /api/v1 (ex.: http://localhost:5080). */
  baseUrl: string;
  /** Slug da funerária, enviado no cabeçalho X-Tenant. Retorne null no domínio da plataforma (ADMIN). */
  getTenant: () => string | null;
  getAccessToken: () => string | null;
  /** Troca o refresh token (cookie) por um access token novo. Retorna null se a sessão acabou. */
  refreshAccessToken: () => Promise<string | null>;
  /** Chamado quando a sessão não pôde ser renovada. */
  onSessionExpired?: () => void;
}

let config: ApiClientConfig | null = null;

export function configureApiClient(next: ApiClientConfig): void {
  config = next;
}

/**
 * Erro único do client: respostas não-2xx no formato ProblemDetails do backend
 * (code, trace_id, errors por campo) e falhas de rede (status 0).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly traceId: string | undefined;
  readonly errors: Record<string, string[]>;

  constructor(status: number, problem: Record<string, unknown>) {
    const detail = typeof problem.detail === 'string' ? problem.detail : undefined;
    const title = typeof problem.title === 'string' ? problem.title : undefined;
    super(detail ?? title ?? `Erro ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = typeof problem.code === 'string' ? problem.code : undefined;
    this.traceId = typeof problem.trace_id === 'string' ? problem.trace_id : undefined;
    this.errors =
      typeof problem.errors === 'object' && problem.errors !== null
        ? (problem.errors as Record<string, string[]>)
        : {};
  }

  /** Falha de conexão: a requisição não chegou a receber resposta. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const AUTH_ROUTES = ['/auth/login', '/auth/refresh', '/auth/logout'];

let refreshing: Promise<string | null> | null = null;

/** Várias requisições com 401 ao mesmo tempo compartilham uma única renovação. */
function refreshOnce(cfg: ApiClientConfig): Promise<string | null> {
  refreshing ??= cfg.refreshAccessToken().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function send(
  cfg: ApiClientConfig,
  url: string,
  options: RequestInit,
  token: string | null,
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  const tenant = cfg.getTenant();
  if (tenant) headers.set('X-Tenant', tenant);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // credentials: o refresh token trafega em cookie httpOnly entre a SPA e a API.
  return fetch(`${cfg.baseUrl}${url}`, { ...options, headers, credentials: 'include' });
}

async function sendSafely(
  cfg: ApiClientConfig,
  url: string,
  options: RequestInit,
  token: string | null,
): Promise<Response> {
  try {
    return await send(cfg, url, options, token);
  } catch (cause) {
    // Cancelamento pedido pelo chamador (ex.: TanStack Query) não é erro de rede.
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError(0, {
      title: 'Não foi possível conectar ao servidor.',
      code: 'network_error',
    });
  }
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Mutator do Orval: devolve { data, status, headers } e lança ApiError em respostas não-2xx. */
export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (!config)
    throw new Error('API client não configurado: chame configureApiClient() no início do app.');
  const cfg = config;
  const isAuthRoute = AUTH_ROUTES.some((route) => url.includes(route));

  const sentToken = cfg.getAccessToken();
  let res = await sendSafely(cfg, url, options, sentToken);

  if (res.status === 401 && !isAuthRoute) {
    // Se outra requisição já renovou o token enquanto esta estava em voo, reaproveita-o.
    const current = cfg.getAccessToken();
    const token = current && current !== sentToken ? current : await refreshOnce(cfg);

    if (token) {
      res = await sendSafely(cfg, url, options, token);
      if (res.status === 401) cfg.onSessionExpired?.();
    } else {
      cfg.onSessionExpired?.();
    }
  }

  const data = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {},
    );
  }

  return { data, status: res.status, headers: res.headers } as T;
}
