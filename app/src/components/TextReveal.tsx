import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  stagger?: number;
  duration?: number;
  splitBy?: 'words' | 'chars';
}

export function TextReveal({
  children,
  className = '',
  tag: Tag = 'h2',
  delay = 0,
  stagger = 0.04,
  duration = 0.6,
  splitBy = 'words',
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.querySelectorAll('.reveal-item');
    gsap.set(items, { y: '110%', opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(items, {
          y: '0%',
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: 'power3.out',
        });
      },
    });

    return () => { trigger.kill(); };
  }, [delay, stagger, duration]);

  const splitText = () => {
    if (splitBy === 'chars') {
      return children.split('').map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span className="reveal-item inline-block">{char === ' ' ? '\u00A0' : char}</span>
        </span>
      ));
    }
    return children.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
        <span className="reveal-item inline-block">{word}</span>
      </span>
    ));
  };

  return (
    <div ref={containerRef}>
      <Tag className={className}>{splitText()}</Tag>
    </div>
  );
}
