export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/** 000.000.000-00 */
export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  const [a, b, c, e] = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)] as const;
  let out = a;
  if (b) out += `.${b}`;
  if (c) out += `.${c}`;
  if (e) out += `-${e}`;
  return out;
}

/** (00) 0000-0000 ou (00) 00000-0000 */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 6) return `(${ddd}) ${rest}`;
  const split = d.length > 10 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** 00000-000 */
export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Sigla do estado: 2 letras maiúsculas. */
export function maskUf(value: string): string {
  return value
    .replace(/[^a-z]/gi, '')
    .toUpperCase()
    .slice(0, 2);
}
