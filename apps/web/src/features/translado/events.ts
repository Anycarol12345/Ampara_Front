/** PROVISÓRIO: confirmar com o backend os nomes dos eventos do hub. */
export const TRANSLADO_EVENTOS = {
  atualizado: 'TransladoAtualizado',
} as const;

/** PROVISÓRIO: confirmar o formato real do payload. */
export interface TransladoEvento {
  id: string;
  status: string;
}
