import { createContext } from 'react';
import type { TenantConfig } from './tenant-config';

export type TenantStatus = 'loading' | 'ready' | 'error';

export interface TenantContextValue {
  tenant: TenantConfig;
  status: TenantStatus;
}

export const TenantContext = createContext<TenantContextValue | null>(null);
