import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

/* ─── Article data ────────────────────────────────────────────────── */
const ARTICLE = {
  id: 2,
  date: '27 июня 2026',
  tag: 'Партия',
  format: 'Релизы партии',
  title: 'Нурсултан Шоканов избран председателем Народной партии Казахстана',
  lead: 'На внеочередном съезде делегаты единогласно проголосовали за нового лидера. Ермухамет Ертысбаев передал полномочия, подведя итоги трёхлетней работы.',
  image: '/images/marquee-2.jpg',
  readTime: '5 мин',
};

const LATEST = [
  { id: 1,  date: '29.06.2026', tag: 'Политика',  title: 'От обещаний — к гарантиям!', image: '/images/marquee-1.jpg' },
  { id: 3,  date: '26.06.2026', tag: 'Анализ',    title: 'Последний аккорд', image: '/images/marquee-3.jpg' },
  { id: 4,  date: '26.06.2026', tag: 'Общество',  title: 'Долг в жизни', image: '/images/marquee-4.jpg' },
  { id: 5,  date: '26.06.2026', tag: 'Экономика', title: 'Плата за неэффективность', image: '/images/marquee-5.jpg' },
  { id: 7,  date: '24.06.2026', tag: 'Регионы',   title: 'Народная партия открыла приёмную в Шымкенте', image: '/images/candidate-2.jpg' },
  { id: 8,  date: '23.06.2026', tag: 'Фракция',   title: 'Фракция НПК внесла законопроект о минимальной зарплате', image: '/images/candidate-3.jpg' },
  { id: 9,  date: '22.06.2026', tag: 'Программа', title: 'Пять столпов: партия представила обновлённую программу', image: '/images/marquee-1.jpg' },
  { id: 10, date: '20.06.2026', tag: 'Интервью',  title: '«Мы строим страну, где каждый имеет шанс»', image: '/images/marquee-2.jpg' },
];

