import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EmptyState, type EmptyStateProps } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

interface QueryStateProps<T> {
  query: UseQueryResult<T>;
  /** Padrão: lista vazia. Para outros formatos (ex.: página com `itens`), informe a regra. */
  isEmpty?: (data: T) => boolean;
  empty?: EmptyStateProps;
  loading?: ReactNode;
  children: (data: T) => ReactNode;
}

const DEFAULT_EMPTY: EmptyStateProps = { title: 'Nenhum registro encontrado' };

export function QueryState<T>({ query, isEmpty, empty, loading, children }: QueryStateProps<T>) {
  const { data } = query;

  if (data === undefined) {
    if (query.isError) {
      return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
    }
    return loading ?? <LoadingState />;
  }

  const vazio = isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0;
  if (vazio) return <EmptyState {...(empty ?? DEFAULT_EMPTY)} />;

  return <>{children(data)}</>;
}
