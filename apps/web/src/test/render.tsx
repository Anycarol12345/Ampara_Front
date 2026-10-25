import type { UsuarioSessao } from '@ampara/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/features/auth/auth-context';

export function usuarioTeste(role: string, overrides: Partial<UsuarioSessao> = {}): UsuarioSessao {
  return { id: 'usuario-1', nome: 'Maria Teste', role, ...overrides };
}

/** Client novo por teste, sem repetição de falhas e sem cache compartilhado. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

export interface TestOptions {
  /** Usuário logado. Omitido ou null = sem sessão. */
  sessao?: UsuarioSessao | null;
  /** Força o estado da sessão (ex.: 'loading'). Padrão: deduzido de `sessao`. */
  authStatus?: AuthStatus;
  /** Sobrescreve partes do contexto, ex.: { logout: vi.fn() }. */
  auth?: Partial<AuthContextValue>;
  queryClient?: QueryClient;
}

function buildAuth({ sessao = null, authStatus, auth }: TestOptions): AuthContextValue {
  return {
    status: authStatus ?? (sessao ? 'authenticated' : 'anonymous'),
    user: sessao,
    login: async () => {
      throw new Error('login não simulado neste teste');
    },
    logout: async () => undefined,
    ...auth,
  };
}

function Providers({
  children,
  client,
  auth,
}: {
  children: ReactNode;
  client: QueryClient;
  auth: AuthContextValue;
}) {
  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

/** Wrapper para `renderHook`: query + auth, sem router. */
export function createWrapper(options: TestOptions = {}) {
  const client = options.queryClient ?? createTestQueryClient();
  const auth = buildAuth(options);
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Providers client={client} auth={auth}>
        {children}
      </Providers>
    );
  };
}

interface RenderRoutesOptions extends TestOptions {
  /** URL inicial. Padrão: '/'. */
  route?: string;
}

/** Renderiza um conjunto de rotas (guards, redirecionamentos) com todos os providers. */
export function renderRoutes(
  routes: RouteObject[],
  { route = '/', ...options }: RenderRoutesOptions = {},
) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const result = render(
    <Providers client={queryClient} auth={buildAuth(options)}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { ...result, router, queryClient, user: userEvent.setup() };
}

/** Renderiza um componente solto dentro dos providers. */
export function renderWithProviders(ui: ReactElement, options: RenderRoutesOptions = {}) {
  return renderRoutes([{ path: '*', element: ui }], options);
}
