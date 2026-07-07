import { useEffect, useState } from 'react';
import { fetchPage, type PublicPageBlock } from '@/lib/api';

// Общий хук для секций, управляемых через CMS (Страницы → <страница> → Блоки
// страницы). Если API недоступен или блок ещё не отредактирован — секции
// остаются на текущих хардкод-значениях (см. defaults в каждой секции).
export function usePageBlocks(slug: string) {
  const [blocks, setBlocks] = useState<PublicPageBlock[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchPage(slug)
      .then((page) => { if (!cancelled) setBlocks(page.blocks ?? []); })
      .catch(() => { /* остаёмся на хардкоде */ });
    return () => { cancelled = true; };
  }, [slug]);

  function getBlock<T = Record<string, unknown>>(type: string): T | undefined {
    return blocks.find((b) => b.type === type)?.content as T | undefined;
  }

  return { getBlock };
}
