import type { ReactNode } from 'react';
import { usePermissao } from './usePermissao';

interface PodeProps {
  perfis: readonly string[];
  /** Mostrado quando o perfil não tem permissão (padrão: nada). */
  fallback?: ReactNode;
  children: ReactNode;
}

export function Pode({ perfis, fallback = null, children }: PodeProps) {
  const { pode } = usePermissao();
  return <>{pode(perfis) ? children : fallback}</>;
}
