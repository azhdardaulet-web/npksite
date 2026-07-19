import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NewsSection, NarodnoeMediaSection } from '@/sections/NewsSection';
import { Search, X, Calendar } from 'lucide-react';
import { fetchNews, NEWS_FORMAT_LABELS, type NewsFormat, type PublicNewsItem } from '@/lib/api';

/* ─── Data ────────────────────────────────────────────────────────── */
type Format = 'Все' | 'Новости' | 'Релизы партии' | 'Статьи' | 'Аналитика' | 'Интервью';

const FORMAT_TO_API: Record<Format, NewsFormat | undefined> = {
  Все: undefined,
  Новости: 'news',
  'Релизы партии': 'party_release',
  Статьи: 'article',
  Аналитика: 'analytics',
  Интервью: 'interview',
};

// Хардкод-фолбэк на случай недоступности API — не белый экран, а прежние демо-данные.
const FALLBACK_NEWS: PublicNewsItem[] = [
  { id: '1', slug: 'ot-obeshchaniy-k-garantiyam', format: 'news', imageUrl: '/images/marquee-1.jpg', isFeatured: false, readingTime: 5, tags: ['Политика'], publishedAt: '2026-06-29', title: 'От обещаний — к гарантиям!', excerpt: 'Переход от предвыборных обещаний к конкретным гарантиям для граждан — главный приоритет партии.' },
  { id: '2', slug: 'shokanov-izbran-predsedatelem', format: 'party_release', imageUrl: '/images/marquee-2.jpg', isFeatured: false, readingTime: 5, tags: ['Партия'], publishedAt: '2026-06-27', title: 'Нурсултан Шоканов избран председателем Народной партии Казахстана', excerpt: 'На внеочередном съезде делегаты единогласно проголосовали за нового лидера партии.' },
  { id: '3', slug: 'posledniy-akkord', format: 'analytics', imageUrl: '/images/marquee-3.jpg', isFeatured: false, readingTime: 4, tags: ['Анализ'], publishedAt: '2026-06-26', title: 'Последний аккорд', excerpt: 'Итоги политического сезона: что успела сделать партия и что предстоит в новом году.' },
];

const FORMATS: Format[] = ['Все', 'Новости', 'Релизы партии', 'Статьи', 'Аналитика', 'Интервью'];
const PER_PAGE = 6;

