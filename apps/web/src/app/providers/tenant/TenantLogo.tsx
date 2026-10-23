import { cn } from '@/shared/lib/utils';
import { useTenant } from './useTenant';

/** Logo da funerária; cai para o nome em texto se não houver logo. */
export function TenantLogo({ className }: { className?: string }) {
  const { tenant } = useTenant();

  if (tenant.logoUrl) {
    return <img src={tenant.logoUrl} alt={tenant.nome} className={cn('h-8 w-auto', className)} />;
  }
  return <span className={cn('font-serif text-xl text-primary', className)}>{tenant.nome}</span>;
}
