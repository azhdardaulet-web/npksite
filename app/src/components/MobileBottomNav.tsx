import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Newspaper, Play, Menu, X, ChevronRight, Youtube, Send, Instagram, Facebook, Globe, Search, Glasses } from 'lucide-react';
import { useA11y } from '@/contexts/A11yContext';
import { useLanguage } from '@/i18n/LanguageContext';

/* ─── Menu sections ─────────────────────────────────────────────── */
const MENU_SECTIONS = [
  {
    label: 'О партии', href: '/o-partii',
    children: [
      { label: 'О партии',       href: '/o-partii' },
      { label: 'История партии', href: '/o-partii/istoriya' },
      { label: 'Руководство',    href: '/rukovodstvo' },
      { label: 'Устав',          href: '/o-partii/ustav' },
      { label: 'Программа',      href: '/programma' },
    ],
  },
  {
    label: 'Фракция', href: '/frakciya',
    children: [
      { label: 'О фракции',           href: '/frakciya' },
      { label: 'Депутатские запросы', href: '/frakciya/zaprosy' },
    ],
  },
  { label: 'Общественная приёмная', href: '/priemnaya' },
  { label: 'Филиалы', href: '/filialy' },
  {
    label: 'Пресс-центр', href: '/novosti',
    children: [
      { label: 'Новости и релизы',               href: '/novosti' },
      { label: 'СМИ о нас',                      href: '/smi-o-nas' },
      { label: 'О портале «Халық Үні Қазақстан»', href: '/narodnoe-media' },
    ],
  },
  { label: 'Контакты', href: '/kontakty' },
];

