import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NewsSection, NarodnoeMediaSection } from '@/sections/NewsSection';
import { ChevronRight, Search, X, SlidersHorizontal, Calendar } from 'lucide-react';

/* ─── Data ────────────────────────────────────────────────────────── */
type Format = 'Все' | 'Новости' | 'Релизы партии' | 'Статьи' | 'Аналитика' | 'Интервью';

const ALL_NEWS = [
  { id: 1,  date: '29.06.2026', tag: 'Политика',  format: 'Новости',       title: 'От обещаний — к гарантиям!',                                            excerpt: 'Переход от предвыборных обещаний к конкретным гарантиям для граждан — главный приоритет партии.', image: '/images/marquee-1.jpg' },
  { id: 2,  date: '27.06.2026', tag: 'Партия',    format: 'Релизы партии', title: 'Нурсултан Шоканов избран председателем Народной партии Казахстана',      excerpt: 'На внеочередном съезде делегаты единогласно проголосовали за нового лидера партии.', image: '/images/marquee-2.jpg' },
  { id: 3,  date: '26.06.2026', tag: 'Анализ',    format: 'Аналитика',     title: 'Последний аккорд',                                                       excerpt: 'Итоги политического сезона: что успела сделать партия и что предстоит в новом году.', image: '/images/marquee-3.jpg' },
  { id: 4,  date: '26.06.2026', tag: 'Общество',  format: 'Статьи',        title: 'Долг в жизни',                                                           excerpt: 'Гражданская ответственность и личный долг в контексте современного казахстанского общества.', image: '/images/marquee-4.jpg' },
  { id: 5,  date: '26.06.2026', tag: 'Экономика', format: 'Аналитика',     title: 'Плата за неэффективность',                                               excerpt: 'Анализ последствий институциональной неэффективности и механизмов привлечения к ответственности.', image: '/images/marquee-5.jpg' },
  { id: 6,  date: '25.06.2026', tag: 'Социалка',  format: 'Статьи',        title: 'Сопровождающая помощь',                                                  excerpt: 'Новые программы поддержки для уязвимых слоёв населения Казахстана.', image: '/images/candidate-1.jpg' },
  { id: 7,  date: '24.06.2026', tag: 'Регионы',   format: 'Новости',       title: 'Народная партия открыла приёмную в Шымкенте',                            excerpt: 'Новый офис для работы с обращениями граждан начал работу в южной столице.', image: '/images/candidate-2.jpg' },
  { id: 8,  date: '23.06.2026', tag: 'Фракция',   format: 'Релизы партии', title: 'Фракция НПК внесла законопроект о минимальной зарплате',                 excerpt: 'Депутаты предлагают поднять МРОТ до 120 000 тенге к 2027 году.', image: '/images/candidate-3.jpg' },
  { id: 9,  date: '22.06.2026', tag: 'Программа', format: 'Новости',       title: 'Пять столпов: партия представила обновлённую программу',                 excerpt: 'Обновлённая программа охватывает экономику, образование, здравоохранение, жильё и экологию.', image: '/images/marquee-1.jpg' },
  { id: 10, date: '20.06.2026', tag: 'Интервью',  format: 'Интервью',      title: '«Мы строим страну, где каждый имеет шанс»',                              excerpt: 'Эксклюзивное интервью с новым председателем партии о планах на ближайший год.', image: '/images/marquee-2.jpg' },
  { id: 11, date: '18.06.2026', tag: 'Образование', format: 'Новости',     title: 'НПК представила план строительства 50 новых школ',                       excerpt: 'Партия объявила программу строительства школ в сельской местности по всему Казахстану.', image: '/images/news-1.jpg' },
  { id: 12, date: '15.06.2026', tag: 'Экономика', format: 'Релизы партии', title: 'Сельхозпроизводители получат дополнительные субсидии',                   excerpt: 'Фракция НПК добилась увеличения субсидий на сельскохозяйственную технику.', image: '/images/news-2.jpg' },
];

const FORMATS: Format[] = ['Все', 'Новости', 'Релизы партии', 'Статьи', 'Аналитика', 'Интервью'];
const PER_PAGE = 6;

