import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageVisibilityProvider } from './contexts/PageVisibilityContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <PageVisibilityProvider>
          <App />
        </PageVisibilityProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
