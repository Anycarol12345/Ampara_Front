import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';
import {
  birthDateSchema,
  cepSchema,
  cpfSchema,
  emailSchema,
  isValidCep,
  isValidCpf,
  isValidIsoDate,
  isValidPhone,
  optionalPhoneSchema,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
  phoneSchema,
} from './schemas';

function messages(schema: ZodType, value: unknown): string[] {
  const result = schema.safeParse(value);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('isValidCpf', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35'])('aceita %s', (cpf) => {
    expect(isValidCpf(cpf)).toBe(true);
  });

  it.each(['', '123', '111.111.111-11', '529.982.247-26', '123.456.789-00'])(
    'rejeita "%s"',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(false);
    },
  );
});

describe('isValidPhone', () => {
  it.each(['(11) 98765-4321', '11987654321', '(11) 3456-7890', '1134567890'])(
    'aceita %s',
    (phone) => {
      expect(isValidPhone(phone)).toBe(true);
    },
  );

  it.each(['', '119876543', '(10) 98765-4321', '(11) 88765-4321'])('rejeita "%s"', (phone) => {
    expect(isValidPhone(phone)).toBe(false);
  });
});

describe('isValidCep', () => {
  it('aceita 8 dígitos, com ou sem hífen', () => {
    expect(isValidCep('01001-000')).toBe(true);
    expect(isValidCep('01001000')).toBe(true);
  });

  it('rejeita tamanho errado', () => {
    expect(isValidCep('0100-000')).toBe(false);
    expect(isValidCep('')).toBe(false);
  });
});

describe('isValidIsoDate', () => {
  it('aceita datas reais, inclusive 29 de fevereiro em ano bissexto', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('1990-05-20')).toBe(true);
  });

  it('rejeita datas inexistentes e formatos errados', () => {
    expect(isValidIsoDate('2023-02-29')).toBe(false);
    expect(isValidIsoDate('2024-02-31')).toBe(false);
    expect(isValidIsoDate('20/05/1990')).toBe(false);
  });
});

describe('cpfSchema', () => {
  it('devolve só os dígitos', () => {
    expect(cpfSchema.parse('529.982.247-25')).toBe('52998224725');
  });

  it('informa CPF inválido', () => {
    expect(messages(cpfSchema, '111.111.111-11')).toContain('CPF inválido');
  });

  it('exige preenchimento', () => {
    expect(messages(cpfSchema, '')).toContain('Informe o CPF');
  });
});

describe('phoneSchema', () => {
  it('devolve só os dígitos', () => {
    expect(phoneSchema.parse('(11) 98765-4321')).toBe('11987654321');
  });

  it('informa telefone inválido e obrigatório', () => {
    expect(messages(phoneSchema, '123')).toContain('Telefone inválido');
    expect(messages(phoneSchema, '')).toContain('Informe o telefone');
  });
});

describe('cepSchema', () => {
  it('devolve só os dígitos', () => {
    expect(cepSchema.parse('01001-000')).toBe('01001000');
  });

  it('informa CEP inválido e obrigatório', () => {
    expect(messages(cepSchema, '0100')).toContain('CEP inválido');
    expect(messages(cepSchema, '')).toContain('Informe o CEP');
  });
});

describe('emailSchema', () => {
  it('remove espaços e converte para minúsculas', () => {
    expect(emailSchema.parse('  Maria@Email.COM ')).toBe('maria@email.com');
  });

  it('rejeita e-mail inválido', () => {
    expect(messages(emailSchema, 'maria@')).toContain('E-mail inválido');
  });

  it('exige preenchimento, inclusive só com espaços', () => {
    expect(messages(emailSchema, '')).toContain('Informe o e-mail');
    expect(messages(emailSchema, '   ')).toContain('Informe o e-mail');
  });
});

describe('passwordSchema', () => {
  it('respeita o tamanho mínimo', () => {
    expect(passwordSchema.safeParse('a'.repeat(PASSWORD_MIN_LENGTH - 1)).success).toBe(false);
    expect(passwordSchema.safeParse('a'.repeat(PASSWORD_MIN_LENGTH)).success).toBe(true);
  });
});

describe('birthDateSchema', () => {
  it('aceita uma data de nascimento válida', () => {
    expect(birthDateSchema.safeParse('1990-05-20').success).toBe(true);
  });

  it('rejeita data futura', () => {
    expect(messages(birthDateSchema, '2999-01-01')).toContain('A data não pode ser futura');
  });

  it('rejeita data muito antiga e data inexistente', () => {
    expect(messages(birthDateSchema, '1899-12-31')).toContain('Data inválida');
    expect(messages(birthDateSchema, '2023-02-29')).toContain('Data inválida');
  });

  it('exige preenchimento', () => {
    expect(messages(birthDateSchema, '')).toContain('Informe a data');
  });
});

describe('optionalPhoneSchema', () => {
  it('vazio vira undefined', () => {
    expect(optionalPhoneSchema.parse('')).toBeUndefined();
  });

  it('preenchido é validado e normalizado', () => {
    expect(optionalPhoneSchema.parse('(11) 98765-4321')).toBe('11987654321');
    expect(optionalPhoneSchema.safeParse('123').success).toBe(false);
  });
});
