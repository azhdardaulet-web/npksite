import { useCallback } from 'react';
import { kz } from './kz';
import { useLanguage, type Language } from './LanguageContext';
import { ru, type TranslationKey } from './ru';

type TranslationParams = Record<string, string | number>;

function interpolate(template: string, params?: TranslationParams) {
  if (!params) return template;

  return template.replace(/\{([^{}]+)\}/g, (placeholder, key: string) => {
    const value = params[key];
    return value === undefined ? placeholder : String(value);
  });
}

export function getTranslation(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
) {
  const localizedValue = language === 'kz' ? kz[key] : ru[key];
  const template = localizedValue?.trim() ? localizedValue : ru[key];

  return interpolate(template, params);
}

export function useT() {
  const { language } = useLanguage();

  return useCallback(
    (key: TranslationKey, params?: TranslationParams) => (
      getTranslation(language, key, params)
    ),
    [language],
  );
}
