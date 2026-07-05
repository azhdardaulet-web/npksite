import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, X } from 'lucide-react';
import { ReadAlsoSlider } from '@/sections/ReadAlsoSlider';

/* ─── Data ────────────────────────────────────────────────────────── */
type Source = 'Все' | 'Телевидение' | 'Радио' | 'Интернет-СМИ' | 'Газеты' | 'Информагентства';

const ALL_SMI = [
  { id: 1,  date: '29.06.2026', tag: 'Телевидение',      source: 'Телевидение',     title: 'НПК назвала главным приоритетом повышение благосостояния граждан', excerpt: 'Председатель партии в интервью Хабар 24 рассказал о ключевых целях нового политсезона.', image: '/images/marquee-1.jpg', media: 'Хабар 24' },
  { id: 2,  date: '27.06.2026', tag: 'Интернет-СМИ',     source: 'Интернет-СМИ',    title: 'Народная партия — новый лидер казахстанской политики', excerpt: 'Эксперты оценивают перспективы Народной партии после смены руководства.', image: '/images/marquee-2.jpg', media: 'Tengrinews.kz' },
  { id: 3,  date: '26.06.2026', tag: 'Газеты',            source: 'Газеты',          title: 'НПК предложила системные реформы в здравоохранении', excerpt: 'Фракция Народной партии внесла пакет законопроектов по реформированию медицины.', image: '/images/marquee-3.jpg', media: 'Казахстанская правда' },
  { id: 4,  date: '26.06.2026', tag: 'Информагентства',  source: 'Информагентства', title: 'Новый съезд — новые цели: партия обновила устав', excerpt: 'На внеочередном съезде делегаты приняли обновлённый устав партии.', image: '/images/marquee-4.jpg', media: 'КазИнформ' },
  { id: 5,  date: '25.06.2026', tag: 'Радио',            source: 'Радио',           title: 'Эфир с лидером: НПК об экономической повестке', excerpt: 'Председатель НПК выступил в прямом эфире радиостанции Европа Плюс Казахстан.', image: '/images/marquee-5.jpg', media: 'Европа Плюс Казахстан' },
  { id: 6,  date: '24.06.2026', tag: 'Интернет-СМИ',     source: 'Интернет-СМИ',    title: 'Рейтинг НПК вырос на 12 пунктов по итогам съезда', excerpt: 'Социологические данные показывают резкий рост доверия к партии.', image: '/images/candidate-1.jpg', media: 'Zakon.kz' },
  { id: 7,  date: '23.06.2026', tag: 'Телевидение',      source: 'Телевидение',     title: 'Программа НПК — практика, а не слова', excerpt: 'Аналитический материал телеканала о реализованных инициативах партии.', image: '/images/candidate-2.jpg', media: 'QazaqTV' },
  { id: 8,  date: '22.06.2026', tag: 'Газеты',            source: 'Газеты',          title: 'Фракция НПК защищает права простых казахстанцев', excerpt: 'Депутаты от Народной партии активно работают с обращениями граждан в Мажилисе.', image: '/images/candidate-3.jpg', media: 'Егемен Қазақстан' },
  { id: 9,  date: '21.06.2026', tag: 'Информагентства',  source: 'Информагентства', title: 'НПК открыла новые региональные представительства', excerpt: 'Партия расширяет присутствие в регионах Казахстана.', image: '/images/marquee-1.jpg', media: 'BNews.kz' },
  { id: 10, date: '20.06.2026', tag: 'Интернет-СМИ',     source: 'Интернет-СМИ',    title: 'Эксперты: позиции НПК укрепятся к выборам 2027 года', excerpt: 'Политологи прогнозируют рост влияния партии на парламентских выборах.', image: '/images/marquee-2.jpg', media: 'Forbes Kazakhstan' },
  { id: 11, date: '19.06.2026', tag: 'Радио',            source: 'Радио',           title: 'Народная партия о жилищном вопросе', excerpt: 'Развёрнутое интервью с депутатом фракции о программе доступного жилья.', image: '/images/news-1.jpg', media: 'Радио NS' },
  { id: 12, date: '17.06.2026', tag: 'Газеты',            source: 'Газеты',          title: 'НПК наращивает работу с молодёжью', excerpt: 'Партия запустила новые молодёжные проекты и открыла клубы в вузах.', image: '/images/news-2.jpg', media: 'Литер' },
];

const SOURCES: Source[] = ['Все', 'Телевидение', 'Радио', 'Интернет-СМИ', 'Газеты', 'Информагентства'];
const PER_PAGE = 6;

/* ─── Breadcrumbs ─────────────────────────────────────────────────── */
function Breadcrumbs() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: 'rgba(255,255,255,.4)' }}>
      <Link to="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>
        Главная
      </Link>
      <ChevronRight size={12} />
      <Link to="/novosti" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}>
        Пресс-центр
      </Link>
      <ChevronRight size={12} />
      <span style={{ color: '#fff' }}>СМИ о нас</span>
    </nav>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────── */