function getTag(item: PublicNewsItem) {
  return item.tags[0] ?? NEWS_FORMAT_LABELS[item.format];
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU');
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
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Поиск по ключевым словам"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ width: '100%', padding: '13px 36px 13px 38px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        {keyword && (
          <button onClick={() => setKeyword('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Date filter */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderTop: 'none', padding: '16px 16px', marginBottom: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Дата публикации</div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--line)', color: date ? 'var(--text)' : 'var(--text-muted)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
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
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderTop: 'none', marginTop: 2 }}>
        <div style={{ padding: '14px 16px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Форматы</div>
        {FORMATS.map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px',
              background: format === f ? 'rgba(219,31,38,.1)' : 'transparent',
              borderLeft: format === f ? '3px solid #db1f26' : '3px solid transparent',
              color: format === f ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: format === f ? 700 : 500,
              border: 'none',
              borderBottom: '1px solid var(--line)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
            onMouseEnter={e => { if (format !== f) e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { if (format !== f) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {f}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ─── News Card ────────────────────────────────────────────────────── */
function NewsCard({ item }: { item: PublicNewsItem }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/novosti/${item.slug}`}
      className="news-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s', borderColor: hovered ? 'var(--text-muted)' : 'var(--line)', textDecoration: 'none' }}
    >
      {/* Image */}
      <div className="news-card-img" style={{ flexShrink: 0, overflow: 'hidden', position: 'relative', background: 'var(--surface-2)' }}>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        )}
        <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>
          {getTag(item)}
        </span>
      </div>
      {/* Content */}
      <div className="news-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{formatDate(item.publishedAt)}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--line)', display: 'block' }} />
          <span style={{ fontSize: 11, color: '#db1f26', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{NEWS_FORMAT_LABELS[item.format]}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>{item.title}</h3>
        <p className="news-card-excerpt" style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{item.excerpt}</p>
        <span style={{ fontSize: 12, color: hovered ? '#db1f26' : 'var(--text-muted)', fontWeight: 700, transition: 'color .15s', letterSpacing: '.04em' }}>
          Читать →
        </span>
      </div>
    </Link>
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
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--line)', color: page === 1 ? 'var(--line)' : 'var(--text)', cursor: page === 1 ? 'default' : 'pointer', fontSize: 16 }}
      >
        ‹
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: page === p ? '#db1f26' : 'transparent', border: page === p ? '1px solid #db1f26' : '1px solid var(--line)', color: page === p ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: page === p ? 700 : 500, fontFamily: 'inherit' }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--line)', color: page === pageCount ? 'var(--line)' : 'var(--text)', cursor: page === pageCount ? 'default' : 'pointer', fontSize: 16 }}
      >
        ›
      </button>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', overflow: 'hidden' }}>
      <div className="news-card-img" style={{ flexShrink: 0, background: 'var(--surface-2)' }} />
      <div className="news-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        <div style={{ width: '30%', height: 10, background: 'var(--surface-2)' }} />
        <div style={{ width: '70%', height: 16, background: 'var(--surface-2)' }} />
        <div style={{ width: '90%', height: 12, background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export function NewsPage() {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [format, setFormat] = useState<Format>('Все');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  const reset = () => { setKeyword(''); setDate(''); setFormat('Все'); setPage(1); };

  // Debounce keyword before hitting the API
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNews({ format: FORMAT_TO_API[format], q: debouncedKeyword || undefined, page, limit: PER_PAGE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotal(res.total);
        setUsedFallback(false);
      })
      .catch(() => {
        if (cancelled) return;
        // API недоступен — показываем демо-данные вместо белого экрана
        setItems(FALLBACK_NEWS);
        setTotal(FALLBACK_NEWS.length);
        setUsedFallback(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [format, debouncedKeyword, page]);

  // Мягкий фильтр по дате публикации — применяется к уже загруженной странице.
  const visible = date
    ? items.filter((n) => n.publishedAt && n.publishedAt.slice(0, 10) === date)
    : items;

  const handleFormat = (f: Format) => { setFormat(f); setPage(1); };
  const handleKeyword = (v: string) => { setKeyword(v); setPage(1); };
  const handleDate = (v: string) => { setDate(v); setPage(1); };

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Hero news section — 48px gap above, comes naturally from NewsSection py */}
      <NewsSection hideAllNewsLink />

      {/* Main content — 48px top, 80px bottom */}
      {/* Heading row — full width, above the grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 24px' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1 }}>Все новости</h2>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          Найдено: <strong style={{ color: 'var(--text)' }}>{total}</strong> материалов
          {format !== 'Все' && (
            <span style={{ marginLeft: 10, padding: '3px 10px', background: 'rgba(219,31,38,.12)', border: '1px solid rgba(219,31,38,.3)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#ff5a60' }}>
              {format}
            </span>
          )}
          {usedFallback && (
            <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-muted)' }}>· демо-данные (сервер недоступен)</span>
          )}
        </span>
      </div>

      {/* ── Mobile filter bar (visible only on mobile) ── */}
      <div className="mobile-filter-bar" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 12px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Поиск..." value={keyword} onChange={e => handleKeyword(e.target.value)}
            style={{ width: '100%', padding: '10px 36px 10px 34px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          {keyword && (
            <button onClick={() => handleKeyword('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>
          )}
        </div>
        {/* Row: date + reset */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Calendar size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="date" value={date} onChange={e => handleDate(e.target.value)}
              style={{ width: '100%', padding: '9px 10px 9px 30px', background: 'var(--surface)', border: '1px solid var(--line)', color: date ? 'var(--text)' : 'var(--text-muted)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
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
              style={{ flexShrink: 0, padding: '6px 14px', background: format === f ? '#db1f26' : 'var(--surface-2)', border: `1px solid ${format === f ? '#db1f26' : 'var(--line)'}`, color: format === f ? '#fff' : 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards + sidebar grid — both start at the same level */}
      <div className="news-page-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 80px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, alignItems: 'start' }}>

        {/* LEFT: cards grid */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {Array.from({ length: PER_PAGE }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : visible.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {visible.map(item => <NewsCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: .3 }}>🔍</div>
              <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>По вашему запросу ничего не найдено</p>
              <button onClick={reset} style={{ marginTop: 16, padding: '11px 24px', background: '#db1f26', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Сбросить фильтры
              </button>
            </div>
          )}
          <Pagination page={page} total={total} perPage={PER_PAGE} onChange={p => { setPage(p); window.scrollTo({ top: 500, behavior: 'smooth' }); }} />
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
      <section className="bg-surface border-t border-line pb-16 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <NarodnoeMediaSection />
        </div>
      </section>
    </div>
  );
}
