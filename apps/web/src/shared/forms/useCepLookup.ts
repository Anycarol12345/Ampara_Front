import { useEffect, useRef, useState } from 'react';
import { onlyDigits } from './masks';
import { fetchAddressByCep, type Address } from './viacep';

export type CepLookupStatus = 'idle' | 'loading' | 'found' | 'notFound' | 'error';

/**
 * Busca o endereço quando o CEP fica completo (8 dígitos) e chama `onFound`.
 * Recurso opcional: se o serviço falhar, o usuário preenche o endereço manualmente.
 */
export function useCepLookup(cep: string, onFound: (address: Address) => void): CepLookupStatus {
  const [result, setResult] = useState<{
    cep: string;
    status: 'found' | 'notFound' | 'error';
  } | null>(null);
  const onFoundRef = useRef(onFound);
  useEffect(() => {
    onFoundRef.current = onFound;
  });

  const digits = onlyDigits(cep);
  const complete = digits.length === 8;

  useEffect(() => {
    if (!complete) return;
    const controller = new AbortController();

    fetchAddressByCep(digits, controller.signal)
      .then((address) => {
        if (address) onFoundRef.current(address);
        setResult({ cep: digits, status: address ? 'found' : 'notFound' });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ cep: digits, status: 'error' });
      });

    return () => controller.abort();
  }, [complete, digits]);

  if (!complete) return 'idle';
  return result?.cep === digits ? result.status : 'loading';
}
