import { useEffect, useState } from 'react';
import { fetchPage, type PublicPageBlock } from '@/lib/api';
import { useLanguage, type Language } from '@/i18n/LanguageContext';

function hasLocalizedValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

// Компоненты пока читают поля *Ru. На казахской версии подставляем в них
// парные *Kz, сохраняя русский текст как фолбэк для пустых значений.
function localizeContent(value: unknown, language: Language): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => localizeContent(item, language));
  }
  if (!value || typeof value !== 'object') return value;

  const source = value as Record<string, unknown>;
  const localized: Record<string, unknown> = {};

  for (const [key, currentValue] of Object.entries(source)) {
    const kzKey = key.endsWith('Ru') ? `${key.slice(0, -2)}Kz` : null;
    const kzValue = kzKey ? source[kzKey] : undefined;
    const selectedValue = language === 'kz' && hasLocalizedValue(kzValue)
      ? kzValue
      : currentValue;
    localized[key] = localizeContent(selectedValue, language);
  }

  return localized;
}

// Общий хук для секций, управляемых через CMS (Страницы → <страница> → Блоки
// страницы). Если API недоступен или блок ещё не отредактирован — секции
// остаются на текущих хардкод-значениях (см. defaults в каждой секции).
export function usePageBlocks(slug: string) {
  const { language } = useLanguage();
  const [blocks, setBlocks] = useState<PublicPageBlock[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchPage(slug, language)
      .then((page) => { if (!cancelled) setBlocks(page.blocks ?? []); })
      .catch(() => { /* остаёмся на хардкоде */ });
    return () => { cancelled = true; };
  }, [language, slug]);

  function getBlock<T = Record<string, unknown>>(type: string): T | undefined {
    const content = blocks.find((b) => b.type === type)?.content;
    return content ? localizeContent(content, language) as T : undefined;
  }

  return { getBlock };
}
