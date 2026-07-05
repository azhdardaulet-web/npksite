import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

const PLATFORMS = [
  {
    name: 'YouTube',
    handle: '@ҚазақстанХалықпартиясы',
    href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA',
    subscribers: '139 000',
    raw: 139,
    unit: 'тыс.',
    cta: 'Подписаться',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.48 20.5 12 20.5 12 20.5s7.52 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    handle: '@halyk_partiyasy',
    href: 'https://www.tiktok.com/@halyk_partiyasy',
    subscribers: '113 200',
    raw: 113.2,
    unit: 'тыс.',
    cta: 'Подписаться',
    color: '#ffffff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    handle: '@halyk_partiyasy',
    href: 'https://www.instagram.com/halyk_partiyasy/',
    subscribers: '12 700',
    raw: 12.7,
    unit: 'тыс.',
    cta: 'Подписаться',
    color: '#E1306C',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: 'Telegram',
    handle: '@halykparty',
    href: 'https://t.me/halykparty',
    subscribers: '313',
    raw: 0.313,
    unit: 'тыс.',
    cta: 'Подписаться',
    color: '#2AABEE',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    handle: 'halykpartiyasy',
    href: 'https://www.facebook.com/halykpartiyasy',
    subscribers: '7 000',
    raw: 7,
    unit: 'тыс.',
    cta: 'Подписаться',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

function AnimatedNumber({ target, unit, triggered }: { target: number; unit: string; triggered: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    const start = performance.now();
    const duration = 1800;
    const raf = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(parseFloat((ease * target).toFixed(1)));
      if (p < 1) requestAnimationFrame(raf);
      else setDisplay(target);
    };
    requestAnimationFrame(raf);
  }, [triggered, target]);

  // For sub-1k values show exact number, not "0 тыс."
  const isSmall = target < 1;
  const formatted = isSmall
    ? Math.round(display * 1000).toString()
    : display.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const displayUnit = isSmall ? '' : unit;

  return (
    <span>{formatted} <span className="text-[0.6em] font-medium text-fog/70">{displayUnit}</span></span>
  );
}

export function SocialStatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      once: true,
      onEnter: () => setTriggered(true),
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] border-t border-white/[0.07] py-20 md:py-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <div>
            <p className="text-[11px] font-bold text-red uppercase tracking-widest mb-3">Голос партии</p>
            <h2 className="text-[36px] md:text-[52px] font-bold text-white leading-[1.05] uppercase">
              Медиа,<br />которому<br />доверяют
            </h2>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[16px] md:text-[18px] font-light text-fog leading-relaxed mb-6">
              У Народной партии — собственная медиастудия и пять активных площадок. Мы говорим о том, что важно: политика, экономика, жизнь регионов — без купюр и без прикрас.
            </p>
            <p className="text-[14px] font-light text-fog/60 leading-relaxed">
              Суммарная аудитория более <span className="text-white font-medium">270 000 подписчиков</span>. Подпишитесь на удобную для вас платформу.
            </p>
          </div>
        </div>

        {/* Social cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {PLATFORMS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-4 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 p-5 transition-all duration-300 hover:bg-white/[0.07]"
            >
              {/* Icon */}
              <div className="flex items-center justify-between">
                <span style={{ color: p.color }} className="transition-transform duration-300 group-hover:scale-110">
                  {p.icon}
                </span>
                <span className="text-[11px] text-fog/50 font-medium">{p.handle}</span>
              </div>

              {/* Platform name */}
              <div>
                <p className="text-[12px] font-medium text-fog/60 uppercase tracking-widest mb-1">{p.name}</p>
                {/* Subscriber count */}
                <p className="text-[28px] md:text-[32px] font-bold text-white leading-none">
                  <AnimatedNumber target={p.raw} unit={p.unit} triggered={triggered} />
                </p>
                <p className="text-[11px] text-fog/40 mt-1">подписчиков</p>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-3 border-t border-white/[0.07]">
                <span className="text-[12px] font-medium text-white/60 group-hover:text-white transition-colors flex items-center gap-1.5">
                  {p.cta}
                  <svg viewBox="0 0 16 16" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </span>
              </div>

              {/* Subtle color glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${p.color}18 0%, transparent 70%)` }}
              />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
