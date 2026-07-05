import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useLenis, getLenis } from '@/hooks/useLenis';
import { DesktopHeader } from './DesktopHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';
import { CustomCursor } from './CustomCursor';

export function PageLayout() {
  useLenis();
  const location = useLocation();

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-coal">
      {/* WHAT: Global custom cursor — rendered once at layout level
          WHY:  Persists across route changes without remounting */}
      <CustomCursor />
      <DesktopHeader />
      <MobileHeader />
      <main className="pb-14 md:pb-0 pt-[56px] md:pt-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
