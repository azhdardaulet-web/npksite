import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { fetchHistoryEvents, type PublicHistoryEvent } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

const FALLBACK_SECTIONS_RU: PublicHistoryEvent[] = [
  { id: '1', year: 2011, title: 'VI Внеочередной Съезд КНПК', text: '26 ноября 2011 года состоялся VI Внеочередной Съезд Коммунистической Народной партии Казахстана, на котором были утверждены 23 кандидата от партии на выборы депутатов Мажилиса Парламента 2012 года, в том числе лидер партии Владислав Косарев и кандидат в Президенты на выборах 2011 года Жамбыл Ахметбеков.', imageUrl: '/images/history/2011.jpg', sortOrder: 0 },
  { id: '2', year: 2016, title: 'Избрание в Парламент', text: 'КНПК по результатам выборов 2016 года была избрана в Парламент. Предвыборную борьбу в партии оценили как честную и справедливую. Доступ к СМИ, по мнению коммунистов, был свободным для всех партий. Каких-либо нарушений наблюдатели от НПК не зафиксировали.', imageUrl: '/images/history/2016.jpg', sortOrder: 1 },
  { id: '3', year: 2020, title: 'Переименование в Народную партию', text: 'На прошедшем 11 ноября 2020 года XV Внеочередном Съезде КНПК было принято решение о переименовании Коммунистической Народной партии Казахстана в Народную партию Казахстана со внесением соответствующих изменений в устав и программу партии.', imageUrl: '/images/history/2020.jpg', sortOrder: 2 },
  { id: '4', year: 2021, title: 'XVII Съезд и фракция в Мажилисе', text: 'В Нур-Султане состоялся XVII Внеочередной Съезд Народной партии Казахстана. В ходе него партийцы подвели итоги прошедших выборов 2021 года депутатов Мажилиса Парламента РК и маслихатов, а также избрали представителей в парламентскую фракцию партии.', imageUrl: '/images/history/2021.jpg', sortOrder: 3 },
  { id: '5', year: 2022, title: 'Новое руководство партии', text: '28 марта 2022 года на XIX Внеочередном Съезде партии председателем НПК был избран Ермухамет Ертысбаев. Прежний руководитель, глава парламентской фракции НПК, депутат Мажилиса Айкын Конуров стал первым заместителем председателя.', imageUrl: '/images/history/2022.jpg', sortOrder: 4 },
  { id: '6', year: 2026, title: 'Съезд партии, новый председатель', text: 'Председатель Народной партии Казахстана Ермухамет Ертысбаев снял с себя руководящие полномочия. Новым главой НПК избран Нурсултан Шоканов. Такое решение принял Внеочередной Съезд партии, состоявшийся 27 июня.', imageUrl: '/images/history/2026.jpg', sortOrder: 5 },
];

// Казахские тексты за 2011–2022 годы сверены с официальной историей партии:
// https://halykpartiyasy.kz/kz/partiya-tarihy
const FALLBACK_SECTIONS_KZ: PublicHistoryEvent[] = [
  { id: '1-kz', year: 2011, title: 'ҚКХП VI кезектен тыс съезі', text: '2011 жылғы 26 қарашада Қазақстан Коммунистік Халық партиясының VI кезектен тыс съезі өтті. Съезде 2012 жылғы Парламент Мәжілісі депутаттарының сайлауына партия атынан 23 кандидат ұсынылды. Олардың қатарында партия көшбасшысы Владислав Косарев пен 2011 жылғы президент сайлауына қатысқан Жамбыл Ахметбеков болды.', imageUrl: '/images/history/2011.jpg', sortOrder: 0 },
  { id: '2-kz', year: 2016, title: 'Парламент Мәжілісіне сайлану', text: 'ҚКХП 2016 жылғы сайлаудың қорытындысы бойынша Парламент Мәжілісіне өтті. Партия өкілдері сайлауалды науқанды адал әрі әділ өтті деп бағалады. Олардың пікірінше, бұқаралық ақпарат құралдары барлық партияға бірдей қолжетімді болды. ҚКХП бақылаушылары сайлау барысында заң бұзушылықтарды тіркеген жоқ.', imageUrl: '/images/history/2016.jpg', sortOrder: 1 },
  { id: '3-kz', year: 2020, title: 'Қазақстан Халық партиясы болып қайта аталды', text: '2020 жылғы 11 қарашада өткен ҚКХП XV кезектен тыс съезінде Қазақстан Коммунистік Халық партиясын Қазақстан Халық партиясы деп қайта атау туралы шешім қабылданды. Партияның Жарғысы мен Бағдарламасына тиісті өзгерістер енгізілді. Бұл қадам 2021 жылғы 10 қаңтарда өткен Парламент Мәжілісінің сайлауы қарсаңында партияны қолдайтын азаматтар қатарын кеңейтуге бағытталды.', imageUrl: '/images/history/2020.jpg', sortOrder: 2 },
  { id: '4-kz', year: 2021, title: 'XVII съезд және Мәжілістегі фракция', text: 'Нұр-Сұлтан қаласында Қазақстан Халық партиясының XVII кезектен тыс съезі өтті. Съезде 2021 жылғы Парламент Мәжілісі мен мәслихаттар депутаттары сайлауының қорытындысы шығарылып, партияның парламенттік фракциясының құрамы бекітілді. Фракция құрамына Айқын Қоңыров, Жамбыл Ахметбеков, Ирина Смирнова, Александр Милютин, Сергей Решетников, Айбек Паяев, Ғазиз Құлахметов, Ерлан Смайлов, Файзолла Каменов және Айжан Сқақова кірді.', imageUrl: '/images/history/2021.jpg', sortOrder: 3 },
  { id: '5-kz', year: 2022, title: 'Партияның жаңа басшылығы', text: '2022 жылғы 28 наурызда өткен партияның XIX кезектен тыс съезінде Ермұхамет Ертісбаев ҚХП төрағасы болып сайланды. ҚХП парламенттік фракциясының бұрынғы жетекшісі, Мәжіліс депутаты Айқын Қоңыров партия төрағасының бірінші орынбасары қызметіне тағайындалды.', imageUrl: '/images/history/2022.jpg', sortOrder: 4 },
  { id: '6-kz', year: 2026, title: 'Партия съезі және жаңа төраға', text: '2026 жылғы 27 маусымда Қазақстан Халық партиясының кезектен тыс съезі өтті. Съезде Ермұхамет Ертісбаев партия төрағасы қызметін аяқтады. Делегаттар Нұрсұлтан Шоқановты ҚХП төрағасы етіп сайлады.', imageUrl: '/images/history/2026.jpg', sortOrder: 5 },
];

