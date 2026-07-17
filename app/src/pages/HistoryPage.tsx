import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { fetchHistoryEvents, type PublicHistoryEvent } from '@/lib/api';

const FALLBACK_SECTIONS: PublicHistoryEvent[] = [
  { id: '1', year: 2011, title: 'VI внеочередной съезд КНПК', text: '26 ноября 2011 года состоялся VI внеочередной съезд Коммунистической народной партии Казахстана, на котором были утверждены 23 кандидата от партии на выборы депутатов мажилиса парламента 2012 года, в том числе лидер партии Владислав Косарев и кандидат в президенты на выборах 2011 года Жамбыл Ахметбеков.', imageUrl: '/images/history/2011.jpg', sortOrder: 0 },
  { id: '2', year: 2016, title: 'Проход в парламент', text: 'КНПК по результатам выборов-2016 прошла в парламент. Предвыборную борьбу в партии оценили как честную и справедливую. Доступ к СМИ, по мнению коммунистов, был свободным для всех партий. Каких-либо нарушений наблюдатели от НПК не зафиксировали.', imageUrl: '/images/history/2016.jpg', sortOrder: 1 },
  { id: '3', year: 2020, title: 'Переименование в Народную партию', text: 'На прошедшем 11 ноября 2020 года XV Внеочередном съезде КНПК было принято решение о переименовании Коммунистической Народной партии Казахстана в Народную партию Казахстана со внесением соответствующих изменений в устав и программу партии.', imageUrl: '/images/history/2020.jpg', sortOrder: 2 },
  { id: '4', year: 2021, title: 'XVII Съезд и фракция в Мажилисе', text: 'В Нур-Султане состоялся XVII Внеочередной Съезд Народной партии Казахстана. В ходе него партийцы подвели итоги прошедших выборов 2021 года депутатов Мажилиса Парламента РК и маслихатов, а также избрали представителей в парламентскую фракцию партии.', imageUrl: '/images/history/2021.jpg', sortOrder: 3 },
  { id: '5', year: 2022, title: 'Новое руководство партии', text: '28 марта 2022 года на XIX внеочередном съезде партии председателем НПК был избран Ермухамет Ертысбаев. Прежний руководитель, глава парламентской фракции НПК, депутат Мажилиса Айкын Конуров стал первым заместителем председателя.', imageUrl: '/images/history/2022.jpg', sortOrder: 4 },
  { id: '6', year: 2026, title: 'Съезд партии, новый председатель', text: 'Председатель Народной партии Казахстана Ермухамет Ертысбаев снял с себа руководящие полномочия. Новым главой НПК избран Нурсултан Шоканов. Такое решение принял внеочередной Съезд партии, состоявшийся 27 июня.', imageUrl: '/images/history/2026.jpg', sortOrder: 5 },
];

function useAnimatedYear(targetYear: number, duration = 350) {
  const [display, setDisplay] = useState(targetYear);
  const rafRef = useRef<number>(0);
  const startRef = useRef(targetYear);

  useEffect(() => {
    const start = startRef.current;
    const diff = targetYear - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = targetYear;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetYear, duration]);

  return display;
}

export function HistoryPage() {
  const [sections, setSections] = useState<PublicHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryEvents()
      .then((data) => { if (!cancelled) setSections(data.length > 0 ? data : FALLBACK_SECTIONS); })
      .catch(() => { if (!cancelled) setSections(FALLBACK_SECTIONS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const activeYear = sections[activeIndex]?.year ?? 0;
  const animatedYear = useAnimatedYear(activeYear, 400);
  const activeTitle = sections[activeIndex]?.title ?? '';

  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 190;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -45% 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (sections.length === 0) return;
    const handleScroll = () => {
      const first = sectionRefs.current[0];
      const last = sectionRefs.current[sectionRefs.current.length - 1];
      if (!first || !last) return;

      const firstTop = first.offsetTop;
      const lastBottom = last.offsetTop + last.offsetHeight;
      const range = lastBottom - firstTop;
      const pos = window.scrollY + window.innerHeight * 0.35 - firstTop;
      const pct = Math.max(0, Math.min(100, (pos / range) * 100));
      setProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', paddingTop: 160, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* BREADCRUMBS */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '128px 40px 0' }}>
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/o-partii">О партии</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>История</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      {/* HERO */}
      <section style={{ padding: '24px 40px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          margin: '0 0 16px',
        }}>История партии</h1>
      </section>

      {/* TICKER */}
      <div style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--line)',
        padding: '20px 0',
        background: 'var(--bg)',
      }}>
        <div style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'nph-ticker 40s linear infinite',
        }}>
          {Array(4).fill(null).map((_, i) => (
            <span key={i} style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              paddingRight: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '60px',
            }}>
              {sections.map((s) => (
                <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#db1f26', opacity: 0.5 }} />
                  {s.year} — {s.title}
                </span>
              ))}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes nph-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* STICKY BAR */}
      <div style={{
        position: 'sticky',
        top: '108px',
        zIndex: 30,
        background: 'rgb(var(--bg-rgb) / 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
        padding: '16px 40px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
          }}>
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(i)}
                style={{
                  fontSize: '14px',
                  fontWeight: i === activeIndex ? 700 : 600,
                  color: i === activeIndex ? '#db1f26' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: '4px 0',
                  background: 'none',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  if (i !== activeIndex) e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  if (i !== activeIndex) e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {s.year}
              </button>
            ))}
          </div>
          <div style={{
            position: 'relative',
            height: '2px',
            background: 'var(--line)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              background: '#db1f26',
              borderRadius: '2px',
              width: `${progress}%`,
              transition: 'width 0.15s linear',
            }} />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div ref={mainRef} style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '80px',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '60px 40px 120px',
      }}>
        {/* LEFT */}
        <div style={{
          position: 'sticky',
          top: '184px',
          alignSelf: 'start',
          height: 'fit-content',
        }}>
          <div style={{
            fontSize: 'clamp(56px, 8vw, 96px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            transition: 'all 0.3s ease',
          }}>
            {animatedYear}
          </div>
          <div style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            lineHeight: '1.4',
            marginTop: '14px',
            transition: 'all 0.3s ease',
          }}>
            {activeTitle}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sections.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => { sectionRefs.current[i] = el; }}
              style={{
                minHeight: '70vh',
                padding: '40px 0 80px',
                borderBottom: i === sections.length - 1 ? 'none' : '1px solid var(--line)',
                opacity: i === activeIndex ? 1 : 0.25,
                transition: 'opacity 0.5s ease',
              }}
            >
              <h3 style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 700,
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                margin: '0 0 20px',
              }}>
                {s.title}
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: 'var(--text-muted)',
                margin: '0 0 36px',
                maxWidth: '640px',
              }}>
                {s.text}
              </p>
              {s.imageUrl && (
                <div style={{
                  borderRadius: '32px',
                  overflow: 'hidden',
                  maxWidth: '720px',
                  background: 'var(--surface-2)',
                }}>
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      transition: 'transform 0.6s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* CTA */}
          <div style={{ padding: '80px 0 0', textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              lineHeight: '1.1',
            }}>
              Продолжаем путь вместе
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              margin: '0 0 28px',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              История НПК — это история борьбы за права народа. Присоединяйтесь к нам.
            </p>
            <Link
              to="/vstupit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 36px',
                borderRadius: '10000px',
                background: '#db1f26',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Вступить в партию
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .nph-main {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 40px 24px 80px;
          }
          .nph-main__left {
            position: relative;
            top: auto;
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--line);
          }
        }
      `}</style>
    </div>
  );
}
