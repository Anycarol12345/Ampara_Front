import { isApiError } from '@ampara/api-client';

const FALLBACK = 'Algo deu errado. Tente novamente.';

/**
 * Texto para mostrar ao usuário. Usa o `detail` do ProblemDetails (já resolvido pelo ApiError).
 * Em erros de validação (400/422), prefere a primeira mensagem de campo.
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 400 || error.status === 422) {
      const first = Object.values(error.errors).flat()[0];
      if (first) return first;
    }
    return error.message;
  }
  return FALLBACK;
}

/** Código para o usuário informar ao suporte (trace_id do backend). */
export function getTraceId(error: unknown): string | undefined {
  return isApiError(error) ? error.traceId : undefined;
}
