import {
  login,
  logout,
  renovarSessao,
  type LoginResponse,
  type UsuarioSessao,
} from '@ampara/api-client';

/**
 * Sessão em memória. O access token (15 min) nunca vai para localStorage;
 * o refresh token fica em cookie httpOnly, fora do alcance do JavaScript.
 */
let accessToken: string | null = null;
let currentUser: UsuarioSessao | null = null;
const listeners = new Set<(user: UsuarioSessao | null) => void>();

export const getAccessToken = () => accessToken;
export const getCurrentUser = () => currentUser;

export function subscribeSession(listener: (user: UsuarioSessao | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSession(session: LoginResponse | null) {
  accessToken = session?.access_token ?? null;
  currentUser = session?.usuario ?? null;
  listeners.forEach((l) => l(currentUser));
}

export async function signIn(email: string, senha: string): Promise<UsuarioSessao> {
  const res = await login({ email, senha });
  if (res.status !== 200) throw new Error(`Login inesperado (${res.status})`);
  setSession(res.data);
  return res.data.usuario;
}

export async function signOut(): Promise<void> {
  try {
    await logout();
  } catch {
    // Sem conexão ou sessão já expirada: encerra localmente do mesmo jeito.
  } finally {
    setSession(null);
  }
}

const REFRESH_LOCK = 'ampara:refresh-session';
let refreshing: Promise<string | null> | null = null;

async function requestNewSession(): Promise<string | null> {
  try {
    const res = await renovarSessao();
    if (res.status !== 200) return null;
    setSession(res.data);
    return res.data.access_token;
  } catch {
    setSession(null);
    return null;
  }
}

/**
 * Troca o refresh token (cookie) por um access token novo.
 * O backend rotaciona o refresh token a cada uso e revoga todas as sessões se um token
 * já usado for reapresentado (AUT-03). Por isso:
 * - uma única chamada por vez nesta aba (`refreshing`);
 * - uma única chamada por vez entre abas (Web Locks): a segunda aba espera a primeira
 *   terminar e então usa o cookie já rotacionado, que o navegador compartilha.
 */
export function refreshSession(): Promise<string | null> {
  refreshing ??= (
    navigator.locks ? navigator.locks.request(REFRESH_LOCK, requestNewSession) : requestNewSession()
  ).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** Sessão encerrada pelo servidor (renovação falhou): limpa o estado local. */
export function expireSession(): void {
  setSession(null);
}
