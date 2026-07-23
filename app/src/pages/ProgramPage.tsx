import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TickerSection } from '@/sections/TickerSection';
import { ArrowUpRight, FileText } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLanguage } from '@/i18n/LanguageContext';
import { useLocation } from 'react-router-dom';
import { getLenis } from '@/hooks/useLenis';
import { PROGRAM_BLOCKS_KZ, PROGRAM_BLOCKS_RU } from '@/lib/programData';

function VideoSection() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
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
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26' }}>{isKz ? 'Үгіт-насихат бейнеролигі' : 'Агитационный ролик'}</div>
          <h2 style={{ margin: '14px 0 0', fontSize: 'clamp(28px,4vw,50px)', fontWeight: 700, lineHeight: 1.03, letterSpacing: '-.025em' }}>{isKz ? 'Көріңіз және бөлісіңіз' : 'Смотрите и делитесь'}</h2>
        </div>
        <a href="/vstupit" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.24)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>{isKz ? 'Қосылу →' : 'Присоединиться →'}</a>
      </div>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: '#000' }}>
        <video ref={videoRef} src={videoUrl} playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {!playing && (
          <button type="button" onClick={play} aria-label={isKz ? 'Ойнату' : 'Воспроизвести'} style={{ position: 'absolute', inset: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.5))' }}>
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
  const isKz = language === 'kz';
  const location = useLocation();
  const programPdfUrl = language === 'kz' ? '/documents/program-kz.pdf' : '/documents/program-ru.pdf';
  const blocks = isKz ? PROGRAM_BLOCKS_KZ : PROGRAM_BLOCKS_RU;
  const loading = false;

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
              <p className="text-label font-bold tracking-[0.16em] uppercase text-accent-brand mb-5">
                {isKz ? 'Сайлауалды бағдарлама' : 'Предвыборная программа'}
              </p>
              <h1 className="font-formular text-[36px] sm:text-[44px] md:text-[36px] lg:text-[42px] xl:text-[52px] font-bold text-text-base leading-[1.04] tracking-tight">
                {t('program.page.titleMain')} <span className="text-accent-brand dark:text-text-base">{t('program.page.titleAccent')}</span>
              </h1>
              <p className="text-[17px] md:text-[19px] text-text-muted leading-relaxed mt-7 max-w-[42ch]">
                {isKz ? (
                  <>Қазақстан Халық партиясының<br />сайлауалды бағдарламасы</>
                ) : 'Предвыборная программа Народной партии Казахстана'}
              </p>
            </div>
          </div>

          <div className="w-full md:w-3/5 min-h-[310px] md:min-h-0 relative overflow-hidden bg-surface-2">
            <img
              src="/images/congress-vote.jpg"
              alt={isKz ? 'Қазақстан Халық партиясының сайлауалды бағдарламасы' : 'Предвыборная программа Народной партии Казахстана'}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Используем тикер главной без отдельной скорости и дублирующего текста. */}
      <TickerSection />

      {/* PROGRAM HEADER */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,120px) clamp(16px,4vw,44px) clamp(24px,4vw,52px)' }}>
        <div style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26' }}>{isKz ? 'Партия бағдарламасы' : 'Программа партии'}</div>
        <h2 style={{ margin: '16px 0 0', fontSize: 'clamp(30px,4.6vw,58px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-.025em', maxWidth: '20ch' }}>{isKz ? 'Әділетті елдің он бағыты' : 'Десять направлений справедливой страны'}</h2>
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
                  {b.lead1}{b.lead2 ? <> <span style={{ color: isRed ? '#0a0a0a' : '#db1f26' }}>{b.lead2}</span></> : null}
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
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)' }}>{isKz ? 'Бізге қосылыңыз' : 'Присоединяйтесь'}</div>
                <h2 style={{ margin: '14px 0 0', fontSize: 'clamp(30px,4.4vw,58px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-.03em' }}>{isKz ? 'Қазақстан Халық партиясына қосылыңыз' : 'Вступайте в Народную партию Казахстана'}</h2>
                <p style={{ margin: '22px 0 0', maxWidth: '40ch', fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,.85)' }}>
                  {language === 'kz'
                    ? 'Әділетті мүмкіндіктер еліне бірге қадам басамыз.'
                    : 'Вместе мы строим страну справедливых возможностей.'}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <a href="/vstupit" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '20px 40px', background: '#050505', color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 700 }}>{isKz ? 'Өтінім беру →' : 'Подать заявку →'}</a>
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
