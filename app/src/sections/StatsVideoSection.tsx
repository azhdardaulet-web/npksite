import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';

gsap.registerPlugin(ScrollTrigger);

export function StatsVideoSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { getBlock } = useHomeBlocks();
  const videoUrl = getBlock<{ videoUrl?: string }>('video')?.videoUrl?.trim() || '/stats-video.mp4';

  // Force play on mobile — iOS Safari sometimes ignores autoPlay attribute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const attempt = () => { video.play().catch(() => {}); };
    attempt();
    document.addEventListener('touchstart', attempt, { once: true, passive: true });
    return () => document.removeEventListener('touchstart', attempt);
  }, []);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pin = pinRef.current;
    const wrap = videoWrapRef.current;
    if (!pin || !wrap || !isDesktop || reduced) return;

    // Desktop only: give the container 100vh and make wrap fill it
    pin.style.height = '100vh';
    pin.style.position = 'relative';
    pin.style.overflow = 'hidden';
    wrap.style.position = 'absolute';
    wrap.style.inset = '0';
    wrap.style.top = '72px';
    // Remove the mobile aspect-ratio constraint
    const video = wrap.querySelector('video');
    if (video) {
      video.style.height = '100%';
      video.style.aspectRatio = 'unset';
    }

    wrap.style.clipPath = 'inset(32% 20% 32% 20% round 20px)';

    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        const insetT = gsap.utils.interpolate(32, 0, p);
        const insetS = gsap.utils.interpolate(20, 0, p);
        const radius = gsap.utils.interpolate(20, 0, p);
        wrap.style.clipPath = `inset(${insetT}% ${insetS}% ${insetT}% ${insetS}% round ${radius}px)`;
      },
    });

    return () => {
      st.kill();
      pin.style.height = '';
      pin.style.position = '';
      pin.style.overflow = '';
    };
  }, []);

  return (
    <div ref={pinRef} className="w-full bg-black">
      <div ref={videoWrapRef} className="w-full" style={{ willChange: 'clip-path' }}>
        {/* Mobile: natural 16:9 block. Desktop: filled via JS above. */}
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full block object-cover"
          style={{ aspectRatio: '16 / 9' }}
        />
      </div>
    </div>
  );
}
