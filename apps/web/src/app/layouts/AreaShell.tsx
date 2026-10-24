import { Outlet } from 'react-router';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { TenantLogo } from '@/app/providers/tenant';

export function AreaShell({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <TenantLogo />
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.nome}</span>
            <ThemeToggle />
            <Button variant="outline" onClick={() => void logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
