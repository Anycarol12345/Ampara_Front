import { useMemo } from 'react';
import { hasRole } from './roles';
import { useAuth } from './useAuth';

/**
 * Controle de interface por perfil. Só esconde ações: a segurança real é do backend,
 * que valida o perfil em cada requisição.
 */
export function usePermissao() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return useMemo(
    () => ({
      role,
      /** true se o perfil do usuário logado está na lista. Sem sessão, sempre false. */
      pode: (perfis: readonly string[]): boolean => role !== null && hasRole(role, perfis),
    }),
    [role],
  );
}
