/**
 * Lê o `exp` do JWT sem validar a assinatura. Serve só para decidir se vale renovar
 * antes de conectar; quem valida o token é o servidor.
 */
export function expiresWithin(token: string, seconds: number): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' && exp * 1000 - Date.now() < seconds * 1000;
  } catch {
    return false;
  }
}
