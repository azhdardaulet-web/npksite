import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// WHAT: Two-layer custom cursor (dot + ring) with mix-blend-mode: difference
// WHY: The single highest-signal Awwwards craft indicator — immediately sets apart from template sites

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    // Start hidden until first mouse move
    gsap.set([dot, ring], { opacity: 0, xPercent: -50, yPercent: -50 });

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0, overwrite: true });
      // Show on first move
      gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: false });
    };

    // Ring lags behind with expo ease — smooth inertia feel
    const tickRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(ring, { x: ringX, y: ringY });
      rafId = requestAnimationFrame(tickRing);
    };
    rafId = requestAnimationFrame(tickRing);

    // WHAT: Magnetic pull on [data-magnetic] elements
    // WHY: Creates physical weight — buttons feel grabbable, not just clickable
    const onMagneticEnter = (e: MouseEvent) => {
      const el = (e.currentTarget as HTMLElement);
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;

      gsap.to(el, {
        x: dx * 0.35,
        y: dy * 0.35,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: true,
      });

      // Ring expands to wrap the button
      gsap.to(ring, {
        width: rect.width + 20,
        height: rect.height + 20,
        borderRadius: '10000px',
        duration: 0.3,
        ease: 'expo.out',
      });
    };

    const onMagneticMove = (e: MouseEvent) => {
      const el = (e.currentTarget as HTMLElement);
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;

      gsap.to(el, {
        x: dx * 0.35,
        y: dy * 0.35,
        duration: 0.3,
        ease: 'power3.out',
        overwrite: true,
      });
    };

    const onMagneticLeave = (e: MouseEvent) => {
      const el = (e.currentTarget as HTMLElement);
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'expo.out', overwrite: true });

      // Ring snaps back to small dot
      gsap.to(ring, {
        width: 36,
        height: 36,
        borderRadius: '50%',
        duration: 0.4,
        ease: 'expo.out',
      });
    };

    // WHAT: Cursor grows on any interactive element hover
    // WHY: Feedback hierarchy — links feel lighter than buttons
    const onLinkEnter = () => {
      gsap.to(ring, { scale: 1.6, duration: 0.3, ease: 'expo.out' });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };
    const onLinkLeave = () => {
      gsap.to(ring, { scale: 1, duration: 0.4, ease: 'expo.out' });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    // Attach events
    window.addEventListener('mousemove', onMouseMove);

    const magneticEls = document.querySelectorAll<HTMLElement>('[data-magnetic]');
    magneticEls.forEach((el) => {
      el.addEventListener('mouseenter', onMagneticEnter);
      el.addEventListener('mousemove', onMagneticMove);
      el.addEventListener('mouseleave', onMagneticLeave);
    });

    const linkEls = document.querySelectorAll<HTMLElement>('a, button:not([data-magnetic])');
    linkEls.forEach((el) => {
      el.addEventListener('mouseenter', onLinkEnter);
      el.addEventListener('mouseleave', onLinkLeave);
    });

    // Hide native cursor
    document.documentElement.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      magneticEls.forEach((el) => {
        el.removeEventListener('mouseenter', onMagneticEnter);
        el.removeEventListener('mousemove', onMagneticMove);
        el.removeEventListener('mouseleave', onMagneticLeave);
      });
      linkEls.forEach((el) => {
        el.removeEventListener('mouseenter', onLinkEnter);
        el.removeEventListener('mouseleave', onLinkLeave);
      });
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* Inner dot — instant, white, tiny */}
      <div
        ref={dotRef}
        className="cursor-dot"
        aria-hidden="true"
      />
      {/* Outer ring — lagging, mix-blend-mode: difference creates the inversion effect */}
      <div
        ref={ringRef}
        className="cursor-ring"
        aria-hidden="true"
      />
    </>
  );
}
