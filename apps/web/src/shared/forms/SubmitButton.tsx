import { LoaderCircle } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/shared/ui/button';

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  /** Texto durante o envio. Padrão: mantém o texto normal. */
  loadingText?: string;
}

/** Botão de envio que fica desabilitado enquanto `loading`, impedindo envio duplicado. */
export function SubmitButton({
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button {...props} type="submit" disabled={disabled || loading} aria-busy={loading}>
      {loading && <LoaderCircle className="animate-spin" aria-hidden />}
      {loading ? (loadingText ?? children) : children}
    </Button>
  );
}
