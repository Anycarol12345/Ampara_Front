import { z } from 'zod';
import { onlyDigits } from './masks';

/* ---------- validadores (funções puras) ---------- */

export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digits = d.split('').map(Number);
  const check = (len: number): number => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += (digits[i] ?? 0) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === digits[9] && check(10) === digits[10];
}

export function isValidPhone(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0, 2)) < 11) return false; // DDD
  return d.length === 10 || d[2] === '9'; // celular começa com 9
}

export const isValidCep = (value: string): boolean => onlyDigits(value).length === 8;

/** Data real no formato YYYY-MM-DD (rejeita 2024-02-31). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function todayIso(): string {
  const t = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

/* ---------- schemas reutilizáveis ----------
 * Entram o texto mascarado do input; saem valores prontos para a API (só dígitos). */

export const cpfSchema = z
  .string()
  .trim()
  .min(1, 'Informe o CPF')
  .refine(isValidCpf, 'CPF inválido')
  .transform(onlyDigits);

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Informe o telefone')
  .refine(isValidPhone, 'Telefone inválido')
  .transform(onlyDigits);

export const cepSchema = z
  .string()
  .trim()
  .min(1, 'Informe o CEP')
  .refine(isValidCep, 'CEP inválido')
  .transform(onlyDigits);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Informe o e-mail')
  .pipe(z.email('E-mail inválido'));

/** PROVISÓRIO: confirmar a política de senha do backend e espelhá-la aqui. */
export const PASSWORD_MIN_LENGTH = 8;
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);

/** No login não se valida a força da senha, só que foi preenchida. */
export const loginPasswordSchema = z.string().min(1, 'Informe a senha');

export const dateSchema = z
  .string()
  .min(1, 'Informe a data')
  .refine(isValidIsoDate, 'Data inválida');

export const birthDateSchema = dateSchema
  .refine((v) => v <= todayIso(), 'A data não pode ser futura')
  .refine((v) => v >= '1900-01-01', 'Data inválida');

/** Campo opcional: vazio vira undefined; preenchido segue a validação. */
export function optionalDigits(isValid: (value: string) => boolean, message: string) {
  return z
    .string()
    .trim()
    .refine((v) => v === '' || isValid(v), message)
    .transform((v) => (v === '' ? undefined : onlyDigits(v)));
}

export const optionalPhoneSchema = optionalDigits(isValidPhone, 'Telefone inválido');
