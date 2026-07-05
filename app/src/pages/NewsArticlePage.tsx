import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchNews, fetchNewsBySlug, NEWS_FORMAT_LABELS, type PublicNewsItem, type PublicNewsDetail } from '@/lib/api';

function getTag(item: { tags: string[]; format: PublicNewsItem['format'] }) {
  return item.tags[0] ?? NEWS_FORMAT_LABELS[item.format];
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ─── Sidebar latest news ─────────────────────────────────────────── */
function SidebarNews({ items }: { items: PublicNewsItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside style={{ position: 'sticky', top: 90 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Последние новости</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => (
          <Link
            key={item.id}
            to={`/novosti/${item.slug}`}
            style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.06)', textDecoration: 'none', color: '#fff' }}
          >
            <div style={{ flexShrink: 0, width: 72, height: 48, overflow: 'hidden', position: 'relative', background: '#151515' }}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#db1f26', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{getTag(item)}</div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: 'rgba(255,255,255,.85)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>{formatDate(item.publishedAt)}</div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

/* ─── Bottom "Читайте также" slider ───────────────────────────────── */
function ReadAlsoSlider({ items }: { items: PublicNewsItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  if (items.length === 0) return null;

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
          {items.map(item => (
            <Link
              key={item.id}
              to={`/novosti/${item.slug}`}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flexShrink: 0, width: 'clamp(240px,22vw,280px)', scrollSnapAlign: 'start',
                display: 'flex', flexDirection: 'column', background: '#0e0e0f',
                border: `1px solid ${hovered === item.id ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.07)'}`,
                overflow: 'hidden', textDecoration: 'none', color: '#fff', transition: 'border-color .2s',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#151515' }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hovered === item.id ? 'scale(1.06)' : 'scale(1)' }} />
                )}
                <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>{getTag(item)}</span>
              </div>
              <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{formatDate(item.publishedAt)}</span>
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
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<PublicNewsDetail | null>(null);
  const [related, setRelated] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setApiDown(false);

    fetchNewsBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setArticle(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.message?.includes('не найдена')) {
          setNotFound(true);
        } else {
          setApiDown(true);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    fetchNews({ limit: 8 })
      .then((res) => { if (!cancelled) setRelated(res.data.filter((n) => n.slug !== slug)); })
      .catch(() => { /* сайдбар/слайдер просто не покажутся */ });

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', paddingTop: 160, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,.4)' }}>Загрузка...</p>
      </div>
    );
  }

  if (notFound || (apiDown && !article)) {
    return (
      <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', paddingTop: 160, textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.6)', marginBottom: 20 }}>
          {notFound ? 'Материал не найден' : 'Не удалось загрузить материал — попробуйте позже'}
        </p>
        <Link to="/novosti" style={{ color: '#db1f26', fontWeight: 700, textDecoration: 'none' }}>← Ко всем новостям</Link>
      </div>
    );
  }

  if (!article) return null;

  const translation = article.activeTranslation;

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
            <span style={{ color: '#fff' }}>{translation?.title ?? ''}</span>
          </nav>
        </div>
      </div>

      {/* Article header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 0' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 10px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>{getTag(article)}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{formatDate(article.publishedAt)}</span>
          {article.readingTime && (
            <>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>·</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{article.readingTime} мин чтения</span>
            </>
          )}
        </div>
        <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(26px,3.5vw,48px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', maxWidth: '80%' }}>
          {translation?.title}
        </h1>
        {translation?.excerpt && (
          <p style={{ margin: 0, fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.65, color: 'rgba(255,255,255,.65)', fontWeight: 500, maxWidth: '70%' }}>
            {translation.excerpt}
          </p>
        )}
      </div>

      {/* Hero image */}
      {article.imageUrl && (
        <div style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 clamp(16px,4vw,40px)' }}>
          <div style={{ width: '100%', aspectRatio: '21/9', overflow: 'hidden', position: 'relative' }}>
            <img src={article.imageUrl} alt={translation?.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )}

      {/* Article body + sidebar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px clamp(16px,4vw,40px) 80px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 60, alignItems: 'start' }}>

        {/* Article text — тело статьи из TipTap (HTML) */}
        <article
          className="news-article-body"
          style={{ fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,.8)' }}
          dangerouslySetInnerHTML={{ __html: translation?.content ?? '' }}
        />

        {/* Sidebar */}
        <SidebarNews items={related.slice(0, 8)} />
      </div>

      <style>{`
        .news-article-body p { margin: 0 0 20px; }
        .news-article-body h2 { margin: 48px 0 20px; font-size: clamp(20px,2vw,28px); font-weight: 800; color: #fff; letter-spacing: -.01em; }
        .news-article-body h3 { margin: 32px 0 16px; font-size: clamp(18px,1.8vw,22px); font-weight: 700; color: #fff; }
        .news-article-body blockquote { margin: 36px 0; padding: 28px 32px; border-left: 4px solid #db1f26; background: rgba(219,31,38,.06); font-size: 20px; font-weight: 700; line-height: 1.5; color: #fff; }
        .news-article-body img { width: 100%; display: block; margin: 40px 0; }
        .news-article-body a { color: #db1f26; }
        .news-article-body ul, .news-article-body ol { padding-left: 22px; margin: 0 0 20px; }
      `}</style>

      {/* Read also slider */}
      <ReadAlsoSlider items={related.slice(0, 8)} />
    </div>
  );
}