const SOCIALS = [
  { icon: Youtube,   href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', label: 'YouTube' },
  { icon: Send,      href: 'https://t.me/halykparty',                                   label: 'Telegram' },
  { icon: Instagram, href: 'https://www.instagram.com/halyk_partiyasy/',                label: 'Instagram' },
  { icon: Facebook,  href: 'https://www.facebook.com/halykpartiyasy',                   label: 'Facebook' },
];

/* ─── Hamburger drawer ──────────────────────────────────────────── */
function MenuDrawer({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { language: lang, setLanguage: setLang } = useLanguage();
  const location = useLocation();
  const { openPanel } = useA11y();

  return (
    <div style={{ position: 'fixed', inset: 0, bottom: 68, display: 'flex', flexDirection: 'column', background: 'var(--bg)', zIndex: 9998 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', flexDirection: 'column', border: '2px solid var(--text)', borderRadius: 0, overflow: 'hidden', lineHeight: 1, fontWeight: 800, fontSize: 13 }}>
            <span style={{ padding: '3px 7px 2px', borderBottom: '2px solid var(--text)' }}>КХП</span>
            <span style={{ padding: '2px 7px 3px' }}>НПК</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Народная партия<br /><span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 11 }}>Казахстана</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/search" onClick={onClose} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </Link>
          <button
            aria-label="Версия для слабовидящих"
            onClick={() => { onClose(); openPanel(); }}
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <Glasses size={18} />
          </button>
          <button onClick={onClose} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: 'none', color: 'var(--text)', cursor: 'pointer', borderRadius: 0 }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {MENU_SECTIONS.map(section => (
          <div key={section.href}>
            {section.children ? (
              <>
                <button
                  onClick={() => setExpanded(expanded === section.href ? null : section.href)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', color: 'var(--text)', fontSize: 16, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                  {section.label}
                  <ChevronRight size={16} style={{ transform: expanded === section.href ? 'rotate(90deg)' : 'none', transition: 'transform .2s', color: 'var(--text-muted)' }} />
                </button>
                {expanded === section.href && (
                  <div style={{ background: 'var(--surface-2)', borderLeft: '2px solid #db1f26', marginLeft: 20 }}>
                    {section.children.map(child => (
                      <Link key={child.href} to={child.href} onClick={onClose}
                        style={{ display: 'block', padding: '11px 20px', fontSize: 14, fontWeight: 500, color: location.pathname === child.href ? 'var(--text)' : 'var(--text-muted)', textDecoration: 'none' }}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link to={section.href} onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', fontSize: 16, fontWeight: 700, color: location.pathname === section.href ? '#db1f26' : 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>
                {section.label}
              </Link>
            )}
            <div style={{ height: 1, background: 'var(--line)', margin: '0 20px' }} />
          </div>
        ))}
      </div>

      {/* Bottom: lang + CTA */}
      <div style={{ padding: '16px 20px 24px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          <Globe size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginRight: 4 }}>Язык:</span>
          <button onClick={() => setLang('kz')} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', background: lang === 'kz' ? '#db1f26' : 'transparent', color: lang === 'kz' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>ҚАЗ</button>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>|</span>
          <button onClick={() => setLang('ru')} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', background: lang === 'ru' ? '#db1f26' : 'transparent', color: lang === 'ru' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>РУС</button>
        </div>
        <Link to="/vstupit" onClick={onClose}
          style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#db1f26', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, letterSpacing: '.04em', marginBottom: 16 }}>
          Вступить в партию →
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {SOCIALS.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
              style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', color: 'var(--text-muted)' }}>
              <s.icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Join modal ────────────────────────────────────────────────── */
function JoinSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(false);
  const [member, setMember] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: '100%', background: 'var(--bg)', borderTop: '1px solid var(--line)', padding: '24px 20px 40px' }}>
        <div style={{ width: 36, height: 4, background: 'var(--line)', margin: '0 auto 24px', borderRadius: 0 }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
          <X size={20} />
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 8 }}>Народная партия Казахстана</div>
        <h2 style={{ margin: '0 0 24px', fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em' }}>Присоединяйтесь к нам</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Стать волонтёром', checked: volunteer, set: setVolunteer },
            { label: 'Вступить в партию', checked: member,   set: setMember },
          ].map(opt => (
            <label key={opt.label} onClick={() => opt.set(!opt.checked)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: opt.checked ? 'rgba(219,31,38,.1)' : 'var(--surface-2)', border: `1px solid ${opt.checked ? 'rgba(219,31,38,.5)' : 'var(--line)'}`, cursor: 'pointer' }}>
              <div style={{ width: 22, height: 22, flexShrink: 0, border: `2px solid ${opt.checked ? '#db1f26' : 'var(--line)'}`, background: opt.checked ? '#db1f26' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {opt.checked && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: opt.checked ? 'var(--text)' : 'var(--text-muted)' }}>{opt.label}</span>
            </label>
          ))}
        </div>
        <button onClick={() => { onClose(); navigate('/vstupit'); }}
          style={{ width: '100%', padding: '16px', background: '#db1f26', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '.04em', marginBottom: 12 }}>
          Присоединиться →
        </button>
        <Link to="/priemnaya" onClick={onClose}
          style={{ display: 'block', width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginBottom: 24, boxSizing: 'border-box' }}>
          Записаться в онлайн приёмную
        </Link>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' }}>Мы в соцсетях</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <s.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab items ─────────────────────────────────────────────────── */
const TABS = [
  { icon: Home,      label: 'Главная', href: '/' },
  { icon: Newspaper, label: 'Новости', href: '/novosti' },
  { icon: null,      label: 'Вступить', href: null, isCenter: true },
  { icon: Play,      label: 'Медиа',   href: '/media' },
  { icon: Menu,      label: 'Меню',    href: null,  isMenu: true },
] as const;

const NAV_H = 68;

/* ─── Bottom Nav ────────────────────────────────────────────────── */
export function MobileBottomNav() {
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const bar = (
    <div>
      {/* Inject CSS only once */}
      <style>{`
        @media (min-width: 768px) { .npk-mobile-nav { display: none !important; } }
        @keyframes npk-dot-in  { from { transform: translateX(-50%) scale(0); opacity: 0 } to { transform: translateX(-50%) scale(1); opacity: 1 } }
        @keyframes npk-fab-glow { 0%,100% { box-shadow: 0 6px 24px rgba(220,15,45,.55), 0 0 0 0 rgba(220,15,45,.3) } 55% { box-shadow: 0 6px 24px rgba(220,15,45,.55), 0 0 0 10px rgba(220,15,45,0) } }
        .npk-fab-ring { animation: npk-fab-glow 3s ease-in-out infinite; }
        .npk-tab:active { opacity: .7; transform: scale(.93); }
        .npk-tab { transition: opacity .15s, transform .15s; -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Navigation bar ── */}
      <nav className="npk-mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        height: `calc(${NAV_H}px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgb(var(--bg-rgb) / 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--line)',
        boxShadow: '0 -6px 32px rgba(0,0,0,0.55)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
      }}>
        {/* Red gradient top line */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(220,15,45,0.7) 40%, rgba(220,15,45,0.9) 50%, rgba(220,15,45,0.7) 60%, transparent)',
        }}/>

        {/* Tabs row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          height: NAV_H, paddingLeft: 6, paddingRight: 6,
        }}>
          {TABS.map((tab, idx) => {
            /* Center FAB */
            if ('isCenter' in tab && tab.isCenter) return (
              <button key={idx} className="npk-tab"
                onClick={() => setJoinOpen(true)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px',
                  marginTop: -16,
                }}>
                <div className="npk-fab-ring" style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'linear-gradient(140deg, #ff2040 0%, #DC0F2D 50%, #a80a20 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.18)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Top shine */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'48%', background:'linear-gradient(180deg,rgba(255,255,255,.2) 0%,transparent 100%)', borderRadius:'50% 50% 0 0' }}/>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  {tab.label}
                </span>
              </button>
            );

            /* Menu button */
            if ('isMenu' in tab && tab.isMenu) return (
              <button key={idx} className="npk-tab"
                onClick={() => setMenuOpen(true)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 4, padding: '6px 4px',
                  background: menuOpen ? 'var(--surface-2)' : 'none',
                  border: 'none', cursor: 'pointer', borderRadius: 0,
                }}>
                <div style={{ position: 'relative' }}>
                  <Menu size={22} strokeWidth={menuOpen ? 2 : 1.6}
                    color={menuOpen ? 'var(--text)' : 'var(--text-muted)'}/>
                  {menuOpen && <div style={{
                    position: 'absolute', bottom: -7, left: '50%',
                    width: 4, height: 4, borderRadius: '50%', background: '#DC0F2D',
                    animation: 'npk-dot-in .2s ease both',
                  }}/>}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: menuOpen ? 700 : 500,
                  color: menuOpen ? 'var(--text)' : 'var(--text-muted)',
                  transition: 'color .18s',
                }}>{tab.label}</span>
              </button>
            );

            /* Regular link */
            const Icon = tab.icon!;
            const isActive = tab.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.href!);

            return (
              <Link key={idx} to={tab.href!} className="npk-tab"
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 4, padding: '6px 4px', textDecoration: 'none',
                  background: isActive ? 'var(--surface-2)' : 'none',
                  borderRadius: 0,
                }}>
                <div style={{ position: 'relative' }}>
                  <Icon size={22} strokeWidth={isActive ? 2 : 1.6}
                    color={isActive ? 'var(--text)' : 'var(--text-muted)'}/>
                  {isActive && <div style={{
                    position: 'absolute', bottom: -7, left: '50%',
                    width: 4, height: 4, borderRadius: '50%', background: '#DC0F2D',
                    animation: 'npk-dot-in .2s ease both',
                  }}/>}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  transition: 'color .18s',
                }}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {menuOpen && <MenuDrawer onClose={() => setMenuOpen(false)} />}
      {joinOpen  && <JoinSheet  onClose={() => setJoinOpen(false)} />}
    </div>
  );

  return createPortal(bar, document.body);
}
