import { Link } from 'react-router';
import { Button } from '@/shared/ui/button';
import { PATHS } from '@/app/routes/paths';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="space-y-4">
        <p className="eyebrow">Erro 404</p>
        <h1 className="section-title">Página não encontrada</h1>
        <p className="text-muted-foreground">O endereço não existe ou foi movido.</p>
        <Button asChild>
          <Link to={PATHS.home}>Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
