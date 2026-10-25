import { createContext } from 'react';

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface RealtimeContextValue {
  status: RealtimeStatus;
  /** Inscreve-se em um evento do hub. Retorna a função que cancela. */
  subscribe: (event: string, handler: (payload: unknown) => void) => () => void;
  /** Dispara um evento só localmente (testes e simulações). Não envia nada ao servidor. */
  emitLocal: (event: string, payload: unknown) => void;
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);
