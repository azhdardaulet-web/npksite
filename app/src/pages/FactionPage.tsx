import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IdCard, GraduationCap, Anchor, Flame, Siren, Accessibility, Hospital } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import './FactionPage.css';

/* ===== COUNT-UP HOOK ===== */
function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, value };
}

function StatCard({ num, label, suffix = '', prefix = '', delay = 0 }: {
  num: number; label: string; suffix?: string; prefix?: string; delay?: number;
}) {
  const { ref, value } = useCountUp(num, 2000 + delay);
  return (
    <div className="npf-num npf-num--dark">
      <div className="npf-num__value" ref={ref}>
        {prefix}{value.toLocaleString('ru-RU')}{suffix}
      </div>
      <div className="npf-num__label">{label}</div>
    </div>
  );
}

const achievements = [
  { icon: IdCard, text: 'Снижение цен на оформление детских паспортов в 2 раза', highlight: true },
  { icon: GraduationCap, text: 'Возможность повышения стипендий студентам колледжей', highlight: false },
  { icon: Anchor, text: 'Сохранение единственного судоремонтного предприятия в Павлодарской области', highlight: true },
  { icon: Flame, text: 'Введение пожарного контроля при приёме в эксплуатацию зданий с массовым пребыванием людей', highlight: false },
  { icon: Siren, text: 'Повышение социального статуса сотрудников МЧС', highlight: false },
  { icon: Accessibility, text: 'Освобождение родителей детей с ограниченными возможностями от грантовой отработки', highlight: true },
  { icon: Hospital, text: 'Разработка и внедрение детского паллиативного стандарта', highlight: false },
];

export function FactionPage() {
  return (
    <div className="npf">

      {/* ===== BREADCRUMBS ===== */}
      <div className="npf-crumbs">
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>Фракция</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ===== HERO ===== */}
      <section className="npf-hero">
        <div className="npf-hero__content">
          <div className="npf-hero__label">Фракция НПК</div>
          <h1 className="npf-hero__title">
            Парламентская<br />
            <span className="npf-hero__title--red">фракция НПК</span>
          </h1>
          <p className="npf-hero__text">
            Народная партия Казахстана пользуется доверием граждан страны.
            На всенародных выборах кандидаты от НПК были избраны в Мажилис Парламента РК,
            где создали собственную партийную фракцию.
          </p>
        </div>

        <div className="npf-hero__visual">
          <div className="npf-hero__img">
            <img src="/images/faction/faction-hero.jpg" alt="Мажилис Парламента РК" />
            <div className="npf-hero__badge">
              <span className="npf-hero__badge-num">8</span>
              <span className="npf-hero__badge-label">созыв<br/>Мажилиса</span>
            </div>
          </div>
          <div className="npf-hero__stats">
            <div className="npf-hero__stat npf-hero__stat--red">
              <span>
                <div className="npf-hero__stat-num">7</div>
                <div className="npf-hero__stat-label">законопроектов инициировано</div>
              </span>
            </div>
            <div className="npf-hero__stat npf-hero__stat--dark">
              <span>
                <div className="npf-hero__stat-num">154+</div>
                <div className="npf-hero__stat-label">депутатских запросов</div>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="npf-ticker">
        <div className="npf-ticker__track">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="npf-ticker__item">
              <span className="npf-ticker__dot" />ФРАКЦИЯ НПК В МАЖИЛИСЕ
              <span className="npf-ticker__dot" />7 ЗАКОНОПРОЕКТОВ
              <span className="npf-ticker__dot" />3217+ ПОПРАВОК
              <span className="npf-ticker__dot" />154+ ДЕПУТАТСКИХ ЗАПРОСОВ
              <span className="npf-ticker__dot" />НПК ОПРАВДЫВАЕТ ОЖИДАНИЯ НАРОДА!
            </span>
          ))}
        </div>
      </div>

      {/* ===== BIG NUMBERS ===== */}
      <section className="npf-numbers">
        <ScrollReveal>
          <div className="npf-numbers__header">
            <span className="npf-numbers__eyebrow">Деятельность</span>
            <h2 className="npf-numbers__title">
              Цифры, которые говорят сами за себя
            </h2>
          </div>
        </ScrollReveal>

        <div className="npf-numbers__grid">
          <ScrollReveal delay={0}>
            <div className="npf-num npf-num--red">
              <div className="npf-num__value">7</div>
              <div className="npf-num__label">законопроектов инициировано</div>
            </div>
          </ScrollReveal>

          <StatCard num={3217} label="законодательных поправок" suffix="+" delay={0} />
          <StatCard num={154} label="депутатских запросов" suffix="+" delay={200} />

          <ScrollReveal delay={300}>
            <div className="npf-num npf-num--red">
              <div className="npf-num__value">8</div>
              <div className="npf-num__label">созыв Мажилиса</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="npf-section" style={{ borderTop: '1px solid var(--line)' }}>
        <ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <span className="npf-section__eyebrow">Миссия</span>
              <h2 className="npf-section__title">
                Законотворческая<br />
                <span style={{ color: '#db1f26' }}>деятельность</span>
              </h2>
            </div>
            <div>
              <p className="npf-section__text">
                Законотворческая деятельность фракции направлена на реформирование
                государственной системы и восстановление социальной справедливости
                в нашем обществе.
              </p>
              <p className="npf-section__text" style={{ marginTop: 16 }}>
                Благодаря поддержке избирателей, наши народные депутаты получили возможность
                озвучивать проблемы и требования казахстанцев с парламентских трибун,
                параллельно предлагая пути решения, оказывать реальное влияние на внешнюю
                и внутреннюю политику в Казахстане и принимать активное участие в формировании
                отечественного законодательства.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== ACHIEVEMENTS ===== */}
      <section className="npf-section" style={{ borderTop: '1px solid var(--line)' }}>
        <ScrollReveal>
          <div className="npf-section__header">
            <span className="npf-section__eyebrow">Достижения</span>
            <h2 className="npf-section__title">
              Чего добилась фракция НПК
            </h2>
            <p className="npf-section__text">
              На текущий момент работы 8 созыва депутаты парламентской фракции НПК добились конкретных результатов:
            </p>
          </div>
        </ScrollReveal>

        <div className="npf-achieve">
          {achievements.map((a, i) => (
            <ScrollReveal
              key={i}
              delay={i * 0.08}
              className={`npf-achieve__item npf-achieve__item--${i + 1}`}
            >
              <div className={`npf-achieve__card ${a.highlight ? 'npf-achieve__card--red' : 'npf-achieve__card--dark'}`}>
                <div className="npf-achieve__icon"><a.icon size={22} strokeWidth={1.75} /></div>
                <p className="npf-achieve__text">{a.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="npf-cta">
        <ScrollReveal>
          <div className="npf-cta__inner">
            <h2 className="npf-cta__title">
              НПК <span style={{ color: '#db1f26' }}>оправдает</span><br />
              ожидания народа!
            </h2>
            <p className="npf-cta__text">
              Народные депутаты НПК продолжают работу на благо каждого казахстанца.
              Присоединяйтесь к нам — вместе мы построим Справедливый Казахстан.
            </p>
            <Link to="/vstupit" className="npf-cta__btn">
              Вступить в партию →
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
