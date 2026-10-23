import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/shared/theme';
import { Toaster } from '@/shared/ui/sonner';
import { TenantProvider } from './tenant';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AuthProvider>
          {children}
          <Toaster richColors closeButton />
        </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
