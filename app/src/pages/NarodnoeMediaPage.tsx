import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Youtube } from 'lucide-react';
import { usePageBlocks } from '@/hooks/usePageBlocks';

interface HeroBlock {
  titleRu?: string; subtitleRu?: string;
  ctaLabelRu?: string; ctaHref?: string;
}
interface TextBlock {
  headingRu?: string; textRu?: string;
}

/* ─── Data ──────────────────────────────────────────────────────────── */
const SOCIALS = [
  { name: 'YouTube',   count: 139000, url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA',  icon: 'yt' },
  { name: 'TikTok',    count: 113200, url: 'https://www.tiktok.com/@halyk_partiyasy',                   icon: 'tt' },
  { name: 'Instagram', count: 12700,  url: 'https://www.instagram.com/halyk_partiyasy/',                icon: 'ig' },
  { name: 'Facebook',  count: 7000,   url: 'https://www.facebook.com/halykpartiyasy',                   icon: 'fb' },
  { name: 'Telegram',  count: 313,    url: 'https://t.me/halykparty',                                   icon: 'tg' },
];

const PROJECTS = [
  { tag: 'Информационная программа', title: '«Ақпар»',            desc: 'Главные события страны и мира — коротко, честно и по делу. Информационный пульс партии.',                  url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', image: '/images/marquee-1.jpg' },
  { tag: 'Парламентская жизнь',      title: '«Фракция покажет»',  desc: 'Как депутаты фракции отстаивают интересы народа в Парламенте — без бюрократического тумана.',              url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', image: '/images/marquee-3.jpg' },
  { tag: 'Репортажи с мест',         title: '«Регионы Аймақтар»', desc: 'Реальная жизнь регионов Казахстана: проблемы, люди и решения — от аула до мегаполиса.',                  url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', image: '/images/marquee-5.jpg' },
];

const TEAM = [
  { name: 'Имя Фамилия', role: 'Руководитель медиацентра',      image: '/images/candidate-1.jpg' },
  { name: 'Имя Фамилия', role: 'Ведущий программы «Ақпар»',    image: '/images/candidate-2.jpg' },
  { name: 'Имя Фамилия', role: 'Режиссёр эфира',               image: '/images/candidate-3.jpg' },
  { name: 'Имя Фамилия', role: 'Оператор-постановщик',         image: '/images/candidate-4.jpg' },
];

const STUDIO_IMAGES = [
  { image: '/images/marquee-2.jpg', placeholder: 'Студия — общий план',  span2: true },
  { image: '/images/marquee-4.jpg', placeholder: 'Съёмочный процесс',    span2: false },
  { image: '/images/candidate-1.jpg', placeholder: 'За кадром',          span2: false },
  { image: '/images/candidate-2.jpg', placeholder: 'Аппаратная / монтаж',span2: false },
  { image: '/images/candidate-3.jpg', placeholder: 'Ведущие в кадре',    span2: false },
];

const TICKER = ['Ақпар', 'Фракция покажет', 'Регионы Аймақтар', 'Прямой эфир', 'Народное медиа'];

function fmtCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace('.', '.') + 'K';
  return n.toString();
}

/* ─── Social Icon ────────────────────────────────────────────────────── */
function SocialIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const s = size;
  if (icon === 'yt') return <svg viewBox="0 0 24 24" fill="currentColor" width={s} height={s}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/></svg>;
  if (icon === 'tt') return <svg viewBox="0 0 24 24" fill="currentColor" width={s} height={s}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.79a8.18 8.18 0 0 0 4.78 1.52V6.86a4.85 4.85 0 0 1-1.01-.17z"/></svg>;
  if (icon === 'ig') return <svg viewBox="0 0 24 24" fill="currentColor" width={s} height={s}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
  if (icon === 'fb') return <svg viewBox="0 0 24 24" fill="currentColor" width={s} height={s}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  if (icon === 'tg') return <svg viewBox="0 0 24 24" fill="currentColor" width={s} height={s}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
  return null;
}

/* ─── Breadcrumbs ────────────────────────────────────────────────────── */
function Breadcrumbs() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: 'rgba(255,255,255,.4)' }}>
      <Link to="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>Главная</Link>
      <ChevronRight size={12} />
      <Link to="/novosti" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>Пресс-центр</Link>
      <ChevronRight size={12} />
      <span style={{ color: '#fff' }}>Халық үні Қазақстан</span>
    </nav>
  );
}

