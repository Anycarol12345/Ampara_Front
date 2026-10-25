import { ApiError } from '@ampara/api-client';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { applyApiErrors } from './apply-api-errors';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function makeForm(values: Record<string, unknown>) {
  const setError = vi.fn();
  const form = { getValues: () => values, setError } as never;
  return { form, setError };
}

describe('applyApiErrors', () => {
  it('aplica os erros nos campos, ignorando maiúsculas, e foca o primeiro', () => {
    const { form, setError } = makeForm({ cpf: '', email: '' });
    const error = new ApiError(400, {
      errors: {
        Cpf: ['Já existe um cliente com este CPF.'],
        Email: ['E-mail já cadastrado.'],
      },
    });

    expect(applyApiErrors(form, error)).toBe(true);
    expect(setError).toHaveBeenNthCalledWith(
      1,
      'cpf',
      { type: 'server', message: 'Já existe um cliente com este CPF.' },
      { shouldFocus: true },
    );
    expect(setError).toHaveBeenNthCalledWith(
      2,
      'email',
      { type: 'server', message: 'E-mail já cadastrado.' },
      { shouldFocus: false },
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('resolve campos aninhados e listas', () => {
    const { form, setError } = makeForm({ endereco: { cep: '' }, dependentes: [{ nome: '' }] });
    const error = new ApiError(400, {
      errors: { 'Endereco.Cep': ['CEP inexistente'], 'Dependentes[0].Nome': ['Nome obrigatório'] },
    });

    expect(applyApiErrors(form, error)).toBe(true);
    expect(setError).toHaveBeenCalledWith('endereco.cep', expect.anything(), expect.anything());
    expect(setError).toHaveBeenCalledWith(
      'dependentes.0.nome',
      expect.anything(),
      expect.anything(),
    );
  });

  it('usa o fieldMap quando o nome da API não casa com o do formulário', () => {
    const { form, setError } = makeForm({ cpf: '' });
    const error = new ApiError(400, { errors: { Documento: ['Documento inválido'] } });

    applyApiErrors(form, error, { fieldMap: { Documento: 'cpf' } });

    expect(setError).toHaveBeenCalledWith('cpf', expect.anything(), expect.anything());
  });

  it('mostra toast quando o erro não tem detalhe por campo', () => {
    const { form, setError } = makeForm({ cpf: '' });

    expect(applyApiErrors(form, new ApiError(409, { detail: 'CPF já cadastrado' }))).toBe(false);
    expect(setError).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('CPF já cadastrado');
  });

  it('aplica o que casa e manda o resto para o toast', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { form, setError } = makeForm({ cpf: '' });
    const error = new ApiError(400, {
      errors: { Cpf: ['CPF inválido'], Desconhecido: ['Algo mais'] },
    });

    expect(applyApiErrors(form, error)).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Algo mais');
    warn.mockRestore();
  });

  it('trata erro que não é da API com a mensagem padrão', () => {
    const { form } = makeForm({});

    expect(applyApiErrors(form, new Error('boom'))).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Algo deu errado. Tente novamente.');
  });
});
