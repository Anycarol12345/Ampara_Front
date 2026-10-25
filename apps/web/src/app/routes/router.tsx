import { createBrowserRouter } from 'react-router';
import { ClientLayout } from '@/app/layouts/ClientLayout';
import { InternalLayout } from '@/app/layouts/InternalLayout';
import { PlatformLayout } from '@/app/layouts/PlatformLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { PATHS } from './paths';
import { RequireRole } from './RequireRole';
import { AREA_ROLES } from './roles';

export const router = createBrowserRouter([
  {
    // Área pública
    element: <PublicLayout />,
    children: [
      {
        path: PATHS.home,
        lazy: async () => ({ Component: (await import('@/app/pages/HomePage')).HomePage }),
      },
      {
        path: PATHS.login,
        lazy: async () => ({
          Component: (await import('@/features/auth/pages/LoginPage')).LoginPage,
        }),
      },
    ],
  },
  {
    // Área do cliente
    path: PATHS.cliente,
    element: <RequireRole allow={AREA_ROLES.cliente} />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/clientes/pages/MinhaContaPage')).MinhaContaPage,
            }),
          },
        ],
      },
    ],
  },
  {
    // Área interna
    path: PATHS.interna,
    element: <RequireRole allow={AREA_ROLES.interna} />,
    children: [
      {
        element: <InternalLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/admin/pages/PainelPage')).PainelPage,
            }),
          },
        ],
      },
    ],
  },
  {
    // Gestão de funerárias
    path: PATHS.plataforma,
    element: <RequireRole allow={AREA_ROLES.plataforma} />,
    children: [
      {
        element: <PlatformLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/admin/pages/PlataformaPage')).PlataformaPage,
            }),
          },
        ],
      },
    ],
  },
  // Prévia do design system (temporária, remover quando houver telas reais)
  {
    path: PATHS.design,
    lazy: async () => ({
      Component: (await import('@/app/DesignPreview')).DesignPreview,
    }),
  },
  {
    path: PATHS.designForm,
    lazy: async () => ({
      Component: (await import('@/app/FormExample')).FormExample,
    }),
  },
  {
    path: PATHS.designRealtime,
    lazy: async () => ({
      Component: (await import('@/app/RealtimeExample')).RealtimeExample,
    }),
  },
  { path: PATHS.forbidden, element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
