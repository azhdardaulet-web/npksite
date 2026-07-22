import { useState } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { subscribeShop, ApiError } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

const CATEGORIES = ['Все', 'Одежда', 'Аксессуары', 'Книги и брошюры', 'Сувениры'];
const CATEGORIES_KZ = ['Барлығы', 'Киім', 'Керек-жарақ', 'Кітаптар мен кітапшалар', 'Кәдесыйлар'];

const PRODUCTS = [
  { id: 1, name: 'Футболка НПК', category: 'Одежда', price: '4 990 ₸', badge: 'Новинка' },
  { id: 2, name: 'Худи «Билік — халыққа»', category: 'Одежда', price: '14 990 ₸', badge: '' },
  { id: 3, name: 'Кепка с логотипом', category: 'Аксессуары', price: '3 490 ₸', badge: 'Хит' },
  { id: 4, name: 'Значок НПК (набор 3 шт)', category: 'Аксессуары', price: '1 490 ₸', badge: '' },
  { id: 5, name: 'Сумка-шопер', category: 'Аксессуары', price: '2 990 ₸', badge: '' },
  { id: 6, name: 'Программа партии (брошюра)', category: 'Книги и брошюры', price: 'Бесплатно', badge: '' },
  { id: 7, name: 'Флаг НПК 90×150 см', category: 'Сувениры', price: '5 990 ₸', badge: '' },
  { id: 8, name: 'Кружка «Народная партия»', category: 'Сувениры', price: '2 490 ₸', badge: 'Хит' },
];

const PRODUCTS_KZ = [
  { id: 1, name: 'ҚХП жейдесі', category: 'Киім', price: '4 990 ₸', badge: 'Жаңа өнім' },
  { id: 2, name: '«Билік халыққа» худиі', category: 'Киім', price: '14 990 ₸', badge: '' },
  { id: 3, name: 'Логотипі бар кепка', category: 'Керек-жарақ', price: '3 490 ₸', badge: 'Көп таңдалған' },
  { id: 4, name: 'ҚХП төсбелгілері (3 дана)', category: 'Керек-жарақ', price: '1 490 ₸', badge: '' },
  { id: 5, name: 'Шопер сөмке', category: 'Керек-жарақ', price: '2 990 ₸', badge: '' },
  { id: 6, name: 'Партия бағдарламасы (кітапша)', category: 'Кітаптар мен кітапшалар', price: 'Тегін', badge: '' },
  { id: 7, name: 'ҚХП туы, 90×150 см', category: 'Кәдесыйлар', price: '5 990 ₸', badge: '' },
  { id: 8, name: '«Халық партиясы» саптыаяғы', category: 'Кәдесыйлар', price: '2 490 ₸', badge: 'Көп таңдалған' },
];

