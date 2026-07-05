import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// WHAT: Slot-machine vertical word loop — one visible word at a time
// WHY: The sentence reads complete on every iteration without layout shift.
//      Track slides up by 1 slot; when it reaches the end it wraps silently.

interface VerticalWordLoopProps {
  words: string[];
  className?: string;
  interval?: number;
}

export function VerticalWordLoop({ words, className = '', interval = 2800 }: VerticalWordLoopProps) {
  const trackRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const [slotHeight, setSlotHeight] = useState(0);

  // Measure one slot's height — useLayoutEffect fires synchronously after DOM paint
  // so we always get the real rendered font size from the parent h1
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const first = track.children[0] as HTMLElement;
      if (first) setSlotHeight(first.offsetHeight);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!slotHeight) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const track = trackRef.current;
    if (!track) return;

    const total = words.length;

    const advance = () => {
      indexRef.current = (indexRef.current + 1) % total;
      gsap.to(track, {
        y: -(indexRef.current * slotHeight),
        duration: 0.75,
        ease: 'expo.inOut',
      });
    };

    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [slotHeight, words.length, interval]);

  return (
    // Outer clip — height is exactly 1 slot once measured; overflow hidden hides the rest
    <span
      className={`inline-block overflow-hidden align-bottom ${className}`}
      style={{ height: slotHeight || 'auto' }}
    >
      {/* Sliding track: words stacked vertically, GSAP moves it up by slotHeight each step */}
      <span
        ref={trackRef}
        className="flex flex-col"
        style={{ willChange: 'transform' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {words.map((word) => (
          <span
            key={word}
            className="whitespace-nowrap text-red font-bold leading-[1.1] block"
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
