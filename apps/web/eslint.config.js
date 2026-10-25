import react from '@ampara/config/eslint/react';
import boundaries from '@ampara/config/eslint/boundaries';

export default [
  ...react,
  ...boundaries,
  {
    // Tokens nunca ficam em localStorage/sessionStorage.
    files: ['src/features/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Tokens nunca ficam em localStorage.' },
        { name: 'sessionStorage', message: 'Tokens nunca ficam em sessionStorage.' },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'localStorage',
          message: 'Tokens nunca ficam em localStorage.',
        },
        {
          object: 'window',
          property: 'sessionStorage',
          message: 'Tokens nunca ficam em sessionStorage.',
        },
      ],
    },
  },
  {
    // Testes podem inspecionar o storage para provar que nenhum token foi gravado.
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
    },
  },
  {
    // Código gerado pelo shadcn e helpers de teste exportam mais que componentes.
    files: ['src/shared/ui/**/*.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
];
