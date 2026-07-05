import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
  distance?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 60,
  duration = 0.8,
  ease = 'power3.out',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (direction === 'up') fromVars.y = distance;
    else if (direction === 'left') fromVars.x = -distance;
    else if (direction === 'right') fromVars.x = distance;
    else if (direction === 'scale') fromVars.scale = 0.95;

    gsap.set(el, fromVars);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration,
          delay,
          ease,
        });
      },
    });

    return () => { trigger.kill(); };
  }, [delay, direction, distance, duration, ease]);

  return <div ref={ref} className={className}>{children}</div>;
}
