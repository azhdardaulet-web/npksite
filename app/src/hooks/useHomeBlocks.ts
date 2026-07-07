import { usePageBlocks } from '@/hooks/usePageBlocks';

// Тонкая обёртка usePageBlocks('home') — оставлена для существующих секций
// главной страницы, чтобы не трогать их импорты.
export function useHomeBlocks() {
  return usePageBlocks('home');
}
