import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchPageVisibility } from '@/lib/api';

interface PageVisibilityValue {
  loading: boolean;
  isVisible: (slug: string) => boolean;
}

const PageVisibilityContext = createContext<PageVisibilityValue>({
  loading: true,
  isVisible: () => true,
});

export function PageVisibilityProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPageVisibility()
      .then((items) => {
        if (!cancelled) setPages(Object.fromEntries(items.map((item) => [item.slug, item.isPublished])));
      })
      .catch(() => {
        // При недоступном API сайт остаётся доступным, чтобы сбой CMS не закрыл все страницы.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<PageVisibilityValue>(() => ({
    loading,
    isVisible: (slug) => pages[slug] !== false,
  }), [loading, pages]);

  return <PageVisibilityContext.Provider value={value}>{children}</PageVisibilityContext.Provider>;
}

export function usePageVisibility() {
  return useContext(PageVisibilityContext);
}
