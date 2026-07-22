import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  Globe2,
  HandHeart,
  Landmark,
  Megaphone,
  Network,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import mapKzUrl from '../../../content/mapkz.svg?url';
import heroImageUrl from '../../../content/Фото/6a4d08e95b1ac826833650.jpg?url';
import missionImageUrl from '../../../content/Фото/6a4d08ed2c632386994614.jpeg?url';
import './AboutPage.css';

interface HeroBlock {
  titleRu?: string;
  subtitleRu?: string;
  imageUrl?: string;
  ctaLabelRu?: string;
  ctaHref?: string;
}

interface TextImageBlock {
  headingRu?: string;
  textRu?: string;
  imageUrl?: string;
}

const principles = [
  {
    icon: Scale,
    title: 'Социальная справедливость',
    text: 'Достойная жизнь, равные возможности и защита прав каждого.',
  },
  {
    icon: Landmark,
    title: 'Народовластие',
    text: 'Реальное участие граждан в принятии государственных решений.',
  },
  {
    icon: Megaphone,
    title: 'Гражданская активность',
    text: 'Сильное общество начинается с неравнодушных людей.',
  },
];

const communityGroups = [
  { label: 'Трудящиеся', position: '0% 0%' },
  { label: 'Безработные', position: '33.333% 0%' },
  { label: 'Пенсионеры', position: '66.667% 0%' },
  { label: 'Молодёжь', position: '100% 0%' },
  { label: 'Бюджетники', position: '0% 100%' },
  { label: 'Предприниматели', position: '33.333% 100%' },
  { label: 'Многодетные семьи', position: '66.667% 100%' },
  { label: 'Люди с инвалидностью', position: '100% 100%' },
];

const cooperation = [
  { icon: Users, title: 'Общественные объединения' },
  { icon: Network, title: 'Политические организации' },
  { icon: HandHeart, title: 'Гражданские инициативы' },
  { icon: Globe2, title: 'Международное сотрудничество' },
];

