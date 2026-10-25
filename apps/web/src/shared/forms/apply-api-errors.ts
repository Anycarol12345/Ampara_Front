import { isApiError } from '@ampara/api-client';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/api-error';

/** Caminhos de todos os campos: { a: { b: '' }, c: [''] } -> ['a.b', 'c.0']. */
function collectPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectPaths(item, prefix ? `${prefix}.${i}` : String(i)));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) =>
      collectPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return prefix ? [prefix] : [];
}

/** 'Endereco.Cep', 'endereco_cep' e 'dependentes[0].Nome' viram chaves comparáveis. */
function normalizeKey(key: string): string {
  return key
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .map((part) => part.replace(/[^a-z0-9]/gi, '').toLowerCase())
    .join('.');
}

export interface ApplyApiErrorsOptions {
  /** Chave da API -> caminho do campo no formulário. Só para nomes que não casam sozinhos. */
  fieldMap?: Record<string, string>;
}

/**
 * Aplica os erros 400 (ProblemDetails.errors) nos campos correspondentes.
 * Mensagens que não casam com nenhum campo, e erros sem detalhe por campo
 * (409, 500...), viram toast. Retorna true se ao menos um campo recebeu erro.
 * O formulário deve usar `meta: { silentError: true }` na mutation para não duplicar o toast.
 */
export function applyApiErrors<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, 'getValues' | 'setError'>,
  error: unknown,
  options: ApplyApiErrorsOptions = {},
): boolean {
  if (!isApiError(error)) {
    toast.error(getErrorMessage(error));
    return false;
  }

  const lookup = new Map(collectPaths(form.getValues()).map((path) => [normalizeKey(path), path]));
  const fieldMap = Object.fromEntries(
    Object.entries(options.fieldMap ?? {}).map(([key, path]) => [normalizeKey(key), path]),
  );

  const unmatchedKeys: string[] = [];
  const unmatchedMessages: string[] = [];
  let applied = 0;

  for (const [key, raw] of Object.entries(error.errors)) {
    const message = (Array.isArray(raw) ? raw : [String(raw)]).join(' ');
    const normalized = normalizeKey(key);
    const target = fieldMap[normalized] ?? lookup.get(normalized);

    if (target) {
      form.setError(target as Path<T>, { type: 'server', message }, { shouldFocus: applied === 0 });
      applied += 1;
    } else {
      unmatchedKeys.push(key);
      unmatchedMessages.push(message);
    }
  }

  if (import.meta.env.DEV && unmatchedKeys.length > 0) {
    console.warn('[applyApiErrors] chaves sem campo correspondente:', unmatchedKeys);
  }

  if (applied === 0) {
    toast.error(getErrorMessage(error));
    return false;
  }
  if (unmatchedMessages.length > 0) toast.error(unmatchedMessages.join(' '));
  return true;
}
