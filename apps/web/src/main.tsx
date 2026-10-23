import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { setupApi } from '@/app/api';
import '@/shared/styles/index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root não encontrado');
}

setupApi();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
