import { ApiError } from '@ampara/api-client';
import { describe, expect, it } from 'vitest';
import { getErrorMessage, getTraceId } from './api-error';

describe('getErrorMessage', () => {
  it('usa o detail do ProblemDetails', () => {
    expect(getErrorMessage(new ApiError(500, { detail: 'Falha no servidor' }))).toBe(
      'Falha no servidor',
    );
  });

  it('em erro de validação, prefere a mensagem do primeiro campo', () => {
    const error = new ApiError(400, {
      detail: 'Erros de validação',
      errors: { Nome: ['Informe o nome'] },
    });
    expect(getErrorMessage(error)).toBe('Informe o nome');
  });

  it('cai para o título e depois para o status', () => {
    expect(getErrorMessage(new ApiError(404, { title: 'Não encontrado' }))).toBe('Não encontrado');
    expect(getErrorMessage(new ApiError(404, {}))).toBe('Erro 404');
  });

  it('usa mensagem padrão para erros desconhecidos', () => {
    expect(getErrorMessage(new Error('x'))).toBe('Algo deu errado. Tente novamente.');
    expect(getErrorMessage(undefined)).toBe('Algo deu errado. Tente novamente.');
  });
});

describe('getTraceId', () => {
  it('devolve o trace_id da API', () => {
    expect(getTraceId(new ApiError(500, { trace_id: 'abc-123' }))).toBe('abc-123');
  });

  it('devolve undefined para outros erros', () => {
    expect(getTraceId(new Error('x'))).toBeUndefined();
  });
});
