import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ScrollReveal';
import './AboutPage.css';

const features = [
  { icon: '👷', title: 'Трудящиеся', desc: 'Рабочие, бюджетники, предприниматели' },
  { icon: '👨‍👩‍👧', title: 'Семьи', desc: 'Многодетные семьи, пенсионеры, люди с инвалидностью' },
  { icon: '🎓', title: 'Молодежь', desc: 'Студенты, молодые специалисты, безработные' },
  { icon: '🤝', title: 'Все граждане', desc: 'Все, кто стремится к социальной справедливости' },
];

const areas = [
  {
    title: 'Политическая сфера',
    icon: '🏛️',
    variant: 'red' as const,
    items: [
      'Борьба за демократизацию государства и общества',
      'Приход к власти через демократические выборы',
      'Обеспечение подлинного народовластия',
      'Пресечение коррупции',
      'Формирование новой системы взаимоотношений государства и общества',
    ],
  },
  {
    title: 'Экономическая сфера',
    icon: '📈',
    variant: 'dark' as const,
    items: [
      'Преодоление сырьевой направленности в экономике',
      'Развитие реальных секторов производства',
      'Национализация базовых отраслей экономики',
      'Возвращение государству активов олигархата',
      'Внедрение современных технологий в промышленности и сельском хозяйстве',
    ],
  },
  {
    title: 'Социальная сфера',
    icon: '🏥',
    variant: 'red' as const,
    items: [
      'Установление и расширение социальных гарантий',
      'Борьба с бедностью',
      'Социальная справедливость в налогообложении',
      'Реформа пенсионной системы',
      'Обеспечение доступности образования и здравоохранения',
    ],
  },
  {
    title: 'Международные отношения',
    icon: '🌍',
    variant: 'dark' as const,
    items: [
      'Поддержка интеграционных процессов со странами СНГ',
      'Сотрудничество в рамках международных экономических организаций',
      'Помощь социально-уязвимым категориям населения',
      'Развитие межпартийного сотрудничества с социалистическими партиями',
    ],
  },
];

