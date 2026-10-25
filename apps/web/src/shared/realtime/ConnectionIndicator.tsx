import { cn } from '@/shared/lib/utils';
import type { RealtimeStatus } from './realtime-context';
import { useRealtimeStatus } from './useRealtime';

const LABEL: Record<RealtimeStatus, string> = {
  connected: 'Atualização em tempo real ativa',
  connecting: 'Conectando…',
  reconnecting: 'Reconectando…',
  disconnected: 'Sem conexão em tempo real',
};

const DOT: Record<RealtimeStatus, string> = {
  connected: 'bg-emerald-500',
  connecting: 'animate-pulse bg-amber-500',
  reconnecting: 'animate-pulse bg-amber-500',
  disconnected: 'bg-destructive',
};

/** Bolinha de status; o texto só aparece quando algo não está normal. */
export function ConnectionIndicator({ className }: { className?: string }) {
  const status = useRealtimeStatus();

  return (
    <span
      role="status"
      title={LABEL[status]}
      className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)}
    >
      <span aria-hidden className={cn('size-2 rounded-full', DOT[status])} />
      {status === 'connected' ? (
        <span className="sr-only">{LABEL[status]}</span>
      ) : (
        <span>{LABEL[status]}</span>
      )}
    </span>
  );
}
