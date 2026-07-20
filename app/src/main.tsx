import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageVisibilityProvider } from './contexts/PageVisibilityContext';
import { A11yProvider } from './contexts/A11yContext';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <A11yProvider>
          <BrowserRouter>
            <PageVisibilityProvider>
              <App />
            </PageVisibilityProvider>
          </BrowserRouter>
        </A11yProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
);
