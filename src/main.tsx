import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { I18nProvider } from './hooks/useI18n';
import { PwaUpdateProvider } from './hooks/PwaUpdateProvider';
import { initializeDatabases } from '@/store/useStore';

initializeDatabases();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <PwaUpdateProvider>
        <App />
      </PwaUpdateProvider>
    </I18nProvider>
  </StrictMode>,
);
