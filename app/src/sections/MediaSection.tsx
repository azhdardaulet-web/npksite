import { useRef, useState } from 'react';

const VIDEOS = [
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
  {
    name: 'YouTube', count: '139 тыс.', href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.48 20.5 12 20.5 12 20.5s7.52 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z"/></svg>,
  },
  {
    name: 'TikTok', count: '113 тыс.', href: 'https://www.tiktok.com/@halyk_partiyasy',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/></svg>,
  },
  {
    name: 'Instagram', count: '12,7 тыс.', href: 'https://www.instagram.com/halyk_partiyasy/',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    name: 'Telegram', count: '313', href: 'https://t.me/halykparty',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  },
  {
    name: 'Facebook', count: '7 тыс.', href: 'https://www.facebook.com/halykpartiyasy',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
];

const CARD_W = 300;
const GAP = 16;

export function MediaSection() {
  const [offset, setOffset] = useState(0);
  const maxOffset = (VIDEOS.length - 1) * (CARD_W + GAP);

  function prev() {
    setOffset((o) => Math.max(0, o - (CARD_W + GAP)));
  }
  function next() {
    setOffset((o) => Math.min(maxOffset, o + (CARD_W + GAP)));
  }

  return (
    <section className="bg-[#0a0a0a] py-16 md:py-20 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] font-bold text-red uppercase tracking-widest mb-3">
            Народное медиа. Народное доверие.
          </p>
          <h2 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-white uppercase leading-[1.0] mb-5">
            Голос партии,<br />который слышит страна
          </h2>
          <p className="text-[15px] md:text-[16px] font-light text-fog leading-relaxed max-w-[860px]">
            Сотни тысяч подписчиков, миллионы просмотров и собственная медиастудия. Мы говорим о важных событиях, поднимаем социальные вопросы и показываем позицию Народной партии Казахстана на площадках, где нас смотрят, обсуждают и поддерживают.
          </p>
        </div>

        {/* Video carousel */}
        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {VIDEOS.map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-none"
                style={{ width: CARD_W }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#1a1a1a] overflow-hidden mb-3">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white ml-0.5" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Dark gradient at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                {/* Title + date */}
                <h4 className="text-[13px] font-medium text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-fog transition-colors">
                  {v.title}
                </h4>
                <p className="text-[11px] text-fog/50">{v.date}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mt-6">
          <a
            href="https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-[13px] font-medium text-white hover:bg-white/[0.06] hover:border-white/40 transition-all"
          >
            Все выпуски
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 13L13 3M13 3H6M13 3v7"/>
            </svg>
          </a>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={offset === 0}
              className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:border-white/50 hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Назад"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 4L6 8l4 4"/>
              </svg>
            </button>
            <button
              onClick={next}
              disabled={offset >= maxOffset}
              className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:border-white/50 hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Вперёд"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Social stats */}
        <div className="mt-10 pt-8 border-t border-white/[0.07]">
          <p className="text-[15px] font-medium text-white mb-5">Присоединяйтесь к нашему сообществу</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-4 py-3 hover:bg-white/[0.07] hover:border-white/20 transition-all group"
              >
                <span className="text-fog/60 group-hover:text-white transition-colors flex-none">{s.icon}</span>
                <span className="text-[12px] font-medium text-fog/60 group-hover:text-fog transition-colors">{s.name}</span>
                <span className="text-[13px] font-bold text-white ml-auto">{s.count}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
