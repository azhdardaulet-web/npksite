import { Link } from 'react-router-dom';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';

interface ProgramIntroBlock { headingRu?: string; textRu?: string; }

const GAP = 16;

const MOBILE_STYLES = `
  @media (max-width: 767px) {
    .prog-grid {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
    }

    /* все карточки — полная ширина, фиксированная высота */
    .prog-grid > article {
      grid-column: unset !important;
      grid-row: unset !important;
      height: 190px !important;
      min-height: 190px !important;
      border-radius: 16px !important;
    }

    /* порядок карточек на мобиле: 1 2 3 4 5 6 */
    .prog-card-1 { order: 1; }
    .prog-card-2 { order: 2; }
    .prog-card-3 { order: 3; }
    .prog-card-4 { order: 4; }
    .prog-card-5 { order: 5; }
    .prog-card-6 { order: 6; }

    /* текстовые блоки на мобиле */
    .prog-grid .prog-text {
      padding: 20px !important;
    }
    .prog-grid .prog-text h3 {
      font-size: 20px !important;
      line-height: 92% !important;
    }
    .prog-grid .prog-text p {
      font-size: 12px !important;
      margin-top: 8px !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }
    .prog-grid .prog-text a.prog-cta {
      margin-top: 10px !important;
      font-size: 13px !important;
    }

    /* изображения на мобиле */
    .prog-grid img {
      width: 50% !important;
      height: 100% !important;
    }

    /* карточка 6 (тёмная) — больше высоты чтобы кнопка не обрезалась */
    .prog-card-6 {
      height: 270px !important;
      min-height: 270px !important;
      padding: 20px !important;
    }
    .prog-card-6 .prog-text {
      max-width: 58% !important;
    }
    .prog-card-6 .prog-text h3 {
      font-size: 18px !important;
    }
    .prog-card-6 .prog-text p {
      -webkit-line-clamp: 2 !important;
      margin-top: 6px !important;
    }
    .prog-card-6 .prog-cta {
      margin-top: 12px !important;
      padding: 10px 14px !important;
      font-size: 13px !important;
      white-space: nowrap !important;
    }
  }
`;

