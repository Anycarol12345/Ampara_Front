import { ApiError, type LoginResponse } from '@ampara/api-client';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '@/test/server';
import {
  expireSession,
  getAccessToken,
  getCurrentUser,
  refreshSession,
  signIn,
  signOut,
} from './session';

const sessao: LoginResponse = {
  access_token: 'token-abc',
  expira_em: '2030-01-01T00:00:00Z',
  usuario: { id: 'u-1', nome: 'Maria', role: 'CLIENTE' },
};

const loginOk = http.post('*/api/v1/auth/login', () => HttpResponse.json(sessao));

beforeEach(() => expireSession());

describe('signIn', () => {
  it('guarda o token e o usuário só em memória', async () => {
    server.use(loginOk);

    const usuario = await signIn('maria@exemplo.com', 'segredo123');

    expect(usuario).toEqual(sessao.usuario);
    expect(getAccessToken()).toBe('token-abc');
    expect(getCurrentUser()).toEqual(sessao.usuario);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('credenciais erradas viram ApiError e não criam sessão', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        HttpResponse.json({ detail: 'E-mail ou senha inválidos' }, { status: 401 }),
      ),
    );

    const error = await signIn('maria@exemplo.com', 'errada').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toHaveProperty('status', 401);
    expect((error as ApiError).message).toBe('E-mail ou senha inválidos');
    expect(getAccessToken()).toBeNull();
  });
});

describe('signOut', () => {
  it('avisa o servidor (revoga o refresh token) e limpa a sessão', async () => {
    let logoutChamado = false;
    server.use(
      loginOk,
      http.post('*/api/v1/auth/logout', () => {
        logoutChamado = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await signIn('maria@exemplo.com', 'segredo123');

    await signOut();

    expect(logoutChamado).toBe(true);
    expect(getAccessToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });

  it('encerra a sessão local mesmo quando a chamada ao servidor falha', async () => {
    server.use(
      loginOk,
      http.post('*/api/v1/auth/logout', () => HttpResponse.error()),
    );
    await signIn('maria@exemplo.com', 'segredo123');

    await expect(signOut()).resolves.toBeUndefined();

    expect(getAccessToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });
});

describe('refreshSession', () => {
  it('troca o cookie por um novo token', async () => {
    server.use(http.post('*/api/v1/auth/refresh', () => HttpResponse.json(sessao)));

    await expect(refreshSession()).resolves.toBe('token-abc');
    expect(getCurrentUser()).toEqual(sessao.usuario);
  });

  it('devolve null e limpa a sessão quando a renovação é recusada', async () => {
    server.use(http.post('*/api/v1/auth/refresh', () => new HttpResponse(null, { status: 401 })));

    await expect(refreshSession()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('chamadas simultâneas compartilham uma única renovação', async () => {
    let chamadas = 0;
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        chamadas += 1;
        return HttpResponse.json(sessao);
      }),
    );

    await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    // O backend revoga todas as sessões se o mesmo refresh token for usado duas vezes (AUT-03).
    expect(chamadas).toBe(1);
  });
});
