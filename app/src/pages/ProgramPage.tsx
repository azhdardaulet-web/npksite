import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchProgramBlocks, type PublicProgramBlock } from '@/lib/api';

const FALLBACK_BLOCKS: PublicProgramBlock[] = [
  { id: '1', n: 1, keyword: 'ТРУД', title: 'Человек труда', lead1: 'Страна держится не на должностях.', lead2: 'Страна держится на людях труда.', points: ['Рабочие профессии — почёт, уважение и достойный доход', 'Национальная программа «Человек труда»', 'Жилищные, образовательные и соцпрограммы для рабочих, инженеров, учителей, врачей', 'Рост производительности = рост зарплат', 'Государство защищает права каждого работника', 'Новые профессии — через массовую переподготовку кадров'], imageUrl: null, sortOrder: 0 },
  { id: '2', n: 2, keyword: 'СЛОВО', title: 'Государство, которое держит слово', lead1: 'Если принимаются законы — они должны работать.', lead2: 'Если даются обещания — они должны выполняться.', points: ['Государство держит слово', 'Человек важнее отчёта', 'Оценка чиновников — только по реальной жизни людей', 'Персональная ответственность за каждую госпрограмму', 'Открытый бюджет: каждый тенге на виду у общества', 'Общественный контроль и прозрачность решений'], imageUrl: null, sortOrder: 1 },
  { id: '3', n: 3, keyword: 'ЗАКОН', title: 'Справедливость работает', lead1: 'Один закон для всех.', lead2: 'Не должность. Не влияние. Только закон.', points: ['Закон одинаков для всех — от гражданина до чиновника', 'Успех зависит от знаний и труда, не от связей', 'Справедливость — не лозунг, а основа государственной политики', 'Территориальная справедливость: одинаковые возможности в каждом регионе', 'Рост экономики должен ощущаться в жизни каждой семьи'], imageUrl: null, sortOrder: 2 },
  { id: '4', n: 4, keyword: 'ЛЮДИ', title: 'Экономика для людей', lead1: 'Экономика должна работать не ради отчётов —', lead2: 'ради человека.', points: ['Главная цель — рост доходов и благополучия семей', 'Честная конкуренция без административных привилегий', 'Сильный средний класс — стратегическая цель государства', 'Новые рабочие места во всех регионах страны', 'Предпринимательство — главная социальная сила', 'Природные богатства — на образование, медицину, инфраструктуру'], imageUrl: null, sortOrder: 3 },
];

const TICKER = ['Справедливость', 'Труд', 'Достоинство', 'Равенство', 'Жильё', 'Знания', 'Здоровье', 'Семья', 'Будущее'];

function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        <video ref={videoRef} src="/agitvideo.mp4" playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
  const [blocks, setBlocks] = useState<PublicProgramBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const tickerText = TICKER.join(' • ') + ' • ';

  useEffect(() => {
    let cancelled = false;
    fetchProgramBlocks()
      .then((data) => { if (!cancelled) setBlocks(data.length > 0 ? data : FALLBACK_BLOCKS); })
      .catch(() => { if (!cancelled) setBlocks(FALLBACK_BLOCKS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ position: 'relative', padding: 'clamp(120px,16vh,180px) clamp(16px,4vw,44px) clamp(50px,6vw,90px)', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(circle at 78% 22%, rgba(219,31,38,.28), transparent 46%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 12px', border: '1px solid rgba(255,255,255,.16)', borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#db1f26', display: 'block' }} />
            Предвыборная программа
          </div>
          <h1 style={{ margin: '26px 0 0', fontWeight: 800, fontSize: 'clamp(44px,8.4vw,120px)', lineHeight: .92, letterSpacing: '-.035em' }}>
            Казахстан{' '}<span style={{ color: '#db1f26' }}>справедливых </span>возможностей
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(28px,4vw,60px)', alignItems: 'center', marginTop: 'clamp(30px,4vw,54px)' }}>
            <div>
              <p style={{ margin: 0, maxWidth: '42ch', fontSize: 'clamp(16px,1.6vw,22px)', lineHeight: 1.5, color: 'rgba(255,255,255,.72)', fontWeight: 500 }}>
                Каждый, кто честно работает, должен жить достойно.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                <span style={{ padding: '9px 18px', background: '#db1f26', color: '#fff', fontWeight: 700, fontSize: 15 }}>Билік — халыққа!</span>
                <span style={{ padding: '9px 18px', border: '1.5px solid rgba(255,255,255,.28)', color: '#fff', fontWeight: 700, fontSize: 15 }}>Власть — народу!</span>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 30 }}>
                <a href="/vstupit" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '17px 30px', background: '#db1f26', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>Вступить в партию →</a>
                <a href="#video" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '17px 30px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.24)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>▶ Смотреть агитролик</a>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-8% -6% -12%', borderRadius: 48, background: 'radial-gradient(circle at 50% 40%, rgba(219,31,38,.5), transparent 68%)', filter: 'blur(30px)', zIndex: 0 }} />
              <img src="/banner.png" alt="Народная партия Казахстана" style={{ position: 'relative', zIndex: 1, width: '100%', height: 'auto', display: 'block', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 40px 90px -30px rgba(0,0,0,.8)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding: 'clamp(24px,4vw,56px) 0', borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
        <style>{`@keyframes prog-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        <div style={{ display: 'flex', width: 'max-content', animation: 'prog-marq 34s linear infinite' }}>
          {[0, 1].map(i => (
            <span key={i} aria-hidden={i === 1 || undefined} style={{ flexShrink: 0, fontSize: 'clamp(40px,7vw,88px)', fontWeight: 800, letterSpacing: '-.02em', color: 'transparent', WebkitTextStroke: '1.4px rgba(255,255,255,.32)', whiteSpace: 'nowrap', paddingRight: '.3em' }}>
              {tickerText.split(' • ').filter(Boolean).map((word, j) => (
                <span key={j}>{word}{' '}<span style={{ color: '#db1f26', WebkitTextStroke: '0' }}>•</span>{' '}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

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
            <section style={{ position: 'relative', overflow: 'hidden', borderRadius: 'clamp(28px,3vw,44px)', padding: 'clamp(38px,5vw,80px) clamp(26px,4vw,72px)', background: isRed ? '#db1f26' : '#0e0e0f', color: '#fff', border: isRed ? '1px solid rgba(0,0,0,.12)' : '1px solid rgba(255,255,255,.09)' }}>
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
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'clamp(28px,3vw,48px)', background: '#db1f26', padding: 'clamp(40px,5vw,84px) clamp(26px,4vw,72px)' }}>
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
    </div>
  );
}
