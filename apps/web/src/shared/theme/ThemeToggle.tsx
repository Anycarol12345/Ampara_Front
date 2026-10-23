import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTheme } from './useTheme';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