/* ─── Sidebar latest news ─────────────────────────────────────────── */
function SidebarNews() {
  return (
    <aside style={{ position: 'sticky', top: 90 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Последние новости</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {LATEST.map(item => (
          <Link
            key={item.id}
            to={`/novosti/${item.id}`}
            style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.06)', textDecoration: 'none', color: '#fff' }}
          >
            <div style={{ flexShrink: 0, width: 72, height: 48, overflow: 'hidden', position: 'relative' }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#db1f26', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{item.tag}</div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: 'rgba(255,255,255,.85)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>{item.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

/* ─── Bottom "Читайте также" slider ───────────────────────────────── */
function ReadAlsoSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });

  return (
    <section style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,.07)', padding: 'clamp(40px,5vw,64px) 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 8 }}>Материалы по теме</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>Читайте также</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['left', 'right'] as const).map(dir => (
              <button key={dir} onClick={() => scroll(dir)} aria-label={dir === 'left' ? 'Назад' : 'Вперёд'}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; }}
              >
                {dir === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {LATEST.map(item => (
            <Link
              key={item.id}
              to={`/novosti/${item.id}`}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flexShrink: 0, width: 'clamp(240px,22vw,280px)', scrollSnapAlign: 'start',
                display: 'flex', flexDirection: 'column', background: '#0e0e0f',
                border: `1px solid ${hovered === item.id ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.07)'}`,
                overflow: 'hidden', textDecoration: 'none', color: '#fff', transition: 'border-color .2s',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img src={item.image} alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hovered === item.id ? 'scale(1.06)' : 'scale(1)' }} />
                <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>{item.tag}</span>
              </div>
              <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{item.date}</span>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.4, flex: 1 }}>{item.title}</h4>
                <span style={{ fontSize: 12, color: hovered === item.id ? '#db1f26' : 'rgba(255,255,255,.3)', fontWeight: 700, transition: 'color .15s' }}>Читать →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export function NewsArticlePage() {
  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumbs */}
      <div style={{ paddingTop: 108 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: 'rgba(255,255,255,.4)', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>Главная</Link>
            <ChevronRight size={12} />
            <Link to="/novosti" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>Пресс-центр</Link>
            <ChevronRight size={12} />
            <Link to="/novosti" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>Новости и релизы</Link>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>Нурсултан Шоканов избран председателем</span>
          </nav>
        </div>
      </div>

      {/* Article header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 0' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ padding: '4px 10px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>{ARTICLE.tag}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{ARTICLE.date}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>·</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{ARTICLE.readTime} чтения</span>
        </div>
        <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(26px,3.5vw,48px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', maxWidth: '80%' }}>
          {ARTICLE.title}
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.65, color: 'rgba(255,255,255,.65)', fontWeight: 500, maxWidth: '70%' }}>
          {ARTICLE.lead}
        </p>
      </div>

      {/* Hero image */}
      <div style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ width: '100%', aspectRatio: '21/9', overflow: 'hidden', position: 'relative' }}>
          <img src={ARTICLE.image} alt={ARTICLE.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* Article body + sidebar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 80px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 60, alignItems: 'start' }}>

        {/* Article text */}
        <article style={{ fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,.8)' }}>

          <p>Ермухамет Ертысбаев сложил с себя полномочия председателя Народной партии Казахстана. На внеочередном съезде, состоявшемся 27 июня, новым лидером партии единогласно избран Нурсултан Шоканов.</p>

          <p>Выступая перед делегатами, Ертысбаев подвёл итоги трёхлетней работы. По его словам, партия укрепила позиции как политическая сила, решающая конкретные проблемы граждан, а не занимающаяся пустыми декларациями.</p>

          {/* Quote */}
          <blockquote style={{
            margin: '36px 0', padding: '28px 32px',
            borderLeft: '4px solid #db1f26',
            background: 'rgba(219,31,38,.06)',
            fontStyle: 'normal',
          }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.5, color: '#fff' }}>
              «Сегодня Народная партия — это место, куда люди приходят за помощью. Это главный результат нашей работы.»
            </p>
            <cite style={{ display: 'block', marginTop: 14, fontSize: 13, fontWeight: 700, color: '#db1f26', fontStyle: 'normal', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Ермухамет Ертысбаев, экс-председатель НПК
            </cite>
          </blockquote>

          <p>Уходящий председатель отметил последовательную поддержку партией курса Президента Касым-Жомарта Токаева «Справедливый Казахстан». Депутаты фракции внесли 591 депутатский запрос с начала восьмого созыва, а численность партии выросла более чем на 43 000 новых членов.</p>

          <p>Ертысбаев подчеркнул расширение медиаприсутствия партии: организация научилась не просто реагировать, но и формировать общественный дискурс. Цифровые платформы партии охватывают более 1,1 миллиона подписчиков, набрав свыше 600 миллионов просмотров и около одного миллиона обращений граждан.</p>

          <p>Руководство объездило весь Казахстан, проведя сотни встреч с жителями. Говоря о смене лидера, Ертысбаев назвал обновление «естественным процессом, необходимым для движения вперёд» в трансформационный для страны период после принятия новой Конституции.</p>

          {/* Inline photo with caption */}
          <figure style={{ margin: '40px 0', padding: 0 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#0e0e0f' }}>
              <img
                src="/images/marquee-3.jpg"
                alt="Внеочередной съезд Народной партии Казахстана, 27 июня 2026"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <figcaption style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>
                Делегаты внеочередного съезда Народной партии Казахстана. Алматы, 27 июня 2026 года.
              </span>
              <span style={{ flexShrink: 0, fontSize: 11, color: 'rgba(255,255,255,.25)', fontWeight: 600, letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
                © Пресс-служба НПК
              </span>
            </figcaption>
          </figure>

          {/* Subheading */}
          <h2 style={{ margin: '48px 0 20px', fontSize: 'clamp(20px,2vw,28px)', fontWeight: 800, color: '#fff', letterSpacing: '-.01em' }}>
            Кто такой Нурсултан Шоканов
          </h2>

          <p>Нурсултан Шоканов родился в 1986 году в Алматы. Окончил КИМЕП по специальности «финансы» и получил степень Executive MBA в швейцарском IMD. Карьеру начинал в Ernst & Young, затем занимал руководящие должности в Sandrillin в области корпоративных финансов и слияний и поглощений.</p>

          <p>С 2009 года возглавляет OMIR Group — компанию, работающую в шести городах Казахстана и четырёх странах в сферах общественного питания, ритейла, IT и дистрибуции.</p>

          {/* Key facts */}
          <div style={{ margin: '36px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {[
              { num: '591', label: 'депутатских запросов с начала созыва' },
              { num: '43 000+', label: 'новых членов партии' },
              { num: '1,1 млн', label: 'подписчиков в соцсетях' },
              { num: '600 млн', label: 'просмотров медиаконтента' },
            ].map(f => (
              <div key={f.num} style={{ padding: '22px 20px', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.07)' }}>
                <div style={{ fontSize: 'clamp(24px,2.5vw,34px)', fontWeight: 800, color: '#db1f26', lineHeight: 1, letterSpacing: '-.02em', marginBottom: 8 }}>{f.num}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.4 }}>{f.label}</div>
              </div>
            ))}
          </div>

          <p>С 2021 года Шоканов — депутат маслихата Алматы, возглавляет комиссии по инфраструктуре и городскому развитию. С декабря 2022 года руководил городским и региональным отделениями НПК в Алматы, а также возглавлял региональный совет Атамекен. Является президентом Федерации альпинизма и скалолазания Казахстана.</p>

          <p>Шоканов удостоен ордена «Құрмет» и ряда президентских медалей и грамот.</p>

          <h2 style={{ margin: '48px 0 20px', fontSize: 'clamp(20px,2vw,28px)', fontWeight: 800, color: '#fff', letterSpacing: '-.01em' }}>
            Итоги съезда
          </h2>

          <p>Делегаты съезда единогласно избрали Шоканова председателем и утвердили обновлённый устав партии, а также новый фирменный стиль, призванный повысить внутреннюю эффективность и усилить позиционирование партии в современном политическом пространстве.</p>

          {/* Tags */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Народная партия', 'НПК', 'Шоканов', 'Съезд', 'Ертысбаев', 'Казахстан'].map(t => (
              <span key={t} style={{ padding: '5px 12px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <SidebarNews />
      </div>

      {/* Read also slider */}
      <ReadAlsoSlider />
    </div>
  );
}
