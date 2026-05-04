import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

if (import.meta.env.VITE_MOCK === 'true') {
  const { setupMocks } = await import('./lib/mockSetup');
  setupMocks();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