const workAreas = [
  {
    icon: Landmark,
    eyebrow: '01',
    title: 'В политической сфере',
    items: [
      'Борьба за демократизацию государства и общества',
      'Приход к власти через демократические выборы и другие электоральные процессы',
      'Построение общества социальной справедливости при поддержке государственных структур',
      'Обеспечение подлинного народовластия в Республике Казахстан',
      'Признание форм собственности, исключающих эксплуатацию человека',
      'Правовая защита граждан и пресечение коррупции',
      'Новая взаимовыгодная система отношений между государством и обществом',
    ],
  },
  {
    icon: CircleDollarSign,
    eyebrow: '02',
    title: 'В экономической сфере',
    items: [
      'Преодоление сырьевой направленности экономики республики',
      'Развитие реальных секторов производства',
      'Национализация и восстановление государственной собственности в базовых отраслях',
      'Пересмотр незаконной приватизации и возвращение неправомерно присвоенных активов',
      'Монетарная политика, направленная на стабильность отечественной валюты',
      'Внедрение современных технологий в промышленности и сельском хозяйстве',
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: '03',
    title: 'В социальной сфере',
    items: [
      'Расширение социальных гарантий с учётом экономического потенциала страны',
      'Реформа поддержки социально уязвимых категорий с фокусом на практический результат',
      'Борьба с бедностью',
      'Социальная справедливость в системе налогообложения',
      'Банковская политика, защищающая права кредиторов и заёмщиков',
      'Кардинальное реформирование пенсионной системы',
      'Обеспечение доступности образования и здравоохранения',
    ],
  },
  {
    icon: Globe2,
    eyebrow: '04',
    title: 'В международных отношениях',
    items: [
      'Поддержка интеграционных процессов Казахстана со странами СНГ',
      'Сотрудничество в международных экономических организациях и организациях по безопасности в Центральной Азии',
      'Помощь социально уязвимым категориям и ратификация необходимых международных документов',
      'Межпартийное сотрудничество с зарубежными партиями социалистической идеологии',
    ],
  },
];

export function AboutPage() {
  const { getBlock } = usePageBlocks('about');

  const hero = getBlock<HeroBlock>('about_hero');
  const heroTitle = hero?.titleRu?.trim() || 'Народ! Земля! Справедливость!';
  const heroText = hero?.subtitleRu?.trim() || 'Общественное объединение Народная партия Казахстана — добровольное объединение граждан Республики Казахстан, приверженцев социалистической идеологии и левых идей. Деятельность партии направлена на создание и развитие в стране «скандинавского» социализма с казахстанской спецификой путём эволюционного прогресса общественного сознания и последующей трансформации государственных структур.';
  const heroImage = hero?.imageUrl?.trim() || heroImageUrl;
  const heroCtaLabel = hero?.ctaLabelRu?.trim() || 'Вступить в партию';
  const heroCtaHref = hero?.ctaHref?.trim() || '/vstupit';

  const community = getBlock<TextImageBlock>('about_community');
  const communityHeading = community?.headingRu?.trim() || 'С кем мы и кто выступает в наших рядах';
  const communityText = community?.textRu?.trim() || 'НПК выражает политическую волю многочисленного среднего класса нашей республики и представителей социально уязвимых категорий населения. С нами трудящиеся и безработные, пенсионеры и молодёжь, бюджетники и предприниматели, многодетные семьи и люди с инвалидностью. Словом, все те, кто стремится к социальной справедливости, политическому и гендерному равенству, правовой защите и развитию гражданского общества.';

  const methods = getBlock<TextImageBlock>('about_methods');
  const methodsHeading = methods?.headingRu?.trim() || 'Методы партии';
  const methodsText = methods?.textRu?.trim() || 'Представители НПК принимают самое активное участие в политических процессах, происходящих в Казахстане. Наши партийцы трудятся в представительных и исполнительных органах государственной власти, избираются в органы местного самоуправления, на должности акимов и в состав Парламента, чтобы продвигать партийные инициативы, направленные на отстаивание интересов народа и построение гуманного, цивилизованного социально ориентированного общества.';
  const methodsImage = methods?.imageUrl?.trim() || '/images/faction/faction-hero.jpg';

  const structure = getBlock<TextImageBlock>('about_structure');
  const structureHeading = structure?.headingRu?.trim() || 'Структура партии';
  const structureText = structure?.textRu?.trim() || 'Деятельность НПК, в соответствии с требованиями Конституции, Закона «О политических партиях» и иных нормативно-правовых актов, осуществляется на всей территории Республики Казахстан. Во всех областях, а также в мегаполисах, функционируют партийные филиалы, представительства и первичные партийные организации.';

  const goal = getBlock<TextImageBlock>('about_goal');
  const goalHeading = goal?.headingRu?.trim() || 'Наша цель — общество подлинного народовластия';
  const goalText = goal?.textRu?.trim() || 'Целью деятельности НПК является движение к обществу подлинного народовластия, социальной справедливости, широкой духовности, свободы и процветающей экономики на базе научно-технического прогресса. Центром такого общества должен стать человек, наделённый полнотой гражданских прав и имеющий широкие возможности для самореализации, развития и проявления своих способностей и удовлетворения многообразных потребностей.\n\nНаша задача — построить мирным гражданским путём, на существующем фундаменте независимой республики, сильное, жизнеспособное, светское, правовое и социальное государство, высшей ценностью которого является жизнь каждого казахстанца, его права и свободы, как это заложено в нормах Конституции РК.';
  const goalParagraphs = goalText.split(/\n\s*\n/).filter(Boolean);
  const goalImage = goal?.imageUrl?.trim() || missionImageUrl;

  return (
    <div className="about-editorial">
      <section className="about-editorial__hero about-shell">
        <ScrollReveal>
          <div className="about-editorial__hero-copy">
            <span className="about-kicker">О партии</span>
            <h1>{heroTitle}</h1>
            <p>{heroText}</p>
            <div className="about-editorial__actions">
              <Link to={heroCtaHref} className="about-button about-button--primary">
                {heroCtaLabel}<ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/programma" className="about-button about-button--text">
                Программа партии<ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <figure className="about-editorial__hero-media">
            <img src={heroImage} alt="Съезд Народной партии Казахстана" />
            <figcaption>Народная партия Казахстана</figcaption>
          </figure>
        </ScrollReveal>
      </section>

      <section className="about-principles about-shell" aria-label="Принципы партии">
        {principles.map((principle, index) => (
          <ScrollReveal key={principle.title} delay={index * 0.06}>
            <article className="about-principle">
              <principle.icon size={27} strokeWidth={1.6} aria-hidden="true" />
              <div>
                <h2>{principle.title}</h2>
                <p>{principle.text}</p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </section>

      <main className="about-shell about-editorial__body">
        <section className="about-row">
          <ScrollReveal>
            <div className="about-row__intro">
              <span className="about-index">01 / Сообщество</span>
              <h2>{communityHeading}</h2>
            </div>
          </ScrollReveal>
          <div className="about-row__content">
            <ScrollReveal>
              <p className="about-lead">{communityText}</p>
            </ScrollReveal>
            <ScrollReveal>
              <Link to="/vstupit" className="about-statement">
                Приходи к нам, если считаешь так же!<ArrowRight size={20} aria-hidden="true" />
              </Link>
            </ScrollReveal>
            <div className="about-groups" aria-label="Кого объединяет партия">
              {communityGroups.map((group, index) => (
                <ScrollReveal key={group.label} delay={(index % 4) * 0.04}>
                  <div className="about-group">
                    <div
                      className="about-group__photo"
                      style={{ backgroundPosition: group.position }}
                      aria-hidden="true"
                    />
                    <div className="about-group__caption">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{group.label}</strong>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="about-row">
          <ScrollReveal>
            <div className="about-row__intro">
              <span className="about-index">02 / Деятельность</span>
              <h2>{methodsHeading}</h2>
            </div>
          </ScrollReveal>
          <div className="about-row__content">
            <ScrollReveal>
              <p className="about-lead">{methodsText}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="about-methods">
                <figure className="about-methods__media">
                  <img src={methodsImage} alt="Работа фракции НПК" />
                </figure>
                <div className="about-methods__cards">
                  <article>
                    <Landmark size={24} strokeWidth={1.6} aria-hidden="true" />
                    <h3>Политическое участие</h3>
                    <p>Представительство интересов граждан, законодательная работа и решения в интересах народа.</p>
                    <Link to="/frakciya">О фракции<ArrowRight size={15} /></Link>
                  </article>
                  <article>
                    <Building2 size={24} strokeWidth={1.6} aria-hidden="true" />
                    <h3>Работа на местах</h3>
                    <p>Филиалы, маслихаты и общественные приёмные связывают инициативы партии с реальными запросами людей.</p>
                    <Link to="/filialy">Наши филиалы<ArrowRight size={15} /></Link>
                  </article>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <p className="about-callout">Изменим государственную систему эволюционным путём!</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="about-row">
          <ScrollReveal>
            <div className="about-row__intro">
              <span className="about-index">03 / Организация</span>
              <h2>{structureHeading}</h2>
            </div>
          </ScrollReveal>
          <div className="about-row__content">
            <ScrollReveal>
              <p className="about-lead">{structureText}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="about-structure">
                <div className="about-structure__map">
                  <img src={mapKzUrl} alt="Карта филиалов Народной партии Казахстана" />
                </div>
                <ol className="about-structure__levels">
                  <li><span>01</span><strong>Филиалы</strong><p>Региональные отделения во всех областях и городах республиканского значения.</p></li>
                  <li><span>02</span><strong>Представительства</strong><p>Работа партии в районах и крупных населённых пунктах.</p></li>
                  <li><span>03</span><strong>Первичные организации</strong><p>Постоянная работа рядом с людьми — по месту жительства, учёбы и труда.</p></li>
                </ol>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="about-open">
          <ScrollReveal>
            <span className="about-index">04 / Партнёрство</span>
            <h2>Мы открыты для всех</h2>
            <p>НПК готова к сотрудничеству со всеми общественными, политическими, гражданскими и международными объединениями, стоящими на позициях демократии, социальной справедливости, гендерного равенства и правового регулирования.</p>
          </ScrollReveal>
          <div className="about-open__grid">
            {cooperation.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.05}>
                <article>
                  <item.icon size={26} strokeWidth={1.55} aria-hidden="true" />
                  <h3>{item.title}</h3>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      <section className="about-mission">
        <div className="about-shell about-mission__inner">
          <ScrollReveal>
            <div className="about-mission__copy">
              <span className="about-index">05 / Миссия</span>
              <h2>{goalHeading}</h2>
              {goalParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <p className="about-mission__statement">Реформируем страну вместе!</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <figure className="about-mission__media">
              <img src={goalImage} alt="Участники съезда Народной партии Казахстана" />
            </figure>
          </ScrollReveal>
        </div>
      </section>

      <section className="about-shell about-directions">
        <ScrollReveal>
          <div className="about-directions__heading">
            <span className="about-index">06 / Программа</span>
            <h2>Основные направления работы НПК</h2>
          </div>
        </ScrollReveal>
        <div className="about-directions__grid">
          {workAreas.map((area, index) => (
            <ScrollReveal key={area.title} delay={(index % 2) * 0.06}>
              <article className="about-direction">
                <header>
                  <span>{area.eyebrow}</span>
                  <area.icon size={25} strokeWidth={1.55} aria-hidden="true" />
                </header>
                <h3>{area.title}</h3>
                <ul>
                  {area.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="about-shell about-final">
        <ScrollReveal>
          <div className="about-final__inner">
            <div>
              <span>Народная партия Казахстана</span>
              <h2>Мы за новый справедливый Казахстан!</h2>
              <p>Если вы разделяете наши ценности и цели — присоединяйтесь к партии.</p>
            </div>
            <Link to="/vstupit" className="about-button about-button--light">
              Вступить в партию<ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
