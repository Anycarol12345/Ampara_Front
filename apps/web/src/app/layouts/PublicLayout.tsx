import { Link, Outlet } from 'react-router';
import { ThemeToggle } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { TenantLogo } from '@/app/providers/tenant';
import { PATHS } from '@/app/routes/paths';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to={PATHS.home}>
            <TenantLogo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to={PATHS.login}>Entrar</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
