import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAccessToken, refreshSession, useAuth } from '@/features/auth';
import { env } from '@/shared/lib/env';
import { resolveTenantSlug } from '@/shared/lib/tenant-slug';
import { EventBus, RealtimeContext, type RealtimeStatus } from '@/shared/realtime';
import { HUB_PATH, REALTIME_EVENTS, RECONNECT_DELAYS } from './realtime-config';
import { expiresWithin } from './token';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Token enviado ao hub. Chamado a cada (re)conexão, então renova se estiver para vencer. */
async function getFreshToken(): Promise<string> {
  const current = getAccessToken();
  if (current && !expiresWithin(current, 30)) return current;
  return (await refreshSession()) ?? '';
}

function buildHubUrl(): string {
  const url = new URL(`${env.apiUrl}${HUB_PATH}`);
  const tenant = resolveTenantSlug();
  // PROVISÓRIO: o WebSocket do navegador não envia cabeçalhos; confirmar como o hub lê o tenant.
  if (tenant) url.searchParams.set('tenant', tenant);
  return url.toString();
}

/**
 * Conexão única com o hub, ligada enquanto houver sessão. Ao sair (ou expirar), a conexão
 * é encerrada. As mensagens viram eventos no `EventBus` e as telas escutam por
 * `useRealtimeEvent`.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [bus] = useState(() => new EventBus());
  const [status, setStatus] = useState<RealtimeStatus>('connecting');

  useEffect(() => {
    if (!userId) return;

    let disposed = false;
    const update = (next: RealtimeStatus) => {
      if (!disposed) setStatus(next);
    };

    const connection = new HubConnectionBuilder()
      .withUrl(buildHubUrl(), { accessTokenFactory: getFreshToken })
      .withAutomaticReconnect(RECONNECT_DELAYS)
      .configureLogging(import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning)
      .build();

    for (const event of REALTIME_EVENTS) {
      connection.on(event, (payload: unknown) => bus.emit(event, payload));
    }

    // Eventos enviados enquanto estávamos fora do ar se perderam: relê o que está na tela.
    const resync = () => void queryClient.invalidateQueries();

    connection.onreconnecting(() => update('reconnecting'));
    connection.onreconnected(() => {
      update('connected');
      resync();
    });

    /** Conecta; se falhar, tenta de novo com espera crescente até conseguir ou ser encerrado. */
    async function connect(isRecovery: boolean): Promise<void> {
      let attempt = 0;
      while (!disposed) {
        try {
          await connection.start();
          if (disposed) return;
          update('connected');
          if (isRecovery) resync();
          return;
        } catch {
          if (disposed) return;
          update('disconnected');
          attempt += 1;
          await wait(Math.min(30_000, 1_000 * 2 ** attempt));
        }
      }
    }

    // Chamado quando a reconexão automática desiste (ou a conexão cai de vez).
    connection.onclose(() => {
      if (disposed) return;
      update('disconnected');
      void connect(true);
    });

    void connect(false);

    return () => {
      disposed = true;
      setStatus('connecting'); // pronto para a próxima sessão
      void connection.stop();
    };
  }, [userId, bus, queryClient]);

  const value = useMemo(
    () => ({
      status: userId ? status : ('disconnected' as const),
      subscribe: bus.on,
      emitLocal: bus.emit,
    }),
    [userId, status, bus],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
