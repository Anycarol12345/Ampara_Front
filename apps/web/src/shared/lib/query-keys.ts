/**
 * Fábrica de chaves de cache por feature, para invalidar de forma previsível.
 *
 *   export const clientesKeys = createQueryKeys('clientes');
 *   clientesKeys.list({ busca })  -> ['clientes', 'list', { busca }]
 *   clientesKeys.detail(id)       -> ['clientes', 'detail', id]
 *   clientesKeys.all              -> ['clientes']  (invalida tudo da feature)
 */
export function createQueryKeys<const F extends string>(feature: F) {
  return {
    all: [feature] as const,
    lists: () => [feature, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [feature, 'list', filters ?? {}] as const,
    details: () => [feature, 'detail'] as const,
    detail: (id: string) => [feature, 'detail', id] as const,
  };
}