export function ShopPage() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const categories = isKz ? CATEGORIES_KZ : CATEGORIES;
  const products = isKz ? PRODUCTS_KZ : PRODUCTS;
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await subscribeShop(email.trim());
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (isKz ? 'Жазылу мүмкін болмады. Қайталап көріңіз.' : 'Не удалось подписаться. Попробуйте ещё раз.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ position: 'relative', padding: 'clamp(120px,16vh,180px) clamp(16px,4vw,44px) clamp(40px,5vw,70px)', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(219,31,38,.2), transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 12px', border: '1px solid rgba(255,255,255,.16)', borderRadius: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#db1f26', display: 'block' }} />
            {isKz ? 'Ресми дүкен' : 'Официальный магазин'}
          </div>
          <h1 style={{ margin: '24px 0 0', fontWeight: 800, fontSize: 'clamp(44px,7vw,100px)', lineHeight: .94, letterSpacing: '-.035em' }}>
            {isKz ? <><span style={{ color: '#db1f26' }}>Халық партиясының</span><br />ресми өнімдері</> : <>Мерч{' '}<span style={{ color: '#db1f26' }}>Народной</span><br />партии</>}
          </h1>
          <p style={{ margin: '24px 0 0', maxWidth: '52ch', fontSize: 'clamp(16px,1.6vw,20px)', lineHeight: 1.55, color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>
            {isKz ? 'Идеяны бірге алып жүріңіз. ҚХП-ның ресми киімі, керек-жарағы мен кәдесыйлары әділетті Қазақстанды қолдайтын жандарға арналған.' : 'Носи идею. Официальная атрибутика НПК — одежда, аксессуары и сувениры для тех, кто за справедливый Казахстан.'}
          </p>
        </div>
      </section>

      {/* COMING SOON BANNER */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(16px,4vw,44px) clamp(60px,8vw,100px)' }}>
        <ScrollReveal>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.09)', padding: 'clamp(40px,5vw,72px)' }}>
            <span aria-hidden style={{ position: 'absolute', top: '-.2em', right: '-.02em', fontSize: 'clamp(130px,22vw,320px)', fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,.025)', pointerEvents: 'none', letterSpacing: '-.04em' }}>{isKz ? 'ЖАҚЫНДА' : 'СКОРО'}</span>
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,4vw,60px)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 16 }}>{isKz ? 'Дүкен жақында ашылады' : 'Магазин открывается'}</div>
                <h2 style={{ margin: 0, fontSize: 'clamp(28px,3.6vw,48px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.025em' }}>
                  {isKz ? 'Жақында мұнда партияның ресми өнімдері сатыла бастайды' : 'Скоро здесь появится официальный мерч партии'}
                </h2>
                <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.6)', maxWidth: '46ch' }}>
                  {isKz ? 'Қазақстан Халық партиясының ресми өнімдер дүкенін ашуға дайындалып жатырмыз. Электрондық поштаңызды қалдырсаңыз, дүкен ашылғанда сізге бірінші болып хабарлаймыз.' : 'Мы готовим официальный магазин атрибутики Народной партии Казахстана. Оставьте свой email — сообщим первыми об открытии.'}
                </p>
                {subscribed ? (
                  <p style={{ marginTop: 28, fontSize: 15, color: '#db1f26', fontWeight: 700 }}>
                    {isKz ? 'Дайын! Дүкен ашылғанда сізге хабарлаймыз.' : 'Готово! Мы сообщим вам, когда магазин откроется.'}
                  </p>
                ) : (
                  <form onSubmit={handleSubscribe} style={{ marginTop: 28, display: 'flex', gap: 0, maxWidth: 420, flexWrap: 'wrap' }}>
                    <input
                      type="email"
                      required
                      placeholder={isKz ? 'Электрондық поштаңыз' : 'Ваш email'}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ flex: 1, padding: '14px 18px', background: '#050505', border: '1px solid rgba(255,255,255,.14)', borderRight: 'none', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ padding: '14px 22px', background: '#db1f26', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting ? (isKz ? 'Жіберілуде…' : 'Отправка…') : (isKz ? 'Хабарлау →' : 'Уведомить →')}
                    </button>
                    {error && (
                      <p style={{ width: '100%', marginTop: 10, fontSize: 13, color: '#db1f26' }}>{error}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Preview cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {products.slice(0, 4).map(p => (
                  <div key={p.id} style={{ position: 'relative', background: '#050505', border: '1px solid rgba(255,255,255,.07)', padding: '20px 16px' }}>
                    {p.badge && (
                      <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff' }}>{p.badge}</span>
                    )}
                    {/* Placeholder image */}
                    <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 28, opacity: .35 }}>
                        {p.category === 'Одежда' || p.category === 'Киім' ? '👕' : p.category === 'Аксессуары' || p.category === 'Керек-жарақ' ? '🎩' : p.category === 'Сувениры' || p.category === 'Кәдесыйлар' ? '🏅' : '📄'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: p.price === 'Бесплатно' || p.price === 'Тегін' ? '#db1f26' : '#fff' }}>{p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CATEGORY PILLS */}
        <div style={{ marginTop: 'clamp(48px,6vw,80px)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#db1f26', marginBottom: 16 }}>{isKz ? 'Санаттар' : 'Категории'}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {categories.map((cat, i) => (
              <span key={cat} style={{ padding: '10px 20px', background: i === 0 ? '#db1f26' : '#0e0e0f', border: i === 0 ? '1px solid #db1f26' : '1px solid rgba(255,255,255,.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 'clamp(14px,1.8vw,20px)' }}>
          {products.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 0.04}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: '#0e0e0f', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
                {p.badge && (
                  <span style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, padding: '4px 10px', background: '#db1f26', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff' }}>{p.badge}</span>
                )}
                {/* Product image placeholder */}
                <div style={{ aspectRatio: '1', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 48, opacity: .25 }}>
                    {p.category === 'Одежда' || p.category === 'Киім' ? '👕' : p.category === 'Аксессуары' || p.category === 'Керек-жарақ' ? '🎩' : p.category === 'Сувениры' || p.category === 'Кәдесыйлар' ? '🏅' : '📄'}
                  </span>
                </div>
                <div style={{ padding: '18px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>{p.category}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: p.price === 'Бесплатно' || p.price === 'Тегін' ? '#db1f26' : '#fff' }}>{p.price}</span>
                    <button style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,.18)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.04em' }}>
                      {isKz ? 'Себетке салу' : 'В корзину'}
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <ScrollReveal>
          <div style={{ marginTop: 'clamp(48px,6vw,80px)', padding: 'clamp(36px,4vw,60px)', background: '#db1f26', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <span aria-hidden style={{ position: 'absolute', bottom: '-.3em', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(100px,18vw,260px)', fontWeight: 800, color: 'rgba(0,0,0,.08)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{isKz ? 'ҚХП' : 'НПК'}</span>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(22px,3.4vw,44px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.02em' }}>{isKz ? 'Идеяны қолдаңыз. Партиямен бірге болыңыз.' : 'Носи идею. Поддержи партию.'}</h2>
              <p style={{ margin: '14px auto 0', maxWidth: '48ch', fontSize: 16, color: 'rgba(255,255,255,.85)', lineHeight: 1.55 }}>{isKz ? 'Әр сатып алу партияның халық игілігі жолындағы жұмысына қолдау көрсетеді.' : 'Каждая покупка помогает партии работать для народа.'}</p>
              <a href="/vstupit" style={{ display: 'inline-flex', marginTop: 24, padding: '15px 30px', background: '#050505', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
                {isKz ? 'Партияға қосылу →' : 'Вступить в партию →'}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
