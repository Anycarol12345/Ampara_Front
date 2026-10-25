import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth';

/**
 * Limpa o cache quando a sessão acaba ou troca de usuário, para dados de uma sessão
 * nunca aparecerem na seguinte. Reage ao estado da sessão (e não ao botão "Sair"),
 * então também cobre a sessão expirada pelo servidor.
 */
export function QueryAuthSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current !== null && previous.current !== userId) {
      void queryClient.cancelQueries();
      queryClient.clear();
    }
    previous.current = userId;
  }, [userId, queryClient]);

  return null;
}