/* ─── Count-up ───────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = v >= 1000 ? Math.round(v / 1000) + 'K+' : v.toString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return ref;
}

function useSocCount(target: number, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = fmtCount(v);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return ref;
}

/* ─── Social Card ─────────────────────────────────────────────────────── */
function SocialCard({ s }: { s: typeof SOCIALS[0] }) {
  const [hov, setHov] = useState(false);
  const countRef = useSocCount(s.count);
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22, borderRadius: 0, background: '#050505', border: `1px solid ${hov ? 'rgba(219,31,38,.6)' : 'rgba(255,255,255,.08)'}`, textDecoration: 'none', color: '#fff', transition: 'transform .25s ease, border-color .25s ease', transform: hov ? 'translateY(-4px)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 42, height: 42, borderRadius: 0, background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <SocialIcon icon={s.icon} size={18} />
        </div>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 700 }}>↗</span>
      </div>
      <div>
        <span ref={countRef} style={{ display: 'block', fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>0</span>
        <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>{s.name} · подписчики</span>
      </div>
    </a>
  );
}

/* ─── Project Card ───────────────────────────────────────────────────── */
function ProjectCard({ p }: { p: typeof PROJECTS[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 0, background: '#0e0e0f', border: `1px solid ${hov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.09)'}`, transition: 'border-color .25s' }}>
      <div style={{ width: '100%', height: 210, overflow: 'hidden', position: 'relative' }}>
        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 'clamp(22px,2.6vw,30px)', flex: 1 }}>
        <div>
          <span style={{ padding: '5px 12px', borderRadius: 0, background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.35)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#ff5a60' }}>{p.tag}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 'clamp(21px,2.2vw,27px)', fontWeight: 800, letterSpacing: '-.015em' }}>{p.title}</h3>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,.62)', flex: 1 }}>{p.desc}</p>
        <a href={p.url} target="_blank" rel="noopener noreferrer"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 0, border: `1.5px solid ${hov ? '#db1f26' : 'rgba(255,255,255,.24)'}`, color: hov ? '#db1f26' : '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, marginTop: 6, transition: 'border-color .2s, color .2s' }}>
          ▶ Смотреть на YouTube
        </a>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export function NarodnoeMediaPage() {
  const totalRef = useCountUp(270000);

  const { getBlock } = usePageBlocks('press-center');

  const hero = getBlock<HeroBlock>('press_hero');
  const heroTitleParts = (hero?.titleRu?.trim() || 'Народное медиа,\nкоторому верит народ').split('\n');
  const heroSubtitle = hero?.subtitleRu?.trim() || 'Собственная студия, ежедневный эфир и аудитория, которая опережает партийные СМИ страны. Мы освещаем внутреннюю и международную политику, обсуждаем важные социальные вопросы и продвигаем левоцентристские ценности справедливости.';
  const heroCtaLabel = hero?.ctaLabelRu?.trim() || 'Подписаться';
  const heroCtaHref = hero?.ctaHref?.trim() || 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA';

  const studio = getBlock<TextBlock>('press_studio');
  const studioHeading = studio?.headingRu?.trim() || 'Как работает народное медиа';
  const studioText = studio?.textRu?.trim() || 'Полный цикл производства — от идеи и съёмки до монтажа и публикации. Собственная студия в сердце партии.';

  const cta = getBlock<TextBlock>('press_cta');
  const ctaHeading = cta?.headingRu?.trim() || 'Подпишись на народное медиа';
  const ctaText = cta?.textRu?.trim() || 'Подписывайтесь, участвуйте в обсуждениях и будьте в курсе ключевых событий.';

  const tickerText = TICKER.join(' • ') + ' • ';

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes liveBlink{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>

      {/* ── Breadcrumbs ── */}
      <div>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(16px,4vw,44px) 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <Breadcrumbs />
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,44px) clamp(40px,5vw,70px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 80% 15%, rgba(219,31,38,.26), transparent 46%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 12px', border: '1px solid rgba(255,255,255,.16)', borderRadius: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', marginBottom: 26 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#db1f26', animation: 'liveBlink 1.6s infinite', display: 'block' }} />
            Медиа НПК · On Air
          </div>

          <h1 style={{ margin: '0 0 28px', fontWeight: 800, fontSize: 'clamp(42px,7.6vw,110px)', lineHeight: .94, letterSpacing: '-.035em' }}>
            {heroTitleParts.length === 2 ? (
              <>
                {heroTitleParts[0]}{' '}
                <span style={{ color: '#db1f26' }}>{heroTitleParts[1]}</span>
              </>
            ) : heroTitleParts.join(' ')}
          </h1>

          <p style={{ margin: '0 0 32px', maxWidth: '62ch', fontSize: 'clamp(16px,1.7vw,21px)', lineHeight: 1.55, color: 'rgba(255,255,255,.72)', fontWeight: 500 }}>
            {heroSubtitle}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href={heroCtaHref} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '17px 30px', background: '#db1f26', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700, borderRadius: 0, transition: 'transform .2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              <Youtube size={18} /> {heroCtaLabel} →
            </a>
            <a href="#projects"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '17px 30px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.24)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700, borderRadius: 0, transition: 'border-color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.24)')}>
              Наши программы
            </a>
          </div>
        </div>
      </section>

      {/* ── Counters ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(16px,4vw,44px)' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 0, background: '#0e0e0f', border: '1px solid rgba(255,255,255,.09)', padding: 'clamp(30px,4vw,56px)' }}>
          {/* Ghost number */}
          <span aria-hidden="true" style={{ position: 'absolute', top: '-.25em', right: '.03em', fontSize: 'clamp(130px,22vw,320px)', fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,.035)', pointerEvents: 'none', userSelect: 'none' }}>270K</span>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 'clamp(26px,3vw,40px)' }}>
              <span ref={totalRef} style={{ fontSize: 'clamp(52px,8vw,110px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em', color: '#db1f26' }}>0</span>
              <span style={{ fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700 }}>суммарная аудитория наших каналов</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              {SOCIALS.map(s => <SocialCard key={s.name} s={s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ marginTop: 'clamp(48px,7vw,90px)', padding: 'clamp(20px,3vw,44px) 0', borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marq 30s linear infinite' }}>
          {[tickerText, tickerText].map((_, i) => (
            <span key={i} aria-hidden={i > 0} style={{ flexShrink: 0, fontSize: 'clamp(34px,6vw,72px)', fontWeight: 800, letterSpacing: '-.02em', color: 'transparent', WebkitTextStroke: '1.3px rgba(255,255,255,.32)', whiteSpace: 'nowrap', paddingRight: '.3em' }}>
              {TICKER.map((item, j) => (
                <span key={j}>{item} <span style={{ color: '#db1f26', WebkitTextStroke: '0' }}>•</span> </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Projects ── */}
      <section id="projects" style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,44px) 0' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 16 }}>Медиапроекты</div>
        <h2 style={{ margin: '0 0 clamp(28px,3.6vw,48px)', fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.025em', maxWidth: '22ch' }}>Программы, которые смотрит страна</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(14px,1.8vw,22px)' }}>
          {PROJECTS.map((p, i) => <ProjectCard key={i} p={p} />)}
        </div>
      </section>

      {/* ── Studio ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,44px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 'clamp(26px,3.4vw,44px)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 16 }}>Наша студия</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.025em', maxWidth: '22ch' }}>{studioHeading}</h2>
          </div>
          <p style={{ margin: 0, maxWidth: '44ch', fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,.62)' }}>
            {studioText}
          </p>
        </div>
        {/* Bento grid: first image spans 2 cols + 2 rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridAutoRows: 220, gap: 'clamp(12px,1.6vw,20px)' }}>
          {STUDIO_IMAGES.map((img, i) => (
            <div key={i} style={{ gridColumn: img.span2 ? 'span 2' : 'span 1', gridRow: img.span2 ? 'span 2' : 'span 1', borderRadius: 0, overflow: 'hidden', background: '#0e0e0f', minHeight: 0 }}>
              <img src={img.image} alt={img.placeholder} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,44px) 0' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 16 }}>Медиакоманда</div>
        <h2 style={{ margin: '0 0 clamp(26px,3.4vw,44px)', fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.025em' }}>Люди, которые делают эфир</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'clamp(12px,1.6vw,20px)' }}>
          {TEAM.map((member, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.09)' }}>
              <div style={{ width: '100%', height: 240, overflow: 'hidden' }}>
                <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '18px 20px 22px' }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{member.name}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Follow CTA — RED block ── */}
      <section id="follow" style={{ maxWidth: 1180, margin: 'clamp(56px,8vw,100px) auto clamp(40px,6vw,80px)', padding: '0 clamp(16px,4vw,44px)' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 0, background: '#db1f26', padding: 'clamp(38px,5vw,72px)', textAlign: 'center' }}>
          {/* Ghost text */}
          <span aria-hidden="true" style={{ position: 'absolute', bottom: '-.34em', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(130px,22vw,320px)', fontWeight: 800, lineHeight: 1, color: 'rgba(0,0,0,.08)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}>ЭФИР</span>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.03em' }}>{ctaHeading}</h2>
            <p style={{ margin: '0 auto 30px', maxWidth: '52ch', fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,.85)' }}>
              {ctaText}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 0, background: '#050505', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, transition: 'transform .25s ease' }}>
                  <SocialIcon icon={s.icon} size={20} />
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
