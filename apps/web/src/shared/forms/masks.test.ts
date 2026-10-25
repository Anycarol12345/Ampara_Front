import { describe, expect, it } from 'vitest';
import { maskCep, maskCpf, maskPhone, maskUf, onlyDigits } from './masks';

describe('onlyDigits', () => {
  it('remove tudo que não é dígito', () => {
    expect(onlyDigits('(11) 9-8')).toBe('1198');
  });
});

describe('maskCpf', () => {
  it('formata o CPF completo', () => {
    expect(maskCpf('52998224725')).toBe('529.982.247-25');
  });

  it('formata enquanto o usuário digita', () => {
    expect(maskCpf('5')).toBe('5');
    expect(maskCpf('5299')).toBe('529.9');
    expect(maskCpf('529982')).toBe('529.982');
    expect(maskCpf('5299822')).toBe('529.982.2');
    expect(maskCpf('5299822472')).toBe('529.982.247-2');
  });

  it('ignora letras e limita a 11 dígitos', () => {
    expect(maskCpf('529.982.247-25999')).toBe('529.982.247-25');
    expect(maskCpf('abc')).toBe('');
  });
});

describe('maskPhone', () => {
  it('formata celular (11 dígitos) e fixo (10 dígitos)', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
    expect(maskPhone('1134567890')).toBe('(11) 3456-7890');
  });

  it('formata enquanto o usuário digita', () => {
    expect(maskPhone('')).toBe('');
    expect(maskPhone('1')).toBe('(1');
    expect(maskPhone('11')).toBe('(11');
    expect(maskPhone('119')).toBe('(11) 9');
  });
});

describe('maskCep', () => {
  it('coloca o hífen depois do quinto dígito', () => {
    expect(maskCep('01001000')).toBe('01001-000');
    expect(maskCep('01001')).toBe('01001');
    expect(maskCep('010010')).toBe('01001-0');
  });

  it('ignora letras', () => {
    expect(maskCep('abc')).toBe('');
  });
});

describe('maskUf', () => {
  it('mantém só duas letras maiúsculas', () => {
    expect(maskUf('sp')).toBe('SP');
    expect(maskUf('sp1x')).toBe('SP');
    expect(maskUf('')).toBe('');
  });
});
