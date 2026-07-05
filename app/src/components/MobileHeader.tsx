import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  const [lang, setLang] = useState<'ru' | 'kz'>('ru');
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
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between gap-2 px-4 h-[56px]">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center">
          <img src="/images/logo-rus.svg" alt="Народная партия Казахстана" className="h-[32px] w-auto" />
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {/* Compact language switcher */}
          <div ref={ref} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: 'white', cursor: 'pointer',
              }}
            >
              <IconGlobe />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{activeLabel}</span>
              <IconChevron open={open} />
            </button>

            {open && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
                minWidth: '100%',
              }}>
                <button
                  onClick={() => { setLang(other); setOpen(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '8px 12px',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.7)', background: 'transparent',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  {otherLabel}
                </button>
              </div>
            )}
          </div>

          {/* Join button */}
          <Link to="/vstupit">
            <button className="px-3 py-1.5 bg-[#DC0F2D] hover:bg-[#b80d25] text-white text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors whitespace-nowrap">
              Присоединиться
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
