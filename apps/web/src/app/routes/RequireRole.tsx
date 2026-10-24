import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { PATHS } from './paths';
import { hasRole } from './roles';

/**
 * Protege um grupo de rotas. Só controla a interface: a segurança real é do backend.
 * - carregando a sessão: aguarda (a sessão é restaurada por refresh a cada F5)
 * - sem sessão: vai para o login
 * - perfil sem acesso: mostra a página 403 na mesma URL
 */
export function RequireRole({ allow }: { allow: readonly string[] }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div role="status" className="grid min-h-screen place-items-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={PATHS.login} replace state={{ from: location }} />;
  }

  if (!hasRole(user.role, allow)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
