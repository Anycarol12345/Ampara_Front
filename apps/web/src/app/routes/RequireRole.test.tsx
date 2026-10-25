import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ROLE } from '@/features/auth';
import { renderRoutes, usuarioTeste } from '@/test/render';
import { PATHS } from './paths';
import { RequireRole } from './RequireRole';

const routes = [
  { path: PATHS.login, element: <p>Tela de login</p> },
  {
    path: PATHS.interna,
    element: <RequireRole allow={[ROLE.GESTOR, ROLE.FUNCIONARIO]} />,
    children: [{ index: true, element: <p>Painel interno</p> }],
  },
];

describe('RequireRole', () => {
  it('sem sessão, redireciona para o login', async () => {
    renderRoutes(routes, { route: PATHS.interna });

    expect(await screen.findByText('Tela de login')).toBeInTheDocument();
  });

  it('enquanto a sessão carrega, espera em vez de redirecionar', () => {
    renderRoutes(routes, { route: PATHS.interna, authStatus: 'loading' });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
    expect(screen.queryByText('Tela de login')).not.toBeInTheDocument();
  });

  it('perfil sem acesso vê a página 403', () => {
    renderRoutes(routes, { route: PATHS.interna, sessao: usuarioTeste(ROLE.CLIENTE) });

    expect(screen.getByText('Você não tem acesso a esta página')).toBeInTheDocument();
    expect(screen.queryByText('Painel interno')).not.toBeInTheDocument();
  });

  it('perfil com acesso vê a página', () => {
    renderRoutes(routes, { route: PATHS.interna, sessao: usuarioTeste(ROLE.GESTOR) });

    expect(screen.getByText('Painel interno')).toBeInTheDocument();
  });

  it('não diferencia maiúsculas de minúsculas no perfil', () => {
    renderRoutes(routes, { route: PATHS.interna, sessao: usuarioTeste('funcionario') });

    expect(screen.getByText('Painel interno')).toBeInTheDocument();
  });
});
