import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TickerSection } from '@/sections/TickerSection';
import { fetchProgramBlocks, type PublicProgramBlock } from '@/lib/api';
import { ArrowUpRight, FileText } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLanguage } from '@/i18n/LanguageContext';
import { useLocation } from 'react-router-dom';
import { getLenis } from '@/hooks/useLenis';

const FALLBACK_BLOCKS: PublicProgramBlock[] = [
  { id: '1', n: 1, keyword: 'ТРУД', title: 'Человек труда', lead1: 'Страна держится не на должностях.', lead2: 'Страна держится на людях труда.', points: ['Рабочие профессии — почёт, уважение и достойный доход', 'Национальная программа «Человек труда»', 'Жилищные, образовательные и соцпрограммы для рабочих, инженеров, учителей, врачей', 'Рост производительности = рост зарплат', 'Государство защищает права каждого работника', 'Новые профессии — через массовую переподготовку кадров'], imageUrl: null, sortOrder: 0 },
  { id: '2', n: 2, keyword: 'СЛОВО', title: 'Государство, которое держит слово', lead1: 'Если принимаются законы — они должны работать.', lead2: 'Если даются обещания — они должны выполняться.', points: ['Государство держит слово', 'Человек важнее отчёта', 'Оценка чиновников — только по реальной жизни людей', 'Персональная ответственность за каждую госпрограмму', 'Открытый бюджет: каждый тенге на виду у общества', 'Общественный контроль и прозрачность решений'], imageUrl: null, sortOrder: 1 },
  { id: '3', n: 3, keyword: 'ЗАКОН', title: 'Справедливость работает', lead1: 'Один закон для всех.', lead2: 'Не должность. Не влияние. Только закон.', points: ['Закон одинаков для всех — от гражданина до чиновника', 'Успех зависит от знаний и труда, не от связей', 'Справедливость — не лозунг, а основа государственной политики', 'Территориальная справедливость: одинаковые возможности в каждом регионе', 'Рост экономики должен ощущаться в жизни каждой семьи'], imageUrl: null, sortOrder: 2 },
  { id: '4', n: 4, keyword: 'ЛЮДИ', title: 'Экономика для людей', lead1: 'Экономика должна работать не ради отчётов —', lead2: 'ради человека.', points: ['Главная цель — рост доходов и благополучия семей', 'Честная конкуренция без административных привилегий', 'Сильный средний класс — стратегическая цель государства', 'Новые рабочие места во всех регионах страны', 'Предпринимательство — главная социальная сила', 'Природные богатства — на образование, медицину, инфраструктуру'], imageUrl: null, sortOrder: 3 },
  { id: '5', n: 5, keyword: 'ЖИЛЬЁ', title: 'Жильё для работающей семьи', lead1: 'Собственное жильё — не мечта.', lead2: 'Это достижимая цель работающей семьи.', points: ['Народная ипотека для работающих семей, молодых специалистов, учителей и врачей', 'Доступная аренда с правом выкупа', 'Жилищное строительство по всей стране — не только в мегаполисах', 'Прозрачные жилищные программы без бюрократии'], imageUrl: null, sortOrder: 4 },
  { id: '6', n: 6, keyword: 'ЗНАНИЯ', title: 'Образование и социальные лифты', lead1: 'Будущее ребёнка не должно зависеть', lead2: 'от почтового индекса его дома.', points: ['Качественная школа — в каждом городе и ауле страны', 'Развитие технического и профессионального образования', 'Поддержка талантливой молодёжи из всех регионов', 'Обучение на протяжении всей жизни'], imageUrl: null, sortOrder: 5 },
  { id: '7', n: 7, keyword: 'РЕГИОНЫ', title: 'Сильные регионы — сильный Казахстан', lead1: 'Не должно быть Казахстана', lead2: 'первого и второго сорта.', points: ['Рабочие места — рядом с домом', 'Доступная медицина в каждом районном центре', 'Современная школа, дорога и интернет — по всей стране', 'Новые центры роста во всех регионах'], imageUrl: null, sortOrder: 6 },
  { id: '8', n: 8, keyword: 'БУДУЩЕЕ', title: 'Экономика будущего', lead1: 'Будущее нельзя ждать.', lead2: 'Его нужно создавать.', points: ['Технологии должны работать на человека', 'От сырьевой экономики — к экономике знаний', 'Переподготовка кадров для профессий нового времени', 'Инновационные кластеры и технопарки'], imageUrl: null, sortOrder: 7 },
  { id: '9', n: 9, keyword: 'ЗДОРОВЬЕ', title: 'Здоровье и достойная жизнь', lead1: 'Никто не должен становиться', lead2: 'беднее из-за болезни.', points: ['Доступная медицина — базовое право каждого гражданина', 'Единые стандарты помощи от аула до столицы', 'Профилактика и ранняя диагностика', 'Достойные условия труда для врачей и медсестёр'], imageUrl: null, sortOrder: 8 },
  { id: '10', n: 10, keyword: 'СЕМЬЯ', title: 'Семья и дети', lead1: 'Сильная семья — сильная страна.', lead2: 'Дети — главный национальный капитал.', points: ['Поддержка семьи — приоритет государственной политики', 'Жильё и работа для молодых семей', 'Доступные детские сады, секции и кружки', 'Равные возможности для каждого ребёнка'], imageUrl: null, sortOrder: 9 },
];

