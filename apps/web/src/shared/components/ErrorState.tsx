import { TriangleAlert } from 'lucide-react';
import { getErrorMessage, getTraceId } from '@/shared/lib/api-error';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  error,
  title = 'Não foi possível carregar',
  onRetry,
  className,
}: ErrorStateProps) {
  const traceId = getTraceId(error);

  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center',
        className,
      )}
    >
      <TriangleAlert className="size-8 text-destructive" aria-hidden />
      <h2 className="text-base font-medium">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      {traceId && <p className="text-xs text-muted-foreground">Código de suporte: {traceId}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
