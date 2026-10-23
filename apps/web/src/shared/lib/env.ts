function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

export const env = {
  apiUrl: required('VITE_API_URL', import.meta.env.VITE_API_URL).replace(/\/+$/, ''),
  /** Slug fixo da funerária (dev). Vazio em produção: vem do subdomínio. */
  tenant: import.meta.env.VITE_TENANT?.trim() || null,
} as const;
