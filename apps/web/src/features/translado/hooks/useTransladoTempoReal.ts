import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeEvent } from '@/shared/realtime';
import { TRANSLADO_EVENTOS, type TransladoEvento } from '../events';
import { transladoKeys } from './translado-keys';

/**
 * Mantém o cache de translados em dia com os eventos do hub.
 * Chame uma vez na tela (ou layout) que mostra translados: enquanto estiver montado,
 * a lista e o detalhe se atualizam sem recarregar.
 */
export function useTransladoTempoReal(): void {
  const queryClient = useQueryClient();

  useRealtimeEvent<TransladoEvento>(TRANSLADO_EVENTOS.atualizado, (evento) => {
    // 1) Atualização imediata do detalhe que já está em cache.
    queryClient.setQueryData<Record<string, unknown>>(transladoKeys.detail(evento.id), (atual) =>
      atual ? { ...atual, status: evento.status } : atual,
    );
    // 2) Confirma com o servidor e atualiza listas (a posição do item pode mudar).
    void queryClient.invalidateQueries({ queryKey: transladoKeys.detail(evento.id) });
    void queryClient.invalidateQueries({ queryKey: transladoKeys.lists() });
  });
}