export function AboutPage() {
  return (
    <div className="npo">

      {/* ===== HERO: split layout ===== */}
      <section className="npo-hero">
        <div className="npo-hero__content">
          <div className="npo-hero__label">О партии</div>
          <h1 className="npo-hero__title">
            НАРОД!{' '}<br/>
            <span className="npo-hero__title--red">ЗЕМЛЯ!</span>{' '}<br/>
            СПРАВЕДЛИВОСТЬ!
          </h1>
          <p className="npo-hero__text">
            Общественное объединение Народная партия Казахстана — добровольное объединение граждан,
            приверженцев социалистической идеологии и левых идей.
            Деятельность партии направлена на создание «скандинавского» социализма
            с казахстанской спецификой.
          </p>
          <Link to="/vstupit" className="npo-hero__cta">
            Вступить в партию →
          </Link>
        </div>

        <div className="npo-hero__visual">
          <div className="npo-hero__img">
            <img src="/images/about-hero.jpg" alt="Народная партия Казахстана" />
            <div className="npo-hero__badge">
              <span className="npo-hero__badge-num">20+</span>
              <span className="npo-hero__badge-label">лет<br/>истории</span>
            </div>
          </div>
          <div className="npo-hero__stats">
            <div className="npo-hero__stat npo-hero__stat--red">
              <span>
                <div className="npo-hero__stat-num">20</div>
                <div className="npo-hero__stat-label">филиалов по стране</div>
              </span>
              <Link to="/filialy" className="npo-hero__stat-link">Узнать больше →</Link>
            </div>
            <div className="npo-hero__stat npo-hero__stat--dark">
              <span>
                <div className="npo-hero__stat-num">13</div>
                <div className="npo-hero__stat-label">кандидатов 2026</div>
              </span>
              <Link to="/kandidaty" className="npo-hero__stat-link">Кандидаты →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="npo-ticker">
        <div className="npo-ticker__track">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="npo-ticker__item">
              <span className="npo-ticker__dot" />МЫ ЗА НОВЫЙ СПРАВЕДЛИВЫЙ КАЗАХСТАН!
              <span className="npo-ticker__dot" />ПРИХОДИ К НАМ, ЕСЛИ СЧИТАЕШЬ ТАКЖЕ!
              <span className="npo-ticker__dot" />ИЗМЕНИМ ГОСУДАРСТВЕННУЮ СИСТЕМУ ЕСТЕСТВЕННЫМ ПУТЕМ!
              <span className="npo-ticker__dot" />МЫ ОТКРЫТЫ ДЛЯ ВСЕХ!
            </span>
          ))}
        </div>
      </div>

      {/* ===== С КЕМ МЫ ===== */}
      <section className="npo-section">
        <ScrollReveal>
          <div className="npo-section__header">
            <span className="npo-section__eyebrow">Сообщество</span>
            <h2 className="npo-section__title">
              С кем мы и кто выступает в наших рядах
            </h2>
          </div>
        </ScrollReveal>

        <div className="npo-features">
          <div className="npo-features__list">
            <ScrollReveal>
              <p className="npo-section__text" style={{ marginBottom: 24 }}>
                НПК выражает политическую волю многочисленного среднего класса нашей республики
                и представителей социально-уязвимых категорий населения. С нами трудящиеся и безработные,
                пенсионеры и молодежь, бюджетники и предприниматели, многодетные семьи и люди с инвалидностью.
                Словом, все те, кто стремится к социальной справедливости, к политическому и гендерному равенству,
                к правовой защите и развитию гражданского общества.
              </p>
            </ScrollReveal>

            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="npo-feature">
                  <div className="npo-feature__icon">{f.icon}</div>
                  <div>
                    <h4 className="npo-feature__title">{f.title}</h4>
                    <p className="npo-feature__desc">{f.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            <ScrollReveal>
              <p style={{
                fontSize: 18, fontWeight: 700, color: '#db1f26',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 16,
              }}>
                Приходи к нам, если считаешь также!
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.2}>
            <div className="npo-features__img">
              <img src="/images/about-people.jpg" alt="Народ Казахстана" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== МЕТОДЫ ПАРТИИ ===== */}
      <section className="npo-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <ScrollReveal>
          <div className="npo-section__header">
            <span className="npo-section__eyebrow">Деятельность</span>
            <h2 className="npo-section__title">Методы партии</h2>
            <p className="npo-section__text">
              Представители НПК принимают самое активное участие в политических процессах, происходящих в Казахстане.
              Наши партийцы трудятся в представительных и исполнительных органах государственной власти,
              избираются в органы местного самоуправления, на должности акимов и в состав Парламента,
              чтобы продвигать партийные инициативы, направленные на отстаивание интересов народа
              и построение гуманного, цивилизованного социально-ориентированного общества.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="npo-bento2">
            <div className="npo-bento2__img npo-bento2__img--tall">
              <img src="/images/about-parliament.jpg" alt="Парламент" />
            </div>
            <div className="npo-bento2__card npo-bento2__card--red">
              <h3 className="npo-bento2__title">Политическая фракция</h3>
              <p className="npo-bento2__text">
                Депутаты НПК в Мажилисе Парламента РК активно работают над законодательными инициативами
                в социальной сфере. Направлены десятки депутатских запросов.
              </p>
              <Link to="/frakciya" className="npo-bento2__cta npo-bento2__cta--white">
                Состав фракции →
              </Link>
            </div>
            <div className="npo-bento2__card npo-bento2__card--dark">
              <h3 className="npo-bento2__title">Местное самоуправление</h3>
              <p className="npo-bento2__text">
                Партийцы избираются в маслихаты и на должности акимов всех уровней,
                продвигая инициативы на местах.
              </p>
              <Link to="/filialy" className="npo-bento2__cta npo-bento2__cta--red">
                Наши филиалы →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== СТРУКТУРА ПАРТИИ ===== */}
      <section className="npo-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <ScrollReveal>
          <div className="npo-section__header">
            <span className="npo-section__eyebrow">Организация</span>
            <h2 className="npo-section__title">Структура партии</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="npo-bento2">
            <div className="npo-bento2__card npo-bento2__card--dark">
              <h3 className="npo-bento2__title">Филиалы во всех регионах</h3>
              <p className="npo-bento2__text">
                Деятельность НПК осуществляется на всей территории Республики Казахстан.
                Во всех областях, а также в мегаполисах, функционируют партийные филиалы,
                представительства и первичные парторганизации (ячейки).
              </p>
              <Link to="/filialy" className="npo-bento2__cta npo-bento2__cta--red">
                Карта филиалов →
              </Link>
            </div>
            <div className="npo-bento2__img">
              <img src="/images/about-astana.jpg" alt="Астана" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="npo-goal" style={{ marginTop: 16 }}>
            <h3 className="npo-goal__title" style={{ fontSize: 'clamp(20px,3vw,28px)' }}>
              Мы открыты для сотрудничества
            </h3>
            <p className="npo-goal__text">
              НПК готова к сотрудничеству со всеми (в том числе и международными) общественными,
              политическими, гражданскими и другими объединениями, стоящими на позициях демократии,
              социальной справедливости, гендерного равенства и правового регулирования.
            </p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#db1f26', letterSpacing: '-0.02em' }}>
              МЫ ОТКРЫТЫ ДЛЯ ВСЕХ!
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== НАША ЦЕЛЬ — SPLIT LAYOUT ===== */}
      <section className="npo-goal-split" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <ScrollReveal>
          <div className="npo-goal-split__inner">
            <div className="npo-goal-split__content">
              <span className="npo-goal-split__eyebrow">Миссия</span>
              <h2 className="npo-goal-split__title">
                Наша цель —<br />
                общество<br />
                <span style={{ color: '#db1f26' }}>подлинного</span><br />
                народовластия
              </h2>
              <p className="npo-goal-split__text">
                Целью деятельности НПК является движение к обществу социальной справедливости,
                широкой духовности, свободы и процветающей экономики на базе научно-технического прогресса.
                Центром такого общества должен стать человек, наделенный полнотой гражданских прав
                и имеющий широкие возможности для самореализации.
              </p>
              <p className="npo-goal-split__text">
                Наша задача — построить мирным гражданским путем сильное, жизнеспособное,
                светское, правовое и социальное государство, высшей ценностью которого является
                жизнь каждого казахстанца, его права и свободы.
              </p>
              <Link to="/vstupit" className="npo-goal-split__cta">
                Вступить в партию →
              </Link>
            </div>
            <div className="npo-goal-split__img">
              <img src="/images/about-goal.jpg" alt="Единство народа" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== НАПРАВЛЕНИЯ РАБОТЫ ===== */}
      <section className="npo-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <ScrollReveal>
          <div className="npo-section__header" style={{ textAlign: 'center' }}>
            <span className="npo-section__eyebrow">Программа</span>
            <h2 className="npo-section__title" style={{ margin: '0 auto' }}>
              Основные направления работы НПК
            </h2>
          </div>
        </ScrollReveal>

        <div className="npo-areas">
          {areas.map((a, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className={`npo-area npo-area--${a.variant}`}>
                <div className="npo-area__icon">{a.icon}</div>
                <h3 className="npo-area__title">{a.title}</h3>
                <ul className="npo-area__list">
                  {a.items.map((item, j) => (
                    <li key={j} className="npo-area__item">
                      <span className="npo-area__bullet" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="npo-final">
        <ScrollReveal>
          <div className="npo-final__inner">
            <h2 className="npo-final__title">Мы за новый справедливый Казахстан!</h2>
            <p className="npo-final__text">
              Приходи к нам, если считаешь также! Вместе мы построим страну справедливых возможностей.
            </p>
            <Link to="/vstupit" className="npo-goal__cta">
              Вступить в партию →
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
