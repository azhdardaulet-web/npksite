import { Navigate } from 'react-router-dom';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

export function VisiblePageRoute({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { loading, isVisible } = usePageVisibility();

  if (loading) return null;
  if (!isVisible(slug)) return <Navigate to="/" replace />;
  return children;
}
