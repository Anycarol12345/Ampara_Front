import { createContext } from 'react';
import type { UsuarioSessao } from '@ampara/api-client';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  status: AuthStatus;
  user: UsuarioSessao | null;
  login: (email: string, senha: string) => Promise<UsuarioSessao>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
