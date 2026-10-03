import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeLanguageProvider>
      <App />
    </ThemeLanguageProvider>
  </StrictMode>,
);

