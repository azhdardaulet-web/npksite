import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HistoryPage.css';

/* ===== DATA ===== */
const sections = [
  {
    year: 2011,
    title: 'VI внеочередной съезд КНПК',
    text: '26 ноября 2011 года состоялся VI внеочередной съезд Коммунистической народной партии Казахстана, на котором были утверждены 23 кандидата от партии на выборы депутатов мажилиса парламента 2012 года, в том числе лидер партии Владислав Косарев и кандидат в президенты на выборах 2011 года Жамбыл Ахметбеков.',
    image: '/images/2011.jpg',
    tags: ['VI съезд', '23 кандидата', 'Мажилис 2012'],
  },
  {
    year: 2016,
    title: 'Проход в парламент',
    text: 'КНПК по результатам выборов-2016 прошла в парламент. Предвыборную борьбу в партии оценили как честную и справедливую. Доступ к СМИ, по мнению коммунистов, был свободным для всех партий. Каких-либо нарушений наблюдатели от НПК не зафиксировали.',
    image: '/images/2016.jpg',
    tags: ['Выборы-2016', 'Парламент', 'Честные выборы'],
  },
  {
    year: 2020,
    title: 'Переименование в Народную партию',
    text: 'На прошедшем 11 ноября 2020 года XV Внеочередном съезде КНПК было принято решение о переименовании Коммунистической Народной партии Казахстана в Народную партию Казахстана со внесением соответствующих изменений в устав и программу партии. Данное решение было обосновано желанием расширить электоральную поддержку партии перед выборами в Мажилис Парламента Республики Казахстан, которые прошли 10 января 2021 года.',
    image: '/images/2020.jpg',
    tags: ['XV съезд', 'КНПК → НПК', 'Устав и программа'],
  },
  {
    year: 2021,
    title: 'XVII Съезд и фракция в Мажилисе',
    text: 'В Нур-Султане состоялся XVII Внеочередной Съезд Народной партии Казахстана. В ходе него партийцы подвели итоги прошедших выборов 2021 года депутатов Мажилиса Парламента РК и маслихатов, а также избрали представителей в парламентскую фракцию партии. В число депутатов вошли Айкын Конуров, Жамбыл Ахметбеков, Ирина Смирнова, Александр Милютин, Сергей Решетников, Айбек Паяев, Газиз Кулахметов, Ерлан Смайлов, Файзолла Каменов и Айжан Скакова.',
    image: '/images/2021.jpg',
    tags: ['XVII съезд', '10 депутатов', 'Фракция НПК'],
  },
  {
    year: 2022,
    title: 'Новое руководство партии',
    text: '28 марта 2022 года на XIX внеочередном съезде партии председателем НПК был избран Ермухамет Ертысбаев. Прежний руководитель, глава парламентской фракции НПК, депутат Мажилиса Айкын Конуров стал первым заместителем председателя.',
    image: '/images/2022.jpg',
    tags: ['XIX съезд', 'Ертысбаев', 'Председатель НПК'],
  },
  {
    year: 2026,
    title: 'Съезд партии, новый председатель',
    text: 'Председатель Народной партии Казахстана Ермухамет Ертысбаев снял с себя руководящие полномочия. Новым главой НПК избран Нурсултан Шоканов. Такое решение принял внеочередной Съезд партии, состоявшийся 27 июня.',
    image: '/images/2026.jpg',
    tags: ['Внеочередной съезд', 'Шоканов', 'Новый глава НПК'],
  },
];

/* ===== ANIMATED YEAR HOOK (odometer-style) ===== */
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
      // Ease-out cubic
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

/* ===== COMPONENT ===== */
export function HistoryPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);

  const activeYear = sections[activeIndex].year;
  const animatedYear = useAnimatedYear(activeYear, 400);
  const activeTags = sections[activeIndex].tags;

  /* Scroll to section by index */
  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  /* IntersectionObserver: which section is active */
  useEffect(() => {
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
  }, []);

  /* Progress bar: fills based on scroll position */
  useEffect(() => {
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
  }, []);

  return (
    <div className="nph">
      {/* ===== HERO ===== */}
      <section className="nph-hero">
        <h1 className="nph-hero__title">История партии</h1>
        <p className="nph-hero__text">
          От Коммунистической народной партии до Народной партии Казахстана —
          путь, который мы прошли вместе с народом.
        </p>
      </section>

      {/* ===== TICKER ===== */}
      <div className="nph-ticker">
        <div className="nph-ticker__track">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="nph-ticker__item">
              <span className="nph-ticker__dot" />2011 — VI СЪЕЗД КНПК
              <span className="nph-ticker__dot" />2016 — ПАРЛАМЕНТ
              <span className="nph-ticker__dot" />2020 — НАРОДНАЯ ПАРТИЯ
              <span className="nph-ticker__dot" />2022 — НОВОЕ РУКОВОДСТВО
              <span className="nph-ticker__dot" />2026 — НОВЫЙ ПРЕДСЕДАТЕЛЬ
            </span>
          ))}
        </div>
      </div>

      {/* ===== STICKY TIMELINE BAR ===== */}
      <div className="nph-bar">
        <div className="nph-bar__inner">
          <div className="nph-bar__years">
            {sections.map((s, i) => (
              <button
                key={s.year}
                className={`nph-bar__year ${i === activeIndex ? 'nph-bar__year--active' : ''}`}
                onClick={() => scrollToSection(i)}
              >
                {s.year}
              </button>
            ))}
          </div>
          <div className="nph-bar__track">
            <div
              className="nph-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===== MAIN: left sticky year + right scrolling content ===== */}
      <div className="nph-main" ref={mainRef}>
        {/* LEFT — sticky year counter */}
        <div className="nph-main__left">
          <div className="nph-year">{animatedYear}</div>
          <div className="nph-year__label">
            {activeIndex === 0 ? 'ОСНОВАНИЕ' :
             activeIndex === sections.length - 1 ? 'СЕГОДНЯ' :
             activeIndex < sections.length / 2 ? 'РАЗВИТИЕ' : 'ТРАНСФОРМАЦИЯ'}
          </div>
          <div className="nph-tags">
            {activeTags.map((tag) => (
              <span key={tag} className="nph-tag nph-tag--active">{tag}</span>
            ))}
          </div>
        </div>

        {/* RIGHT — scrolling sections */}
        <div className="nph-main__right">
          {sections.map((s, i) => (
            <div
              key={s.year}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className={`nph-section ${i === activeIndex ? 'nph-section--active' : ''}`}
            >
              <h3 className="nph-section__title">{s.title}</h3>
              <p className="nph-section__text">{s.text}</p>
              <div className="nph-section__img">
                <img src={s.image} alt={s.title} loading="lazy" />
              </div>
            </div>
          ))}

          {/* Final CTA */}
          <div style={{ padding: '80px 0 0', textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}>
              Продолжаем путь вместе
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
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
            >
              Вступить в партию
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
