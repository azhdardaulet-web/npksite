import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight, Play } from 'lucide-react';
import { fetchNews, fetchYoutubeFeed, NEWS_FORMAT_LABELS, type PublicNewsItem } from '@/lib/api';

// Хардкод-фолбэк на случай недоступности YouTube API/ключа — не белый экран.
const FALLBACK_VIDEOS = [
  { id: 'McSNWo1FcuU', title: 'Нурсұлтан Шоқанов Қазақстан Халық партиясының төрағасы болып сайланды', date: '27.06.2026' },
  { id: 'pSagR2BBiYk', title: 'Ермухамет Ертысбаев покинул пост председателя НПК', date: '27.06.2026' },
  { id: 'aA85tRgDRdo', title: 'ТӨРЕШ ТАҒЫ ТРЕНДТЕ. АБАЙ БЕГЕЙДІҢ ӘЙЕЛІ ЕЛ АУЫЗЫНДА', date: '28.06.2026' },
  { id: 'RmfCe77V49c', title: 'КЕНЖЕСІНЕН ҚОРЛЫҚ КӨРГЕН ҚАРТ ӘКЕ. КУРЬЕР АНА КӨШІП КЕТТІ', date: '26.06.2026' },
  { id: 'IUbDOK-VlUE', title: 'Алматыда тыйым салынған вейптерді тасымалдаған курьер ұсталды', date: '27.06.2026' },
  { id: 'NvqxBCDKvsU', title: 'Қазақстандықтар Қырғызстанда жоғалған баланы іздеуге қосылды', date: '26.06.2026' },
  { id: 'YHvMJ7b6S7M', title: '11 жастағы бала жер сілкінісінен кейін үш күннен соң құтқарылды', date: '28.06.2026' },
  { id: 'FBn32VnYdCQ', title: 'Каспий теңізінде жоғалған ер адамды төртінші күн іздеуде', date: '26.06.2026' },
];