function VideoSection() {
  const { language } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = language === 'kz' ? '/videos/home-kz.mp4' : '/videos/home-ru.mp4';

  const play = () => {
    if (videoRef.current) {
      videoRef.current.controls = true;
      videoRef.current.play().catch(() => {});
    }
    setPlaying(true);
  };

  return (
    <section style={{ maxWidth: 1180, margin: 'clamp(64px,9vw,120px) auto 0', padding: '0 clamp(16px,4vw,44px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26' }}>Агитационный ролик</div>
          <h2 style={{ margin: '14px 0 0', fontSize: 'clamp(28px,4vw,50px)', fontWeight: 800, lineHeight: 1.03, letterSpacing: '-.025em' }}>Смотрите и делитесь</h2>
        </div>
        <a href="/vstupit" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.24)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>Присоединиться →</a>
      </div>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: '#000' }}>
        <video ref={videoRef} src={videoUrl} playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {!playing && (
          <button type="button" onClick={play} aria-label="Воспроизвести" style={{ position: 'absolute', inset: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.5))' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'clamp(72px,9vw,110px)', height: 'clamp(72px,9vw,110px)', borderRadius: '50%', background: '#db1f26', color: '#fff', fontSize: 'clamp(24px,3vw,34px)', paddingLeft: 6 }}>▶</span>
          </button>
        )}
      </div>
    </section>
  );
}

