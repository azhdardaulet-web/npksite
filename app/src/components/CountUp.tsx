import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  triggered?: boolean;
}

export function CountUp({ target, duration = 1500, suffix = '', prefix = '', className = '', triggered }: CountUpProps) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!triggered || hasRun.current) return;
    hasRun.current = true;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = Math.floor(eased * target);
      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [triggered, target, duration]);

  const formatted = count.toLocaleString('ru-RU');

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
