import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/shared/theme';
import { Toaster } from '@/shared/ui/sonner';
import { QueryAuthSync, QueryProvider } from './query';
import { TenantProvider } from './tenant';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <QueryProvider>
          <AuthProvider>
            <QueryAuthSync />
            {children}
            <Toaster richColors closeButton />
          </AuthProvider>
        </QueryProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
