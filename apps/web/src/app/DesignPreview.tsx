import { toast } from 'sonner';
import { ThemeToggle } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { TenantLogo, useTenant } from './providers/tenant';

const rows = [
  { id: '001', nome: 'Maria Souza', plano: 'Família', status: 'Ativo' },
  { id: '002', nome: 'João Pereira', plano: 'Individual', status: 'Pendente' },
];

/** Página temporária para validar tema/tokens/componentes. Remover quando houver rotas reais. */
export function DesignPreview() {
  const { status } = useTenant();

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <TenantLogo />
        <ThemeToggle />
      </header>

      <section className="space-y-2">
        <p className="eyebrow">Design system · tenant {status}</p>
        <h1 className="section-title">Planejar também é uma forma de cuidar</h1>
      </section>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
          <CardDescription>Exemplo de formulário com os componentes base.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Nome completo" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success('Salvo com sucesso')}>Salvar</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="outline">Contorno</Button>
            <Button variant="destructive" onClick={() => toast.error('Algo deu errado')}>
              Excluir
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">Abrir dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar ação</DialogTitle>
                  <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button>Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Titular</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.nome}</TableCell>
              <TableCell>{r.plano}</TableCell>
              <TableCell>{r.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
