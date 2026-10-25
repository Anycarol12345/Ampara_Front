import { LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Carregando…', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-muted-foreground',
        className,
      )}
    >
      <LoaderCircle className="size-6 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