function applyHistoryCorrections(items: PublicHistoryEvent[]) {
  return items.map((item) => {
    // Русские формулировки из CMS могли сохраниться до редакторской правки.
    const hasRussianText = /[А-Яа-яЁё]/.test(item.title) && !/[ӘәҒғҚқҢңӨөҰұҮүҺһІі]/.test(item.title);
    if (!hasRussianText) return item;

    let title = item.title;
    let text = item.text;
    if (item.year === 2011) {
      title = 'VI Внеочередной Съезд КНПК';
      text = text
        .replace('VI внеочередной съезд', 'VI Внеочередной Съезд')
        .replace('Коммунистической народной партии', 'Коммунистической Народной партии')
        .replace('депутатов мажилиса парламента', 'депутатов Мажилиса Парламента')
        .replace('кандидат в президенты', 'кандидат в Президенты');
    } else if (item.year === 2016) {
      title = 'Избрание в Парламент';
      text = text
        .replace('по результатам выборов-2016 прошла в парламент', 'по результатам выборов 2016 года была избрана в Парламент')
        .replace('прошла в парламент', 'была избрана в Парламент');
    } else if (item.year === 2020) {
      text = text.replace('XV Внеочередном съезде', 'XV Внеочередном Съезде');
    } else if (item.year === 2022) {
      text = text.replace('XIX внеочередном съезде', 'XIX Внеочередном Съезде');
    } else if (item.year === 2026) {
      text = text.replace('с себа', 'с себя').replace('принял внеочередной Съезд', 'принял Внеочередной Съезд');
    }
    return { ...item, title, text };
  });
}

function localizeHistoryItems(items: PublicHistoryEvent[], language: 'ru' | 'kz') {
  if (language === 'ru') return applyHistoryCorrections(items);

  const fallbackByYear = new Map(FALLBACK_SECTIONS_KZ.map((item) => [item.year, item]));
  return items.map((item) => {
    const hasKazakhText = /[ӘәҒғҚқҢңӨөҰұҮүҺһІі]/.test(`${item.title} ${item.text}`);
    const fallback = fallbackByYear.get(item.year);
    return hasKazakhText || !fallback
      ? item
      : { ...item, title: fallback.title, text: fallback.text };
  });
}

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
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const [sections, setSections] = useState<PublicHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchHistoryEvents(language)
      .then((data) => { if (!cancelled) setSections(data.length > 0 ? localizeHistoryItems(data, language) : (isKz ? FALLBACK_SECTIONS_KZ : FALLBACK_SECTIONS_RU)); })
      .catch(() => { if (!cancelled) setSections(isKz ? FALLBACK_SECTIONS_KZ : FALLBACK_SECTIONS_RU); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isKz, language]);

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
      <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>{isKz ? 'Жүктеліп жатыр...' : 'Загрузка...'}</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* BREADCRUMBS */}
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{isKz ? 'Басты бет' : 'Главная'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/o-partii">{isKz ? 'Партия туралы' : 'О партии'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>{isKz ? 'Партия тарихы' : 'История'}</BreadcrumbPage>
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
        }}>{isKz ? 'Партия тарихы' : 'История партии'}</h1>
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
            borderRadius: '0',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              background: '#db1f26',
              borderRadius: '0',
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
                  borderRadius: '0',
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
              {isKz ? 'Жолды бірге жалғастырамыз' : 'Продолжаем путь вместе'}
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
              {isKz
                ? 'ҚХП тарихы халықтың құқығын қорғау жолындағы күреспен сабақтас. Бізге қосылыңыз!'
                : 'История НПК — это история борьбы за права народа. Присоединяйтесь к нам.'}
            </p>
            <Link
              to="/vstupit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 36px',
                borderRadius: '0',
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
              {isKz ? 'Партия қатарына қосылу' : 'Вступить в партию'}
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
