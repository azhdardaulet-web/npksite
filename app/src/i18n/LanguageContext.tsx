import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { kz } from './kz';
import { ru } from './ru';

export type Language = 'ru' | 'kz';

export const LANGUAGE_STORAGE_KEY = 'npk-language';

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

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
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
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
    const translations = new Map<string, string>();
    const normalizedTranslations = new Map<string, string>();
    const templates: Array<{ pattern: RegExp; target: string; fields: string[] }> = [];
    for (const key of Object.keys(ru) as Array<keyof typeof ru>) {
      if (ru[key] === kz[key]) continue;
      translations.set(ru[key], kz[key]);
      normalizedTranslations.set(normalize(ru[key]), kz[key]);
      if (ru[key].includes('{')) {
        const fields: string[] = [];
        const escaped = ru[key]
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\\\{([^}]+)\\\}/g, (_match, field: string) => {
            fields.push(field);
            return '(.+?)';
          });
        templates.push({ pattern: new RegExp(`^${escaped}$`), target: kz[key], fields });
      }
    }

    const translateValue = (source: string) => {
      const exact = translations.get(source) ?? normalizedTranslations.get(normalize(source));
      if (exact) return exact;
      for (const template of templates) {
        const match = normalize(source).match(template.pattern);
        if (!match) continue;
        let target = template.target;
        template.fields.forEach((field, index) => { target = target.replace(`{${field}}`, match[index + 1] ?? ''); });
        return target;
      }
      return undefined;
    };

    const originalText = new WeakMap<Text, string>();
    const appliedText = new WeakMap<Text, string>();
    const originalAttributes = new WeakMap<Element, Map<string, string>>();
    const appliedAttributes = new WeakMap<Element, Map<string, string>>();
    const attributes = ['placeholder', 'title', 'aria-label', 'alt'];

    const localizeText = (node: Text) => {
      const current = node.nodeValue ?? '';
      const knownOriginal = originalText.get(node);
      const knownApplied = appliedText.get(node);
      // WHY: если текущее значение не совпадает ни с тем, что мы сами когда-то
      // применили, ни с ранее запомненным «оригиналом» — значит текст поменял
      // кто-то другой (React перерендерил узел с новыми данными из CMS), и
      // кэш нужно сбросить. Иначе при отсутствии перевода (target === source)
      // appliedText не выставлялся, и следующий реальный React-апдейт текста
      // ошибочно откатывался обратно к самому первому увиденному значению.
      if (knownOriginal === undefined || (current !== knownOriginal && current !== knownApplied)) {
        originalText.set(node, current);
        appliedText.delete(node);
      }
      const source = originalText.get(node) ?? current;

      const trimmed = source.trim();
      const translated = language === 'kz' ? translateValue(trimmed) : undefined;
      const target = translated
        ? source.replace(trimmed, translated)
        : source;
      if (current !== target) {
        appliedText.set(node, target);
        node.nodeValue = target;
      }
    };

    const localizeElement = (element: Element) => {
      let saved = originalAttributes.get(element);
      if (!saved) {
        saved = new Map<string, string>();
        originalAttributes.set(element, saved);
      }
      let applied = appliedAttributes.get(element);
      if (!applied) {
        applied = new Map<string, string>();
        appliedAttributes.set(element, applied);
      }

      for (const attribute of attributes) {
        const current = element.getAttribute(attribute);
        if (current === null) continue;
        const knownSaved = saved.get(attribute);
        const previousApplied = applied.get(attribute);
        // WHY: та же логика, что и в localizeText — сброс кэша нужен, если
        // текущее значение не совпадает ни с сохранённым «оригиналом», ни с
        // ранее применённым переводом (иначе легитимный React-апдейт атрибута
        // без перевода откатывался обратно к самому первому значению).
        if (knownSaved === undefined || (current !== knownSaved && current !== previousApplied)) {
          saved.set(attribute, current);
          applied.delete(attribute);
        }
        const source = saved.get(attribute) ?? current;
        const target = language === 'kz' ? translateValue(source) ?? source : source;
        if (current !== target) {
          applied.set(attribute, target);
          element.setAttribute(attribute, target);
        }
      }
    };

    const localizeTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) localizeText(root as Text);
      if (root.nodeType === Node.ELEMENT_NODE) localizeElement(root as Element);

      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      );
      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) localizeText(node as Text);
        else localizeElement(node as Element);
        node = walker.nextNode();
      }
    };

    localizeTree(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') localizeText(mutation.target as Text);
        if (mutation.type === 'attributes') localizeElement(mutation.target as Element);
        for (const node of mutation.addedNodes) localizeTree(node);
      }
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((current) => current === 'ru' ? 'kz' : 'ru'),
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      <div key={language} style={{ display: 'contents' }}>{children}</div>
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
