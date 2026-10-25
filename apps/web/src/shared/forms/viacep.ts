import { onlyDigits } from './masks';

export interface Address {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface ViaCepResponse {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

/** Consulta o ViaCEP. Retorna null se o CEP não existe; lança erro se o serviço falhar. */
export async function fetchAddressByCep(
  cep: string,
  signal?: AbortSignal,
): Promise<Address | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal });
  if (!res.ok) throw new Error(`ViaCEP respondeu ${res.status}`);

  const data = (await res.json()) as ViaCepResponse;
  if (data.erro) return null;

  return {
    logradouro: data.logradouro ?? '',
    bairro: data.bairro ?? '',
    cidade: data.localidade ?? '',
    uf: data.uf ?? '',
  };
}
