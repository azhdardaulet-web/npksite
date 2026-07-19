import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type A11yFontSize = 'normal' | 'large' | 'xlarge';

interface A11ySettings {
  fontSize: A11yFontSize;
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: A11ySettings = {
  fontSize: 'normal',
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  reduceMotion: false,
};

const STORAGE_KEY = 'npk-a11y';

interface A11yContextValue extends A11ySettings {
  isPanelOpen: boolean;
  isCustomized: boolean;
  openPanel: () => void;
  closePanel: () => void;
  setFontSize: (size: A11yFontSize) => void;
  setHighContrast: (value: boolean) => void;
  setGrayscale: (value: boolean) => void;
  setUnderlineLinks: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  reset: () => void;
}

const A11yContext = createContext<A11yContextValue | undefined>(undefined);

function getInitialSettings(): A11ySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // повреждённые данные в localStorage — используем значения по умолчанию
  }
  // Первый визит без сохранённых настроек: уважаем системную настройку ОС
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { ...DEFAULT_SETTINGS, reduceMotion: prefersReducedMotion };
}

export function A11yProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(getInitialSettings);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('a11y-font-large', settings.fontSize === 'large');
    html.classList.toggle('a11y-font-xlarge', settings.fontSize === 'xlarge');
    html.classList.toggle('a11y-contrast', settings.highContrast);
    html.classList.toggle('a11y-grayscale', settings.grayscale);
    html.classList.toggle('a11y-underline-links', settings.underlineLinks);
    html.classList.toggle('a11y-reduce-motion', settings.reduceMotion);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const isCustomized =
    settings.fontSize !== 'normal' ||
    settings.highContrast ||
    settings.grayscale ||
    settings.underlineLinks ||
    settings.reduceMotion;

  return (
    <A11yContext.Provider
      value={{
        ...settings,
        isPanelOpen,
        isCustomized,
        openPanel: () => setIsPanelOpen(true),
        closePanel: () => setIsPanelOpen(false),
        setFontSize: (size) => update('fontSize', size),
        setHighContrast: (value) => update('highContrast', value),
        setGrayscale: (value) => update('grayscale', value),
        setUnderlineLinks: (value) => update('underlineLinks', value),
        setReduceMotion: (value) => update('reduceMotion', value),
        reset: () => setSettings(DEFAULT_SETTINGS),
      }}
    >
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y должен использоваться внутри A11yProvider');
  return ctx;
}
