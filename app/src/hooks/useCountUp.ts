import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountUp(
  target: number,
  duration: number = 1500,
  startOnMount: boolean = false
) {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(startOnMount);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const current = Math.floor(easedProgress * target);

      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
        setIsRunning(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning, target, duration]);

  return { count, start };
}
