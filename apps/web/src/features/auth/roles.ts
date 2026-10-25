/**
 * PROVISÓRIO: os valores de `role` ainda não foram confirmados com o backend
 * (UsuarioSessao.role é string). Quando confirmarem, ajuste apenas este arquivo.
 */
export const ROLE = {
  ADMIN: 'ADMIN',
  GESTOR: 'GESTOR',
  FUNCIONARIO: 'FUNCIONARIO',
  CLIENTE: 'CLIENTE',
} as const;

export function hasRole(role: string, allowed: readonly string[]): boolean {
  const current = role.toUpperCase();
  return allowed.some((r) => r.toUpperCase() === current);
}
