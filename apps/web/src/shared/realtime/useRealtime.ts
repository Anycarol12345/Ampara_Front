import { useContext, useEffect, useRef } from 'react';
import { RealtimeContext, type RealtimeStatus } from './realtime-context';

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime deve ser usado dentro de <RealtimeProvider>');
  return ctx;
}

export function useRealtimeStatus(): RealtimeStatus {
  return useRealtime().status;
}

/**
 * Escuta um evento do hub enquanto o componente está montado.
 * O payload vem do servidor: o tipo T é uma declaração, não uma validação.
 */
export function useRealtimeEvent<T>(event: string, handler: (payload: T) => void): void {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(
    () => subscribe(event, (payload) => handlerRef.current(payload as T)),
    [event, subscribe],
  );
}