/* ─── Breadcrumbs ─────────────────────────────────────────────────── */
function Breadcrumbs() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: 'rgba(255,255,255,.4)', marginBottom: 0 }}>
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
      <span style={{ color: '#fff' }}>Новости и релизы</span>
    </nav>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────── */
function Sidebar({
  keyword, setKeyword,
  date, setDate,
  format, setFormat,
  onReset,
}: {
  keyword: string; setKeyword: (v: string) => void;
  date: string; setDate: (v: string) => void;
  format: Format; setFormat: (v: Format) => void;
  onReset: () => void;
}) {
  const hasFilter = keyword !== '' || date !== '' || format !== 'Все';
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Search — inline above cards, stays in sidebar too */}
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

      {/* Date filter */}
      <div style={{ background: '#0e0e0f', border: '1px solid rgba(255,255,255,.08)', borderTop: 'none', padding: '16px 16px', marginBottom: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 10 }}>Дата публикации</div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', background: '#050505', border: '1px solid rgba(255,255,255,.1)', color: date ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'dark' }}
        />
      </div>

      {/* Reset */}
      {hasFilter && (
        <button
          onClick={onReset}
          style={{ margin: '0 0 2px', padding: '10px 16px', background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.3)', color: '#ff5a60', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        >
          Сбросить фильтры ×
        </button>
      )}

      {/* Format nav */}
      <div style={{ background: '#0e0e0f', border: '1px solid rgba(255,255,255,.08)', borderTop: 'none', marginTop: 2 }}>
        <div style={{ padding: '14px 16px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>Форматы</div>
        {FORMATS.map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px',
              background: format === f ? 'rgba(219,31,38,.1)' : 'transparent',
              borderLeft: format === f ? '3px solid #db1f26' : '3px solid transparent',
              color: format === f ? '#fff' : 'rgba(255,255,255,.55)',
              fontSize: 13, fontWeight: format === f ? 700 : 500,
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,.05)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
            onMouseEnter={e => { if (format !== f) e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { if (format !== f) e.currentTarget.style.color = 'rgba(255,255,255,.55)'; }}
          >
            {f}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ─── News Card ────────────────────────────────────────────────────── */
function NewsCard({ item }: { item: typeof ALL_NEWS[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="news-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s', borderColor: hovered ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.07)' }}
    >
      {/* Image */}
      <div className="news-card-img" style={{ flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <img
          src={item.image}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>
          {item.tag}
        </span>
      </div>
      {/* Content */}
      <div className="news-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{item.date}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'block' }} />
          <span style={{ fontSize: 11, color: '#db1f26', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{item.format}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>{item.title}</h3>
        <p className="news-card-excerpt" style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, flex: 1 }}>{item.excerpt}</p>
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
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: page === 1 ? 'rgba(255,255,255,.2)' : '#fff', cursor: page === 1 ? 'default' : 'pointer', fontSize: 16 }}
      >
        ‹
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: page === p ? '#db1f26' : 'transparent', border: page === p ? '1px solid #db1f26' : '1px solid rgba(255,255,255,.12)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: page === p ? 700 : 500, fontFamily: 'inherit' }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: page === pageCount ? 'rgba(255,255,255,.2)' : '#fff', cursor: page === pageCount ? 'default' : 'pointer', fontSize: 16 }}
      >
        ›
      </button>
    </div>
  );
}


/* ─── Page ────────────────────────────────────────────────────────── */
export function NewsPage() {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [format, setFormat] = useState<Format>('Все');
  const [page, setPage] = useState(1);

  const reset = () => { setKeyword(''); setDate(''); setFormat('Все'); setPage(1); };

  const filtered = ALL_NEWS.filter(n => {
    const kw = keyword.toLowerCase();
    if (kw && !n.title.toLowerCase().includes(kw) && !n.excerpt.toLowerCase().includes(kw)) return false;
    if (format !== 'Все' && n.format !== format) return false;
    if (date) {
      // date is YYYY-MM-DD, news date is DD.MM.YYYY
      const [d, m, y] = n.date.split('.');
      const newsIso = `${y}-${m}-${d}`;
      if (newsIso !== date) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFormat = (f: Format) => { setFormat(f); setPage(1); };
  const handleKeyword = (v: string) => { setKeyword(v); setPage(1); };
  const handleDate = (v: string) => { setDate(v); setPage(1); };

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumbs bar */}
      <div style={{ paddingTop: 108 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <Breadcrumbs />
        </div>
      </div>

      {/* Hero news section — 48px gap above, comes naturally from NewsSection py */}
      <NewsSection hideAllNewsLink />

      {/* Main content — 48px top, 80px bottom */}
      {/* Heading row — full width, above the grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 24px' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1 }}>Все новости</h2>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>
          Найдено: <strong style={{ color: '#fff' }}>{filtered.length}</strong> материалов
          {format !== 'Все' && (
            <span style={{ marginLeft: 10, padding: '3px 10px', background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.3)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#ff5a60' }}>
              {format}
            </span>
          )}
        </span>
      </div>

      {/* ── Mobile filter bar (visible only on mobile) ── */}
      <div className="mobile-filter-bar" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 12px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Поиск..." value={keyword} onChange={e => handleKeyword(e.target.value)}
            style={{ width: '100%', padding: '10px 36px 10px 34px', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          {keyword && (
            <button onClick={() => handleKeyword('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: 'flex' }}><X size={14} /></button>
          )}
        </div>
        {/* Row: date + reset */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Calendar size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
            <input type="date" value={date} onChange={e => handleDate(e.target.value)}
              style={{ width: '100%', padding: '9px 10px 9px 30px', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.1)', color: date ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>
          {(keyword || date || format !== 'Все') && (
            <button onClick={reset} style={{ padding: '9px 14px', background: 'rgba(219,31,38,.15)', border: '1px solid rgba(219,31,38,.3)', color: '#ff5a60', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Сброс ×
            </button>
          )}
        </div>
        {/* Format tabs — horizontal scroll */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 8, paddingBottom: 4, scrollbarWidth: 'none' }}>
          <style>{`.mobile-filter-bar div::-webkit-scrollbar{display:none}`}</style>
          {FORMATS.map(f => (
            <button key={f} onClick={() => handleFormat(f)}
              style={{ flexShrink: 0, padding: '6px 14px', background: format === f ? '#db1f26' : 'rgba(255,255,255,.05)', border: `1px solid ${format === f ? '#db1f26' : 'rgba(255,255,255,.1)'}`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards + sidebar grid — both start at the same level */}
      <div className="news-page-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 80px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, alignItems: 'start' }}>

        {/* LEFT: cards grid */}
        <div>
          {paginated.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {paginated.map(item => <NewsCard key={item.id} item={item} />)}
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
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={p => { setPage(p); window.scrollTo({ top: 500, behavior: 'smooth' }); }} />
        </div>

        {/* RIGHT: sidebar — sticky, hidden on mobile */}
        <div className="news-sidebar" style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
          <Sidebar
            keyword={keyword} setKeyword={handleKeyword}
            date={date} setDate={handleDate}
            format={format} setFormat={handleFormat}
            onReset={reset}
          />
        </div>
      </div>

      <style>{`
        /* Desktop: sidebar visible, mobile filter hidden */
        .mobile-filter-bar { display: none; }
        .news-sidebar { display: block; }

        /* Cards — desktop horizontal */
        .news-card { flex-direction: row; }
        .news-card-img { width: 240px; height: 135px; }
        .news-card-body { padding: 20px 22px; }

        @media (max-width: 860px) {
          /* Switch to single column, hide sidebar, show mobile bar */
          .news-page-grid { grid-template-columns: 1fr !important; }
          .news-sidebar { display: none !important; }
          .mobile-filter-bar { display: block; }

          /* Cards become vertical on mobile */
          .news-card { flex-direction: column !important; }
          .news-card-img { width: 100% !important; height: auto !important; aspect-ratio: 16/9; }
          .news-card-body { padding: 14px 16px 16px !important; }
          .news-card-excerpt { display: none; }
        }

        @media (max-width: 480px) {
          .news-card-body h3 { font-size: 14px !important; }
        }
      `}</style>

      {/* Народное медиа */}
      <section className="bg-[#0a0a0a] border-t border-white/[0.07] pb-16 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <NarodnoeMediaSection />
        </div>
      </section>
    </div>
  );
}
