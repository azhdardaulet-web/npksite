import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LATEST = [
  { id: 1,  date: '29.06.2026', tag: 'Политика',  title: 'От обещаний — к гарантиям!', image: '/images/marquee-1.jpg' },
  { id: 2,  date: '27.06.2026', tag: 'Партия',    title: 'Нурсултан Шоканов избран председателем НПК', image: '/images/marquee-2.jpg' },
  { id: 3,  date: '26.06.2026', tag: 'Анализ',    title: 'Последний аккорд', image: '/images/marquee-3.jpg' },
  { id: 4,  date: '26.06.2026', tag: 'Общество',  title: 'Долг в жизни', image: '/images/marquee-4.jpg' },
  { id: 5,  date: '26.06.2026', tag: 'Экономика', title: 'Плата за неэффективность', image: '/images/marquee-5.jpg' },
  { id: 7,  date: '24.06.2026', tag: 'Регионы',   title: 'Народная партия открыла приёмную в Шымкенте', image: '/images/candidate-2.jpg' },
  { id: 8,  date: '23.06.2026', tag: 'Фракция',   title: 'Фракция НПК внесла законопроект о минимальной зарплате', image: '/images/candidate-3.jpg' },
];

export function ReadAlsoSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });

  return (
    <section style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,.07)', padding: 'clamp(40px,5vw,64px) 0 clamp(48px,6vw,80px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 8 }}>Материалы по теме</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>Читайте также</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['left', 'right'] as const).map(dir => (
              <button key={dir} onClick={() => scroll(dir)}
                aria-label={dir === 'left' ? 'Назад' : 'Вперёд'}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; }}
              >
                {dir === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable track */}
        <div ref={scrollRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: 4 }}>
          <style>{`div::-webkit-scrollbar{display:none}`}</style>
          {LATEST.map(item => (
            <Link
              key={item.id}
              to={`/novosti/${item.id}`}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flexShrink: 0, width: 'clamp(220px,20vw,270px)', scrollSnapAlign: 'start',
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
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>{item.title}</h4>
                <span style={{ fontSize: 12, color: hovered === item.id ? '#db1f26' : 'rgba(255,255,255,.3)', fontWeight: 700, transition: 'color .15s' }}>Читать →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