function Sidebar({
  keyword, setKeyword,
  date, setDate,
  source, setSource,
  onReset,
}: {
  keyword: string; setKeyword: (v: string) => void;
  date: string; setDate: (v: string) => void;
  source: Source; setSource: (v: Source) => void;
  onReset: () => void;
}) {
  const hasFilter = keyword !== '' || date !== '' || source !== 'Все';
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      <div style={{ position: 'relative', marginBottom: 2 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Поиск по ключевым словам"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ width: '100%', padding: '13px 36px 13px 38px', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        {keyword && (
          <button onClick={() => setKeyword('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ background: '#0e0e0f', border: '1px solid rgba(255,255,255,.08)', borderTop: 'none', padding: '16px 16px', marginBottom: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 10 }}>Дата публикации</div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', background: '#050505', border: '1px solid rgba(255,255,255,.1)', color: date ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'dark' }}
        />
      </div>

      {hasFilter && (
        <button
          onClick={onReset}
          style={{ margin: '0 0 2px', padding: '10px 16px', background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.3)', color: '#ff5a60', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        >
          Сбросить фильтры ×
        </button>
      )}

      <div style={{ background: '#0e0e0f', border: '1px solid rgba(255,255,255,.08)', borderTop: 'none', marginTop: 2 }}>
        <div style={{ padding: '14px 16px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>Тип источника</div>
        {SOURCES.map(s => (
          <button
            key={s}
            onClick={() => setSource(s)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px',
              background: source === s ? 'rgba(219,31,38,.1)' : 'transparent',
              borderLeft: source === s ? '3px solid #db1f26' : '3px solid transparent',
              color: source === s ? '#fff' : 'rgba(255,255,255,.55)',
              fontSize: 13, fontWeight: source === s ? 700 : 500,
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,.05)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
            onMouseEnter={e => { if (source !== s) e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { if (source !== s) e.currentTarget.style.color = 'rgba(255,255,255,.55)'; }}
          >
            {s}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ─── Card ─────────────────────────────────────────────────────────── */
function SmiCard({ item }: { item: typeof ALL_SMI[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'row', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s', borderColor: hovered ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.07)' }}
    >
      <div style={{ flexShrink: 0, width: 240, height: 135, overflow: 'hidden', position: 'relative' }}>
        <img
          src={item.image}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>
          {item.tag}
        </span>
      </div>
      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{item.date}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'block' }} />
          <span style={{ fontSize: 11, color: '#db1f26', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{item.source}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'block' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{item.media}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, flex: 1 }}>{item.excerpt}</p>
        <span style={{ fontSize: 12, color: hovered ? '#db1f26' : 'rgba(255,255,255,.35)', fontWeight: 700, transition: 'color .15s', letterSpacing: '.04em' }}>
          Читать →
        </span>
      </div>
    </article>
  );
}

/* ─── Pagination ──────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pageCount = Math.ceil(total / perPage);
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 48 }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: page === 1 ? 'rgba(255,255,255,.2)' : '#fff', cursor: page === 1 ? 'default' : 'pointer', fontSize: 16 }}>
        ‹
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: page === p ? '#db1f26' : 'transparent', border: page === p ? '1px solid #db1f26' : '1px solid rgba(255,255,255,.12)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: page === p ? 700 : 500, fontFamily: 'inherit' }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pageCount}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: page === pageCount ? 'rgba(255,255,255,.2)' : '#fff', cursor: page === pageCount ? 'default' : 'pointer', fontSize: 16 }}>
        ›
      </button>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export function SmiPage() {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [source, setSource] = useState<Source>('Все');
  const [page, setPage] = useState(1);

  const reset = () => { setKeyword(''); setDate(''); setSource('Все'); setPage(1); };

  const filtered = ALL_SMI.filter(n => {
    const kw = keyword.toLowerCase();
    if (kw && !n.title.toLowerCase().includes(kw) && !n.excerpt.toLowerCase().includes(kw) && !n.media.toLowerCase().includes(kw)) return false;
    if (source !== 'Все' && n.source !== source) return false;
    if (date) {
      const [d, m, y] = n.date.split('.');
      if (`${y}-${m}-${d}` !== date) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumbs */}
      <div style={{ paddingTop: 108 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <Breadcrumbs />
        </div>
      </div>

      {/* Page hero */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 12 }}>Пресс-центр</div>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1 }}>СМИ о нас</h1>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,.45)', maxWidth: 560, lineHeight: 1.65 }}>
          Публикации ведущих казахстанских и зарубежных СМИ о деятельности Народной партии Казахстана.
        </p>
      </div>

      {/* Count row */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 24px' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>
          Найдено: <strong style={{ color: '#fff' }}>{filtered.length}</strong> материалов
          {source !== 'Все' && (
            <span style={{ marginLeft: 10, padding: '3px 10px', background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.3)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#ff5a60' }}>
              {source}
            </span>
          )}
        </span>
      </div>

      {/* Cards + sidebar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 80px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, alignItems: 'start' }}>

        <div>
          {paginated.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {paginated.map(item => <SmiCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: .3 }}>🔍</div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.4)' }}>По вашему запросу ничего не найдено</p>
              <button onClick={reset} style={{ marginTop: 16, padding: '11px 24px', background: '#db1f26', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Сбросить фильтры
              </button>
            </div>
          )}
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={p => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }} />
        </div>

        <div style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
          <Sidebar
            keyword={keyword} setKeyword={v => { setKeyword(v); setPage(1); }}
            date={date} setDate={v => { setDate(v); setPage(1); }}
            source={source} setSource={v => { setSource(v); setPage(1); }}
            onReset={reset}
          />
        </div>
      </div>

      {/* Читайте также slider */}
      <ReadAlsoSlider />
    </div>
  );
}
