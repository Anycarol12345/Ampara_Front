import { PATHS } from './paths';

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

export const AREA_ROLES = {
  cliente: [ROLE.CLIENTE],
  interna: [ROLE.GESTOR, ROLE.FUNCIONARIO],
  plataforma: [ROLE.ADMIN],
} as const satisfies Record<string, readonly string[]>;

export function hasRole(role: string, allowed: readonly string[]): boolean {
  const current = role.toUpperCase();
  return allowed.some((r) => r.toUpperCase() === current);
}

/** Área inicial de cada perfil (usada para redirecionar depois do login). */
export function homeForRole(role: string): string {
  if (hasRole(role, AREA_ROLES.plataforma)) return PATHS.plataforma;
  if (hasRole(role, AREA_ROLES.interna)) return PATHS.interna;
  if (hasRole(role, AREA_ROLES.cliente)) return PATHS.cliente;
  return PATHS.home;
}