export function ProgramPage() {
  const t = useT();
  const { language } = useLanguage();
  const location = useLocation();
  const programPdfUrl = language === 'kz' ? '/documents/program-kz.pdf' : '/documents/program-ru.pdf';
  const [blocks, setBlocks] = useState<PublicProgramBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProgramBlocks()
      .then((data) => { if (!cancelled) setBlocks(data.length > 0 ? data : FALLBACK_BLOCKS); })
      .catch(() => { if (!cancelled) setBlocks(FALLBACK_BLOCKS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 160;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      window.scrollTo(0, top);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, blocks, location.hash]);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* HERO — та же пропорция 40/60 и тот же ритм, что у главной страницы. */}
      <section className="bg-bg overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-stretch min-h-[500px] lg:min-h-[570px]">
          <div className="w-full md:w-2/5 flex items-center px-6 md:pl-12 md:pr-8 lg:pl-16 lg:pr-10 xl:pl-20 xl:pr-12 py-14 md:py-20">
            <div className="max-w-[520px]">
              <div className="w-12 h-[3px] bg-accent-brand mb-7" />
              <p className="text-label font-bold tracking-[0.16em] uppercase text-accent-brand mb-5">Предвыборная программа</p>
              <h1 className="font-formular text-[36px] sm:text-[44px] md:text-[36px] lg:text-[42px] xl:text-[52px] font-bold text-text-base leading-[1.04] tracking-tight">
                {t('program.page.titleMain')} <span className="text-accent-brand dark:text-text-base">{t('program.page.titleAccent')}</span>
              </h1>
              <p className="text-[17px] md:text-[19px] text-text-muted leading-relaxed mt-7 max-w-[42ch]">
                Каждый, кто честно работает, должен жить достойно.
              </p>
            </div>
          </div>

          <div className="w-full md:w-3/5 min-h-[310px] md:min-h-0 relative overflow-hidden bg-surface-2">
            <img
              src="/images/congress-vote.jpg"
              alt="Предвыборная программа Народной партии Казахстана"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Используем тикер главной без отдельной скорости и дублирующего текста. */}
      <TickerSection />

      {/* PROGRAM HEADER */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,120px) clamp(16px,4vw,44px) clamp(24px,4vw,52px)' }}>
        <div style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26' }}>Программа партии</div>
        <h2 style={{ margin: '16px 0 0', fontSize: 'clamp(30px,4.6vw,58px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.025em', maxWidth: '20ch' }}>Десять направлений справедливой страны</h2>
      </div>

      {/* PROGRAM BLOCKS */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(16px,4vw,44px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,28px)' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,.4)' }}>Загрузка...</div>
        ) : blocks.map((b, i) => {
          const isRed = (i + 1) % 4 === 0;
          return (
          <ScrollReveal key={b.id} delay={0.05}>
            <section id={`program-${String(b.n).padStart(2, '0')}`} style={{ position: 'relative', overflow: 'hidden', borderRadius: '0', padding: 'clamp(38px,5vw,80px) clamp(26px,4vw,72px)', background: isRed ? '#db1f26' : '#0e0e0f', color: '#fff', border: isRed ? '1px solid rgba(0,0,0,.12)' : '1px solid rgba(255,255,255,.09)', scrollMarginTop: 180 }}>
              <span aria-hidden style={{ position: 'absolute', top: '-.28em', right: '.04em', fontSize: 'clamp(150px,26vw,400px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.04em', color: isRed ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.035)', pointerEvents: 'none', zIndex: 0 }}>{b.keyword}</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'clamp(40px,6vw,76px)', fontWeight: 800, lineHeight: 1, color: isRed ? '#0a0a0a' : '#db1f26', letterSpacing: '-.03em' }}>{String(b.n).padStart(2, '0')}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: isRed ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.5)' }}>{b.title}</span>
                </div>
                <h3 style={{ margin: '22px 0 0', fontSize: 'clamp(28px,4.2vw,56px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-.025em', maxWidth: '18ch' }}>
                  {b.lead1}{' '}<span style={{ color: isRed ? '#0a0a0a' : '#db1f26' }}>{b.lead2}</span>
                </h3>
                <div style={{ marginTop: 'clamp(30px,3.4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '14px 40px' }}>
                  {b.points.map((p, j) => (
                    <div key={j} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '6px 0' }}>
                      <span style={{ flexShrink: 0, width: 22, height: 2, marginTop: 14, background: isRed ? '#0a0a0a' : '#db1f26' }} />
                      <span style={{ fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.5, fontWeight: 500 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
          );
        })}
      </div>

      {/* VIDEO */}
      <div id="video">
        <VideoSection />
      </div>

      {/* CTA JOIN */}
      <section style={{ maxWidth: 1180, margin: 'clamp(64px,9vw,120px) auto clamp(40px,6vw,80px)', padding: '0 clamp(16px,4vw,44px)' }}>
        <ScrollReveal>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0', background: '#db1f26', padding: 'clamp(40px,5vw,84px) clamp(26px,4vw,72px)' }}>
            <span aria-hidden style={{ position: 'absolute', bottom: '-.34em', right: '.02em', fontSize: 'clamp(140px,24vw,360px)', fontWeight: 800, lineHeight: 1, color: 'rgba(0,0,0,.08)', pointerEvents: 'none' }}>НПК</span>
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(30px,4vw,56px)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)' }}>Присоединяйтесь</div>
                <h2 style={{ margin: '14px 0 0', fontSize: 'clamp(30px,4.4vw,58px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-.03em' }}>Вступайте в Народную партию Казахстана</h2>
                <p style={{ margin: '22px 0 0', maxWidth: '40ch', fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,.85)' }}>Власть — народу. Билік — халыққа. Вместе мы строим страну справедливых возможностей.</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <a href="/vstupit" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '20px 40px', background: '#050505', color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 700 }}>Подать заявку →</a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FULL PROGRAM PDF */}
      <section id="full-program" className="max-w-[1180px] mx-auto px-4 md:px-11 pb-16 md:pb-24" style={{ scrollMarginTop: 180 }}>
        <ScrollReveal>
          <div className="border-y border-line py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-7">
            <div className="flex items-start gap-4">
              <FileText size={28} className="text-accent-brand shrink-0 mt-1" />
              <div>
                <p className="text-label font-bold tracking-[0.14em] uppercase text-accent-brand">{t('program.document.label')}</p>
                <h2 className="text-heading-sm md:text-heading font-bold text-text-base mt-2">{t('program.document.title')}</h2>
                <p className="text-body text-text-muted mt-2">{t('program.document.description')}</p>
              </div>
            </div>
            <a
              href={programPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-accent-brand text-white px-7 py-4 text-body font-bold hover:brightness-90 transition shrink-0"
            >
              {t('program.document.cta')} <ArrowUpRight size={18} />
            </a>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
