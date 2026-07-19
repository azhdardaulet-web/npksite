import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useLenis, getLenis } from '@/hooks/useLenis';
import { DesktopHeader } from './DesktopHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';
import { CustomCursor } from './CustomCursor';
import { SiteBreadcrumbs } from './SiteBreadcrumbs';
import { A11yPanel } from './A11yPanel';

export function PageLayout() {
  useLenis();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-bg">
      {/* WHAT: Global custom cursor — rendered once at layout level
          WHY:  Persists across route changes without remounting */}
      <CustomCursor />
      <DesktopHeader />
      <MobileHeader />
      <A11yPanel />
      <main className={`pb-14 md:pb-0 ${isHome ? 'pt-[56px] md:pt-0' : 'pt-[104px] md:pt-[156px]'}`}>
        {!isHome && <SiteBreadcrumbs />}
        <div className={isHome ? undefined : 'internal-page-content'}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
