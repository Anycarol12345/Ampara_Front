import { TRANSLADO_EVENTOS } from '@/features/translado';

/** PROVISÓRIO: caminho do hub no backend. */
export const HUB_PATH = '/hubs/tempo-real';

/** Atrasos entre tentativas de reconexão (ms). Esgotadas, o provider continua tentando por conta própria. */
export const RECONNECT_DELAYS = [0, 2_000, 5_000, 10_000, 20_000, 30_000];

/** Eventos do hub que o app escuta. Ao criar uma feature com tempo real, acrescente os eventos dela aqui. */
export const REALTIME_EVENTS: readonly string[] = [...Object.values(TRANSLADO_EVENTOS)];
