import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'ru' | 'kz';

const STORAGE_KEY = 'npk-language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === 'ru' || value === 'kz';
}

function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ru';

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (isLanguage(savedLanguage)) return savedLanguage;

  const browserLanguage = (
    window.navigator.languages?.[0]
    ?? window.navigator.language
    ?? ''
  ).toLowerCase();
  const primaryLanguage = browserLanguage.split('-')[0];

  return primaryLanguage === 'kk' || primaryLanguage === 'kz' ? 'kz' : 'ru';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((current) => current === 'ru' ? 'kz' : 'ru'),
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage должен использоваться внутри LanguageProvider');
  }

  return context;
}
