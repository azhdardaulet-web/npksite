import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CountUp } from '@/components/CountUp';
import { TextReveal } from '@/components/TextReveal';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';

gsap.registerPlugin(ScrollTrigger);

interface Counter {
  label: string;
  target: number;
  suffix?: string;
  decimals?: number;
}

const DEFAULT_COUNTERS: Counter[] = [
  { label: 'лет деятельности', target: 25, suffix: '+' },
  { label: 'подписчиков официальных медиаресурсов', target: 11, decimals: 1, suffix: ' млн+' },
  { label: 'региональных филиалов', target: 20, suffix: '' },
  { label: 'депутатских запросов', target: 500, suffix: '+' },
];

interface StatsBlock {
  headingRu?: string;
  introRu?: string;
  items?: Array<{ value: string; suffix?: string; labelRu: string; decimals?: number }>;
}

export function TrustCountersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  const { getBlock } = useHomeBlocks();
  const cms = getBlock<StatsBlock>('stats');
  const heading = cms?.headingRu?.trim() || 'Народная партия в цифрах';
  const counters: Counter[] = cms?.items?.length
    ? cms.items.map((it) => ({ label: it.labelRu, target: parseInt(it.value, 10) || 0, suffix: it.suffix ?? '', decimals: it.decimals }))
    : DEFAULT_COUNTERS;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // CountUp trigger
    const countTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 65%',
      once: true,
      onEnter: () => setTriggered(true),
    });

    // Slogan reveal on scroll
    if (sloganRef.current) {
      gsap.fromTo(
        sloganRef.current.querySelectorAll('.slogan-line'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sloganRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }

    return () => countTrigger.kill();
  }, []);

  return (
    <section ref={sectionRef} className="bg-bg overflow-hidden">
      {/* ── Stats block ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-[var(--section-gap)] pb-[var(--section-gap)]">
        {/* Header row */}
        <div className="mb-14 md:mb-16">
          <TextReveal
            key={heading}
            tag="h2"
            className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-text-base leading-[1.1]"
          >
            {heading}
          </TextReveal>
        </div>

        {/* Stats row: 2 колонки до lg (больше места на число), 4 — от lg (1024px+) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {counters.map((c, i) => (
            <div key={c.label} className="border-l border-line pl-5 md:pl-8">
              <div className="flex items-baseline gap-1 mb-1 flex-wrap">
                <CountUp
                  target={c.target}
                  decimals={c.decimals}
                  triggered={triggered}
                  duration={2000 + i * 150}
                  className="text-[44px] sm:text-[56px] md:text-[72px] lg:text-[64px] xl:text-[80px] font-bold text-text-base leading-none"
                />
                {c.suffix && (
                  <span className="text-[24px] sm:text-[32px] md:text-[40px] lg:text-[32px] xl:text-[40px] font-bold text-text-base leading-none">
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="text-[14px] md:text-[20px] lg:text-[18px] xl:text-[26px] font-bold text-text-muted leading-tight">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
