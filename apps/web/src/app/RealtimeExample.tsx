import { useQuery } from '@tanstack/react-query';
import { transladoKeys, TRANSLADO_EVENTOS, useTransladoTempoReal } from '@/features/translado';
import { ConnectionIndicator, useRealtime } from '@/shared/realtime';
import { Button } from '@/shared/ui/button';

// "Servidor" falso: o refetch depois do evento devolve o valor novo.
const servidor = { id: '1', status: 'AGENDADO' };

/** Exemplo de referência (rota temporária). Remover quando houver telas reais de translado. */
export function RealtimeExample() {
  const { emitLocal } = useRealtime();
  useTransladoTempoReal();

  const translado = useQuery({
    queryKey: transladoKeys.detail('1'),
    queryFn: async () => ({ ...servidor }),
    staleTime: Infinity,
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="section-title">Tempo real</h1>
      <ConnectionIndicator />
      <p>
        Status do translado 1: <strong>{translado.data?.status ?? '…'}</strong>
      </p>
      <Button
        onClick={() => {
          servidor.status = servidor.status === 'AGENDADO' ? 'EM_TRANSITO' : 'AGENDADO';
          emitLocal(TRANSLADO_EVENTOS.atualizado, { id: '1', status: servidor.status });
        }}
      >
        Simular evento do servidor
      </Button>
    </main>
  );
}
