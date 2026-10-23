import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { UsuarioSessao } from '@ampara/api-client';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { getCurrentUser, refreshSession, signIn, signOut, subscribeSession } from './session';

/** Restaura a sessão ao abrir o app (refresh pelo cookie) e expõe login/logout. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioSessao | null>(getCurrentUser);
  const [status, setStatus] = useState<AuthStatus>(user ? 'authenticated' : 'loading');

  useEffect(() => {
    const unsubscribe = subscribeSession((next) => {
      setUser(next);
      setStatus(next ? 'authenticated' : 'anonymous');
    });
    void refreshSession().then((token) => {
      if (!token) setStatus('anonymous');
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login: signIn, logout: signOut }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
