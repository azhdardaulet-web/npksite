import { useEffect, useState } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchMediaProjects, type PublicMediaProject } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

const SOCIALS = [
  { name: 'YouTube',   url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', count: '139 000', countNum: 139000 },
  { name: 'TikTok',    url: 'https://www.tiktok.com/@halyk_partiyasy',                   count: '113 200', countNum: 113200 },
  { name: 'Instagram', url: 'https://www.instagram.com/halyk_partiyasy/',                count: '12 700',  countNum: 12700 },
  { name: 'Facebook',  url: 'https://www.facebook.com/halykpartiyasy',                   count: '7 000',   countNum: 7000 },
  { name: 'Telegram',  url: 'https://t.me/halykparty',                                   count: '313',     countNum: 313 },
];

const FALLBACK_PROJECTS: PublicMediaProject[] = [
  { id: '1', tag: 'Информационная программа', title: '«Ақпар»', description: 'Главные события страны и мира — коротко, честно и по делу. Информационный пульс партии.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', imageUrl: null, sortOrder: 0 },
  { id: '2', tag: 'Парламентская жизнь', title: '«Фракция покажет»', description: 'Как депутаты фракции отстаивают интересы народа в Парламенте — без бюрократического тумана.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', imageUrl: null, sortOrder: 1 },
  { id: '3', tag: 'Репортажи с мест', title: '«Регионы Аймақтар»', description: 'Реальная жизнь регионов Казахстана: проблемы, люди и решения — от аула до мегаполиса.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', imageUrl: null, sortOrder: 2 },
];

const FALLBACK_PROJECTS_KZ: PublicMediaProject[] = [
  { id: '1-kz', tag: 'Ақпараттық бағдарлама', title: 'Ақпар', description: 'Ел мен әлемнің басты оқиғаларын қысқа, шынайы әрі нақты береміз. Партияның ақпараттық тынысы.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', imageUrl: null, sortOrder: 0 },
  { id: '2-kz', tag: 'Парламент жұмысы', title: 'Фракция көрсетеді', description: 'Фракция депутаттарының Парламентте халық мүддесін қалай қорғайтынын баяндаймыз.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', imageUrl: null, sortOrder: 1 },
  { id: '3-kz', tag: 'Өңірлерден репортаж', title: 'Аймақтар', description: 'Қазақстан өңірлерінің шынайы өмірін, тұрғындардың мәселесін және оны шешу жолдарын көрсетеміз.', url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', imageUrl: null, sortOrder: 2 },
];

const TICKER = ['Ақпар', 'Фракция покажет', 'Регионы Аймақтар', 'Прямой эфир', 'Народное медиа'];
const TICKER_KZ = ['Ақпар', 'Фракция көрсетеді', 'Аймақтар', 'Тікелей эфир', 'Халық медиасы'];

export function MediaPage() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const tickerText = (isKz ? TICKER_KZ : TICKER).join(' • ') + ' • ';
  const total = '270 000+';
  const [projects, setProjects] = useState<PublicMediaProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMediaProjects(language)
      .then((data) => { if (!cancelled) setProjects(data.length > 0 ? data : (isKz ? FALLBACK_PROJECTS_KZ : FALLBACK_PROJECTS)); })
      .catch(() => { if (!cancelled) setProjects(isKz ? FALLBACK_PROJECTS_KZ : FALLBACK_PROJECTS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isKz, language]);

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ position: 'relative', padding: 'clamp(120px,16vh,180px) clamp(16px,4vw,44px) clamp(40px,5vw,70px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(circle at 80% 15%, rgba(219,31,38,.26), transparent 46%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 12px', border: '1px solid rgba(255,255,255,.16)', borderRadius: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#db1f26', display: 'block' }} />
            {isKz ? 'ҚХП медиасы · Эфирде' : 'Медиа НПК · On Air'}
          </div>
          <h1 style={{ margin: '26px 0 0', fontWeight: 800, fontSize: 'clamp(42px,7.6vw,110px)', lineHeight: .94, letterSpacing: '-.035em' }}>
            {isKz ? 'Халық сенетін ' : 'Народное медиа, '}<span style={{ color: '#db1f26' }}>{isKz ? 'халық медиасы' : 'которому верит народ'}</span>
          </h1>
          <p style={{ margin: '28px 0 0', maxWidth: '62ch', fontSize: 'clamp(16px,1.7vw,21px)', lineHeight: 1.55, color: 'rgba(255,255,255,.72)', fontWeight: 500 }}>
            {isKz ? 'Өз студиямызда күн сайын эфир дайындап, елдегі және әлемдегі саяси оқиғаларды, маңызды әлеуметтік мәселелерді талқылаймыз. Аудиториямызға ақпаратты жедел әрі түсінікті жеткіземіз.' : 'Собственная студия, ежедневный эфир и аудитория, которая опережает партийные СМИ страны. Мы освещаем внутреннюю и международную политику, обсуждаем важные социальные вопросы и продвигаем левоцентристские ценности справедливости.'}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 32 }}>
            <a href="#follow" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '17px 30px', background: '#db1f26', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>{isKz ? 'Жазылу →' : 'Подписаться →'}</a>
            <a href="#projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '17px 30px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.24)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>{isKz ? 'Бағдарламаларымыз' : 'Наши программы'}</a>
          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(16px,2vw,32px) clamp(16px,4vw,44px) 0' }}>
        <ScrollReveal>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.09)', padding: 'clamp(30px,4vw,56px)' }}>
            <span aria-hidden style={{ position: 'absolute', top: '-.25em', right: '.03em', fontSize: 'clamp(130px,22vw,320px)', fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,.035)', pointerEvents: 'none' }}>270K</span>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'clamp(52px,8vw,110px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-.03em', color: '#db1f26' }}>{total}</span>
                <span style={{ fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700 }}>{isKz ? 'арналарымыздың жалпы аудиториясы' : 'суммарная аудитория наших каналов'}</span>
              </div>
              <div style={{ marginTop: 'clamp(26px,3vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
                {SOCIALS.map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22, borderRadius: 0, background: '#050505', border: '1px solid rgba(255,255,255,.08)', textDecoration: 'none', color: '#fff' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ width: 42, height: 42, borderRadius: 0, background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>{s.name.slice(0, 2).toUpperCase()}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 700 }}>↗</span>
                    </span>
                    <span>
                      <span style={{ display: 'block', fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>{s.count}</span>
                      <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>{s.name} · {isKz ? 'жазылушылар' : 'подписчики'}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* MARQUEE */}
      <div style={{ marginTop: 'clamp(48px,7vw,90px)', padding: 'clamp(20px,3vw,44px) 0', borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
        <style>{`@keyframes media-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        <div style={{ display: 'flex', width: 'max-content', animation: 'media-marq 30s linear infinite' }}>
          {[0, 1].map(i => (
            <span key={i} aria-hidden={i === 1 || undefined} style={{ flexShrink: 0, fontSize: 'clamp(34px,6vw,72px)', fontWeight: 800, letterSpacing: '-.02em', color: 'transparent', WebkitTextStroke: '1.3px rgba(255,255,255,.32)', whiteSpace: 'nowrap', paddingRight: '.3em' }}>
              {tickerText.split(' • ').filter(Boolean).map((word, j) => (
                <span key={j}>{word}{' '}<span style={{ color: '#db1f26', WebkitTextStroke: '0' }}>•</span>{' '}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* PROJECTS */}
      <section id="projects" style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,44px) 0' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26' }}>{isKz ? 'Медиажобалар' : 'Медиапроекты'}</div>
        <h2 style={{ margin: '16px 0 0', fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.025em', maxWidth: '22ch' }}>{isKz ? 'Ел көретін бағдарламалар' : 'Программы, которые смотрит страна'}</h2>
        <div style={{ marginTop: 'clamp(28px,3.6vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(14px,1.8vw,22px)' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,.4)' }}>{isKz ? 'Жүктеліп жатыр...' : 'Загрузка...'}</div>
          ) : projects.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 0.1}>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.09)' }}>
                <div style={{ width: '100%', height: 210, background: p.imageUrl ? `center/cover no-repeat url(${p.imageUrl})` : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', fontSize: 14, fontWeight: 600 }}>
                  {!p.imageUrl && (isKz ? 'Бағдарламадан кадр' : 'Кадр из программы')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 'clamp(22px,2.6vw,30px)', flex: 1 }}>
                  <div>
                    <span style={{ padding: '5px 12px', background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.35)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ff5a60' }}>{p.tag}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 'clamp(21px,2.2vw,27px)', fontWeight: 800, letterSpacing: '-.015em' }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,.62)', flex: 1 }}>{p.description}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', border: '1.5px solid rgba(255,255,255,.24)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, marginTop: 6 }}>▶ {isKz ? 'YouTube арнасынан көру' : 'Смотреть на YouTube'}</a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* STUDIO */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,8vw,100px) clamp(16px,4vw,44px) 0' }}>
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26' }}>{isKz ? 'Студиямыз' : 'Наша студия'}</div>
              <h2 style={{ margin: '16px 0 0', fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.025em', maxWidth: '22ch' }}>{isKz ? 'Халық медиасы қалай жұмыс істейді' : 'Как работает народное медиа'}</h2>
            </div>
            <p style={{ margin: 0, maxWidth: '44ch', fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,.62)' }}>{isKz ? 'Идеядан түсірілімге, монтаждан жариялауға дейінгі толық өндіріс циклі. Партияның өз студиясы бар.' : 'Полный цикл производства — от идеи и съёмки до монтажа и публикации. Собственная студия в сердце партии.'}</p>
          </div>
          <div style={{ marginTop: 'clamp(26px,3.4vw,44px)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridAutoRows: 220, gap: 'clamp(12px,1.6vw,20px)' }}>
            <div style={{ gridColumn: 'span 2', gridRow: 'span 2', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.25)', fontSize: 14, fontWeight: 600 }}>{isKz ? 'Студияның жалпы көрінісі' : 'Фото студии — общий план'}</div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13, fontWeight: 600 }}>{isKz ? 'Түсірілім процесі' : 'Съёмочный процесс'}</div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13, fontWeight: 600 }}>{isKz ? 'Кадр сыртында' : 'За кадром'}</div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13, fontWeight: 600 }}>{isKz ? 'Аппарат бөлмесі' : 'Аппаратная'}</div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13, fontWeight: 600 }}>{isKz ? 'Жүргізушілер' : 'Ведущие'}</div>
          </div>
        </ScrollReveal>
      </section>

      {/* FOLLOW CTA */}
      <section id="follow" style={{ maxWidth: 1180, margin: 'clamp(56px,8vw,100px) auto clamp(40px,6vw,80px)', padding: '0 clamp(16px,4vw,44px)' }}>
        <ScrollReveal>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0', background: '#db1f26', padding: 'clamp(38px,5vw,72px)', textAlign: 'center' }}>
            <span aria-hidden style={{ position: 'absolute', bottom: '-.34em', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(130px,22vw,320px)', fontWeight: 800, lineHeight: 1, color: 'rgba(0,0,0,.08)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>ЭФИР</span>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(28px,4.4vw,54px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.03em' }}>{isKz ? 'Халық медиасына жазылыңыз' : 'Подпишись на народное медиа'}</h2>
              <p style={{ margin: '18px auto 0', maxWidth: '52ch', fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,.85)' }}>{isKz ? 'Жазылыңыз, талқылауға қатысыңыз және басты оқиғалардан хабардар болыңыз.' : 'Подписывайтесь, участвуйте в обсуждениях и будьте в курсе ключевых событий.'}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 30 }}>
                {SOCIALS.map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 24px', background: '#050505', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{s.name.slice(0, 2).toUpperCase()}</span>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