const SOCIAL = [
  { name: 'YouTube',   count: '139 тыс.', href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.48 20.5 12 20.5 12 20.5s7.52 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z"/></svg> },
  { name: 'TikTok',    count: '113 тыс.', href: 'https://www.tiktok.com/@halyk_partiyasy',              icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/></svg> },
  { name: 'Instagram', count: '12,7 тыс.', href: 'https://www.instagram.com/halyk_partiyasy/',          icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { name: 'Telegram',  count: '313',       href: 'https://t.me/halykparty',                              icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
  { name: 'Facebook',  count: '7 тыс.',   href: 'https://www.facebook.com/halykpartiyasy',              icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
];

// Хардкод-фолбэк на случай недоступности API — не белый экран, а прежние демо-данные.
const FALLBACK_NEWS: PublicNewsItem[] = [
  { id: '1', slug: 'ot-obeshchaniy-k-garantiyam', format: 'news', imageUrl: '/images/marquee-1.jpg', isFeatured: false, readingTime: 5, tags: ['Политика'], publishedAt: '2026-06-29', title: 'От обещаний — к гарантиям!', excerpt: 'Переход от предвыборных обещаний к конкретным гарантиям для граждан — главный приоритет партии.' },
  { id: '2', slug: 'shokanov-izbran-predsedatelem', format: 'party_release', imageUrl: '/images/marquee-2.jpg', isFeatured: false, readingTime: 5, tags: ['Партия'], publishedAt: '2026-06-27', title: 'Нурсултан Шоканов избран председателем Народной партии Казахстана', excerpt: 'На внеочередном съезде делегаты единогласно проголосовали за нового лидера партии.' },
  { id: '3', slug: 'posledniy-akkord', format: 'analytics', imageUrl: '/images/marquee-3.jpg', isFeatured: false, readingTime: 4, tags: ['Анализ'], publishedAt: '2026-06-26', title: 'Последний аккорд', excerpt: 'Итоги политического сезона: что успела сделать партия и что предстоит в новом году.' },
  { id: '4', slug: 'dolg-v-zhizni', format: 'article', imageUrl: '/images/marquee-4.jpg', isFeatured: false, readingTime: 3, tags: ['Общество'], publishedAt: '2026-06-26', title: 'Долг в жизни', excerpt: 'Гражданская ответственность и личный долг в контексте современного казахстанского общества.' },
];

function getTag(item: PublicNewsItem) {
  return item.tags[0] ?? NEWS_FORMAT_LABELS[item.format];
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function NewsSection({ hideAllNewsLink }: { hideAllNewsLink?: boolean } = {}) {
  const [mainIdx, setMainIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [news, setNews] = useState<PublicNewsItem[]>(FALLBACK_NEWS);

  useEffect(() => {
    let cancelled = false;
    // На главной показываем только новости с включённым тумблером
    // «Показать на главной странице» (isFeatured) в CMS. Если таких пока
    // нет — не молчим белым экраном, а показываем последние опубликованные.
    fetchNews({ limit: 9, isFeatured: true })
      .then((res) => {
        if (cancelled) return;
        if (res.data.length > 0) { setNews(res.data); return; }
        return fetchNews({ limit: 9 }).then((all) => { if (!cancelled && all.data.length > 0) setNews(all.data); });
      })
      .catch(() => { /* остаёмся на демо-данных */ });
    return () => { cancelled = true; };
  }, []);

  const mainNews = news[mainIdx] ?? news[0];
  const sideNews = news.filter((_, i) => i !== mainIdx);

  // Auto-advance every 3s, pause on hover
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setMainIdx((i) => (i + 1) % news.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [paused, news.length]);

  return (
    <section className="bg-bg pt-[var(--section-gap)] pb-[var(--section-gap)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-text-base">Новости</h2>
          {!hideAllNewsLink && (
            <Link to="/novosti"
               className="inline-flex items-center gap-1.5 text-[14px] font-medium text-red hover:text-red/70 transition-colors">
              Все новости <ArrowUpRight size={16} />
            </Link>
          )}
        </div>

        {/* ── News grid ──────────────────────────────────────────────────── */}
        {/* Fixed height 520px so the main card doesn't blow up the section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0 lg:h-[520px]">

          {/* Left: main featured card — hover pauses auto-slide */}
          <div
            className="relative overflow-hidden h-[320px] lg:h-full group cursor-pointer"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {mainNews.imageUrl && (
              <img
                key={`img-${mainIdx}`}
                src={mainNews.imageUrl}
                alt={mainNews.title}
                className="w-full h-full object-cover group-hover:scale-105 news-slide-img"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Tag */}
            <span
              key={`tag-${mainIdx}`}
              className="absolute top-4 left-4 px-3 py-1 bg-accent-brand text-accent-brand-text text-[11px] font-bold uppercase tracking-wider news-slide-content"
            >
              {getTag(mainNews)}
            </span>

            {/* Slider nav */}
            <button onClick={() => setMainIdx((mainIdx - 1 + news.length) % news.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Предыдущая">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setMainIdx((mainIdx + 1) % news.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Следующая">
              <ChevronRight size={16} />
            </button>

            {/* Caption */}
            <Link to={`/novosti/${mainNews.slug}`} key={`caption-${mainIdx}`} className="absolute bottom-0 left-0 right-0 p-5 news-slide-content block">
              <p className="text-[11px] text-fog/70 mb-1.5">{formatDate(mainNews.publishedAt)}</p>
              <h3 className="text-[18px] md:text-[20px] font-bold text-white leading-snug mb-1.5 line-clamp-2">
                {mainNews.title}
              </h3>
              <p className="text-[13px] text-fog/70 line-clamp-2 mb-4">{mainNews.excerpt}</p>
              {/* Dots */}
              <div className="flex gap-1.5">
                {news.map((_, i) => (
                  <button key={i} onClick={(e) => { e.preventDefault(); setMainIdx(i); }}
                    className={`h-1 transition-all duration-300 ${i === mainIdx ? 'w-5 bg-red' : 'w-1 bg-white/25'}`}
                    aria-label={`Слайд ${i + 1}`} />
                ))}
              </div>
            </Link>
          </div>

          {/* Right: side news list — data-lenis-prevent stops Lenis from eating wheel events */}
          <div data-lenis-prevent className="flex flex-col divide-y divide-line border-l border-line news-side-scroll" style={{ maxHeight: 520, overflowY: 'auto' }}>
            {sideNews.map((item) => (
              <div key={item.id}
                className="flex gap-3 p-4 cursor-pointer hover:bg-surface-2 transition-colors group"
                onClick={() => setMainIdx(news.indexOf(item))}>
                {/* Thumb */}
                <div className="shrink-0 w-[80px] h-[60px] overflow-hidden">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                {/* Text */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-accent-brand uppercase tracking-wider">{getTag(item)}</span>
                    <span className="text-[10px] text-text-muted">{formatDate(item.publishedAt)}</span>
                  </div>
                  <p className="text-[13px] font-medium text-text-base leading-snug line-clamp-2 group-hover:text-text-muted transition-colors">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
            {/* All link */}
            <div className="p-4 mt-auto">
              <Link to="/novosti"
                className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-base transition-colors">
                Все материалы <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export function NarodnoeMediaSection({ videoRef: externalRef }: { videoRef?: React.RefObject<HTMLDivElement | null> } = {}) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = externalRef ?? ownRef;
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);

  useEffect(() => {
    let cancelled = false;
    fetchYoutubeFeed()
      .then((res) => {
        if (cancelled || res.videos.length === 0) return;
        setVideos(res.videos.map((v) => ({ id: v.id, title: v.title, date: formatDate(v.publishedAt) })));
      })
      .catch(() => { /* остаёмся на демо-данных */ });
    return () => { cancelled = true; };
  }, []);

  return (
        <div className="mt-12 pt-10 border-t border-line">
          <div className="mb-6">
            <p className="text-[10px] font-bold text-accent-brand uppercase tracking-widest mb-2">Народное медиа. Народное доверие.</p>
            <h3 className="text-[22px] md:text-[28px] font-bold text-text-base uppercase leading-tight">
              Голос партии, который слышит страна
            </h3>
          </div>

          <div
            ref={ref}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {videos.map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 w-[240px] sm:w-[260px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="relative aspect-video overflow-hidden bg-surface-2 mb-2.5">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-black/60 border border-white/20 flex items-center justify-center group-hover:bg-red group-hover:border-red transition-all duration-300">
                      <Play size={14} fill="white" className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-text-base leading-snug line-clamp-2 group-hover:text-text-muted transition-colors">{v.title}</p>
                <p className="text-[11px] text-text-muted mt-1">{v.date}</p>
              </a>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5">
            <a
              href="https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-text-base border border-line hover:border-text-muted px-5 py-2.5 transition-all"
            >
              Все выпуски <ArrowUpRight size={14} />
            </a>
            <div className="flex gap-2">
              <button
                onClick={() => ref.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                className="w-9 h-9 border border-line flex items-center justify-center text-text-base hover:bg-surface-2 transition-all"
                aria-label="Назад"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => ref.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                className="w-9 h-9 border border-line flex items-center justify-center text-text-base hover:bg-surface-2 transition-all"
                aria-label="Вперёд"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Присоединяйтесь к нашему сообществу</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 bg-surface-2 border border-line hover:border-text-muted hover:bg-line transition-all px-4 py-2.5"
                >
                  <span className="text-text-muted group-hover:text-text-base transition-colors">{s.icon}</span>
                  <span className="text-[12px] font-medium text-text-muted group-hover:text-text-base transition-colors">{s.name}</span>
                  <span className="text-[13px] font-bold text-text-base ml-auto">{s.count}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
  );
}
