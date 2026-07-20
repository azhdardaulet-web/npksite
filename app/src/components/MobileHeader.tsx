import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/i18n/LanguageContext';

const IconGlobe = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export function MobileHeader() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const other = lang === 'ru' ? 'kz' : 'ru';
  const otherLabel = lang === 'ru' ? 'ҚАЗ' : 'РУС';
  const activeLabel = lang === 'ru' ? 'РУС' : 'ҚАЗ';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-bg/95 backdrop-blur-xl border-b border-line">
      <div className="flex items-center justify-between gap-1.5 px-3 h-[56px]">
        {/* Logo: на узких экранах сжимаем, чтобы кнопка «Присоединиться» не вылезала */}
        <Link to="/" className="shrink min-w-0 flex items-center">
          <img src="/images/logo-rus.svg" alt="Народная партия Казахстана" className="h-[28px] w-auto max-w-full" />
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Compact language switcher */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1 px-1.5 py-[5px] border border-line bg-transparent text-text-base cursor-pointer"
            >
              <IconGlobe />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{activeLabel}</span>
              <IconChevron open={open} />
            </button>

            {open && (
              <div className="absolute top-[calc(100%+4px)] right-0 bg-surface border border-line min-w-full">
                <button
                  onClick={() => { setLang(other); setOpen(false); }}
                  className="block w-full py-2 px-3 text-text-muted bg-transparent cursor-pointer text-center"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  {otherLabel}
                </button>
              </div>
            )}
          </div>

          <ThemeToggle className="w-8 h-8" />

          {/* Join button: на самых узких экранах короткая подпись, чтобы не вылезать */}
          <Link to="/vstupit" className="shrink-0">
            <button className="px-2.5 py-1.5 bg-accent-brand hover:brightness-90 text-accent-brand-text text-[10px] font-semibold tracking-[0.05em] uppercase transition-colors whitespace-nowrap">
              <span className="hidden min-[430px]:inline">Присоединиться</span>
              <span className="min-[430px]:hidden">Вступить</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
