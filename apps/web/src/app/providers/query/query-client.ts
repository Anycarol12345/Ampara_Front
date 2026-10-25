import { isApiError } from '@ampara/api-client';
import { MutationCache, QueryCache, QueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/api-error';

interface QueryMeta extends Record<string, unknown> {
  /** Não mostra toast se a query falhar. */
  silentError?: boolean;
}

interface MutationMeta extends Record<string, unknown> {
  /** Não mostra toast se a mutation falhar (ex.: o formulário já exibe o erro). */
  silentError?: boolean;
  /** Chaves de cache invalidadas depois que a mutation der certo. */
  invalidates?: readonly QueryKey[];
  /** Toast de sucesso. */
  successMessage?: string;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: QueryMeta;
    mutationMeta: MutationMeta;
  }
}

const MAX_RETRIES = 2;

/** Repete só falhas transitórias (rede, 5xx, 408, 429). Erros 4xx não melhoram ao repetir. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return error.status === 408 || error.status === 429;
  }
  return true;
}

function notifyError(error: unknown): void {
  // 401: o client já tentou renovar e encerrou a sessão; o guard de rota leva ao login.
  if (isApiError(error) && error.status === 401) return;
  const message = getErrorMessage(error);
  toast.error(message, { id: message }); // mesmo texto não empilha toasts
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silentError) return;
      // Sem dados em tela, o componente mostra o ErrorState. Toast só quando uma
      // atualização em segundo plano falha e o usuário continua vendo dados antigos.
      if (query.state.data === undefined) return;
      notifyError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silentError) return;
      notifyError(error);
    },
    onSuccess: async (_data, _variables, _context, mutation) => {
      if (mutation.meta?.successMessage) toast.success(mutation.meta.successMessage);
      const keys = mutation.meta?.invalidates;
      if (!keys?.length) return;
      // Aguarda a atualização: a mutation só termina com a lista já atualizada.
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // repetir um POST pode duplicar registros
    },
  },
});
