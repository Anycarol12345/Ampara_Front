import { hasRole, ROLE } from '@/features/auth';
import { PATHS } from './paths';

export const AREA_ROLES = {
  cliente: [ROLE.CLIENTE],
  interna: [ROLE.GESTOR, ROLE.FUNCIONARIO],
  plataforma: [ROLE.ADMIN],
} as const satisfies Record<string, readonly string[]>;

/** Área inicial de cada perfil (usada para redirecionar depois do login). */
export function homeForRole(role: string): string {
  if (hasRole(role, AREA_ROLES.plataforma)) return PATHS.plataforma;
  if (hasRole(role, AREA_ROLES.interna)) return PATHS.interna;
  if (hasRole(role, AREA_ROLES.cliente)) return PATHS.cliente;
  return PATHS.home;
}