export function ProgramSection() {
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<ProgramIntroBlock>('program_intro');
  const heading = cms?.headingRu?.trim() || 'Предвыборная программа Народной партии Казахстана';
  const subtitle = cms?.textRu?.trim() || 'Мы собрали ключевые акценты новой политической программы Народной партии Казахстана: человек труда, справедливые возможности, ответственная власть, экономика для людей, поддержка семьи и будущее детей.';

  return (
    <section
      className="relative w-full overflow-hidden py-[var(--section-gap)] bg-bg"
    >
      <style>{MOBILE_STYLES}</style>
      <div className="relative z-10 max-w-[1480px] mx-auto px-4 md:px-8">

        {/* ── Header ────────────────────────────────────── */}
        <div className="max-w-[860px] mx-auto text-center mb-10">
          <p className="text-[15px] text-accent-brand mb-3">Программа</p>
          <h2
            className="font-bold uppercase text-text-base"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: '88%', letterSpacing: '-0.035em' }}
          >
            {heading}
          </h2>
          <p className="mt-4 text-[16px] md:text-[20px] font-light leading-relaxed text-text-muted">
            {subtitle}
          </p>
        </div>

        {/* ── Bento grid ────────────────────────────────── */}
        <div className="prog-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.04fr 1.05fr',
          gridTemplateRows: '240px 60px 240px',
          gap: GAP,
        }}>

          {/* 01 — Ответственная власть | person-suit | red left, rows 1+2 */}
          <article className="prog-card-1 relative transition-transform duration-300 hover:-translate-y-1"
            style={{ gridColumn:'1/2', gridRow:'1/3', borderRadius:0, overflow:'hidden', background:'linear-gradient(135deg,#db1f26 0%,#c81721 100%)' }}>
            <Diamond />
            <img src="/images/person-suit.webp" alt="" loading="eager"
              className="absolute z-[3] select-none pointer-events-none"
              style={{ right:0, bottom:0, width:'58%', height:'86%', objectFit:'contain', objectPosition:'center bottom' }} />
            <div className="prog-text absolute z-[4] left-6 bottom-6" style={{ maxWidth:'52%' }}>
              <h3 className="font-bold text-white leading-[90%]" style={{ fontSize:'clamp(22px,1.9vw,30px)', letterSpacing:'-0.03em' }}>
                Ответственная власть
              </h3>
              <p className="mt-3 text-[13px] leading-[138%]" style={{ color:'rgba(255,255,255,0.88)' }}>
                Законы должны работать, обещания — выполняться, а решения власти — быть понятными, открытыми и полезными для людей.
              </p>
              <Cta />
            </div>
          </article>

          {/* 02 — Казахстан справедливых возможностей | person-athlete | white top center */}
          <article className="prog-card-2 relative transition-transform duration-300 hover:-translate-y-1"
            style={{ gridColumn:'2/3', gridRow:'1/2', borderRadius:0, overflow:'hidden', background:'#ffffff' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ borderRadius:'inherit',
              background:'linear-gradient(135deg, transparent 56%, #1FA7FF 56%)' }} />
            <img src="/images/person-athlete.webp" alt="" loading="eager"
              className="absolute z-[3] select-none pointer-events-none"
              style={{ right:0, bottom:0, width:'62%', height:'100%', objectFit:'contain', objectPosition:'center bottom' }} />
            <div className="prog-text relative z-[4] p-6" style={{ maxWidth:'48%' }}>
              <h3 className="font-bold leading-[90%]" style={{ fontSize:'clamp(18px,1.6vw,24px)', letterSpacing:'-0.03em', color:'#000001' }}>
                Казахстан справедливых возможностей
              </h3>
              <p className="mt-3 text-[12px] leading-[138%]" style={{ color:'rgba(0,0,0,0.68)' }}>
                Страна, где успех зависит от труда, знаний и ответственности, а не от связей, должности или места рождения.
              </p>
              <Cta dark />
            </div>
          </article>

          {/* 03 — Экономика для людей | person-speaker | red right, rows 1+2 */}
          <article className="prog-card-3 relative transition-transform duration-300 hover:-translate-y-1"
            style={{ gridColumn:'3/4', gridRow:'1/3', borderRadius:0, overflow:'hidden', background:'linear-gradient(135deg,#db1f26 0%,#b9141d 100%)' }}>
            <Diamond />
            <img src="/images/person-speaker.webp" alt="" loading="eager"
              className="absolute z-[3] select-none pointer-events-none"
              style={{ right:0, bottom:0, width:'70%', height:'98%', objectFit:'contain', objectPosition:'center bottom' }} />
            <div className="prog-text absolute z-[4] left-6 bottom-6" style={{ maxWidth:'54%' }}>
              <h3 className="font-bold text-white leading-[90%]" style={{ fontSize:'clamp(22px,1.9vw,30px)', letterSpacing:'-0.03em' }}>
                Экономика для людей
              </h3>
              <p className="mt-3 text-[13px] leading-[138%]" style={{ color:'rgba(255,255,255,0.88)' }}>
                Рост экономики должен ощущаться в жизни каждой семьи: в доходах, жилье, рабочих местах и уверенности в будущем.
              </p>
              <Cta />
            </div>
          </article>

          {/* 04 — Здоровье, семья и дети | 08_QARLYGASH | white bottom left */}
          <article className="prog-card-4 relative transition-transform duration-300 hover:-translate-y-1"
            style={{ gridColumn:'1/2', gridRow:'3/4', borderRadius:0, overflow:'hidden', background:'#ffffff' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ borderRadius:'inherit',
              background:'linear-gradient(135deg, transparent 68%, rgba(31,167,255,0.9) 68%)' }} />
            <img src="/images/08_QARLYGASH.webp" alt="" loading="lazy"
              className="absolute z-[3] select-none pointer-events-none"
              style={{ right:0, bottom:0, width:'50%', height:'100%', objectFit:'contain', objectPosition:'center bottom' }} />
            <div className="prog-text relative z-[4] p-6" style={{ maxWidth:'56%' }}>
              <h3 className="font-bold leading-[90%]" style={{ fontSize:'clamp(18px,1.6vw,24px)', letterSpacing:'-0.03em', color:'#000001' }}>
                Здоровье, семья и дети
              </h3>
              <p className="mt-3 text-[12px] leading-[138%]" style={{ color:'rgba(0,0,0,0.68)' }}>
                Сильная страна начинается со здоровых людей, крепких семей и равных возможностей для каждого ребенка.
              </p>
              <Cta dark />
            </div>
          </article>

          {/* 05 — Человек труда | 10_SHOKAN | red center, rows 2+3 */}
          <article className="prog-card-5 relative transition-transform duration-300 hover:-translate-y-1"
            style={{ gridColumn:'2/3', gridRow:'2/4', borderRadius:0, overflow:'hidden',
              background:`radial-gradient(circle at 86% 68%, #FFB000 0%, #FFB000 22%, transparent 23%),
                linear-gradient(135deg,#db1f26 0%,#c81721 100%)` }}>
            <Diamond />
            <img src="/images/10_SHOKAN.webp" alt="" loading="lazy"
              className="absolute z-[3] select-none pointer-events-none"
              style={{ right:-4, bottom:0, width:'64%', height:'96%', objectFit:'contain', objectPosition:'center bottom' }} />
            <div className="prog-text relative z-[4] p-6" style={{ maxWidth:'52%' }}>
              <h3 className="font-bold text-white leading-[90%]" style={{ fontSize:'clamp(20px,1.8vw,28px)', letterSpacing:'-0.03em' }}>
                Человек труда
              </h3>
              <p className="mt-3 text-[13px] leading-[138%]" style={{ color:'rgba(255,255,255,0.88)' }}>
                Рабочие, учителя, врачи, инженеры, фермеры и предприниматели создают настоящее и будущее страны. Их труд должен давать достойную жизнь.
              </p>
              <Cta />
            </div>
          </article>

          {/* 06 — Полная программа НПК | 07_ISLAM | dark bottom right */}
          <article className="prog-card-6 relative transition-all duration-300 hover:-translate-y-1 group"
            style={{ gridColumn:'3/4', gridRow:'3/4', borderRadius:0, overflow:'hidden', padding:24,
              background:'linear-gradient(135deg,#111111 0%,#000001 100%)',
              border:'1px solid rgba(255,255,255,0.14)' }}>
            <div className="absolute inset-0 pointer-events-none group-hover:border-[#db1f26]/60 transition-colors" style={{ borderRadius:'inherit',
              background:`linear-gradient(135deg, rgba(219,31,38,0.28) 0%, transparent 44%),
                linear-gradient(315deg, rgba(255,255,255,0.07) 0%, transparent 40%)` }} />
            <img src="/images/07_ISLAM.webp" alt="" loading="lazy"
              className="absolute z-[2] select-none pointer-events-none"
              style={{ right:-8, bottom:0, width:'62%', height:'92%', objectFit:'contain', objectPosition:'center bottom',
                WebkitMaskImage:'radial-gradient(ellipse 80% 85% at 55% 55%, black 55%, transparent 100%)',
                maskImage:'radial-gradient(ellipse 80% 85% at 55% 55%, black 55%, transparent 100%)' }} />
            <div className="prog-text relative z-[4]" style={{ maxWidth:'52%' }}>
              <h3 className="font-bold text-white leading-[90%]" style={{ fontSize:'clamp(18px,1.6vw,24px)', letterSpacing:'-0.03em' }}>
                Полная программа НПК
              </h3>
              <p className="mt-3 text-[12px] leading-[138%]" style={{ color:'rgba(255,255,255,0.72)' }}>
                На главной — ключевые акценты. В полной программе — все предложения партии: от регионов и образования до технологий, жилья и народного государства.
              </p>
              <Link to="/programma" className="prog-cta inline-flex items-center gap-2 font-bold text-white hover:bg-[#b9141d] transition-colors"
                style={{ marginTop:18, background:'#db1f26', padding:'10px 16px', borderRadius:0, fontSize:13, textDecoration:'none' }}>
                Читать программу →
              </Link>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}

function Diamond() {
  return (
    <div className="absolute z-[1] pointer-events-none" style={{ left:-60, top:80, opacity:0.13 }}>
      <div style={{ width:180, height:180, border:'24px solid rgba(255,255,255,0.35)', transform:'rotate(45deg)' }} />
    </div>
  );
}

function Cta({ dark = false }: { dark?: boolean }) {
  return (
    <a href="#" className="prog-cta inline-flex items-center gap-3 mt-4 font-bold text-[14px] transition-all hover:gap-4"
      style={{ color: dark ? '#db1f26' : 'white', textDecoration:'none' }}>
      Читать →
    </a>
  );
}
