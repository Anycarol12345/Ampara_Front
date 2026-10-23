import { hexToHsl, luminance, toTriplet } from '@/shared/lib/color';
import type { ResolvedTheme } from '@/shared/theme';
import type { TenantConfig } from './tenant-config';

const DARK_INK = '213 64% 12%';
const LIGHT_INK = '45 45% 98%';

const MANAGED_VARS = [
  '--primary',
  '--primary-foreground',
  '--ring',
  '--accent',
  '--accent-foreground',
] as const;

const readable = (hex: string) => (luminance(hex) > 0.4 ? DARK_INK : LIGHT_INK);

/**
 * Aplica as cores da funerária sobre os tokens do tema:
 * cor_primaria → primary/ring, cor_secundaria → accent (dourado no tema padrão).
 * No modo escuro a primária é clareada para manter contraste.
 */
export function applyTenantTheme(config: TenantConfig, mode: ResolvedTheme): void {
  const style = document.documentElement.style;
  MANAGED_VARS.forEach((v) => style.removeProperty(v));
  const { primaria, secundaria } = config.cores;

  if (primaria) {
    const hsl = hexToHsl(primaria);
    const adjusted = mode === 'dark' ? { ...hsl, l: Math.max(hsl.l, 68) } : hsl;
    style.setProperty('--primary', toTriplet(adjusted));
    style.setProperty('--ring', toTriplet(adjusted));
    style.setProperty('--primary-foreground', mode === 'dark' ? DARK_INK : readable(primaria));
  }

  if (secundaria) {
    style.setProperty('--accent', toTriplet(hexToHsl(secundaria)));
    style.setProperty('--accent-foreground', readable(secundaria));
  }
}
