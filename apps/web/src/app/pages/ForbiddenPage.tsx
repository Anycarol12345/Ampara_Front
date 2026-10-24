import { Link } from 'react-router';
import { Button } from '@/shared/ui/button';
import { PATHS } from '@/app/routes/paths';

export function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="space-y-4">
        <p className="eyebrow">Erro 403</p>
        <h1 className="section-title">Você não tem acesso a esta página</h1>
        <p className="text-muted-foreground">Seu perfil não permite acessar esta área.</p>
        <Button asChild>
          <Link to={PATHS.home}>Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
