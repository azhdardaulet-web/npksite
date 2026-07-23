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
import { useLanguage } from '@/i18n/LanguageContext';
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

const principlesKz = [
  { icon: Scale, title: 'Әлеуметтік әділдік', text: 'Лайықты өмір, тең мүмкіндіктер және әр адамның құқығын қорғау.' },
  { icon: Landmark, title: 'Халық билігі', text: 'Азаматтардың мемлекеттік шешімдер қабылдауға нақты қатысуы.' },
  { icon: Megaphone, title: 'Азаматтық белсенділік', text: 'Қуатты қоғам бейжай қарамайтын адамдардан басталады.' },
];

const communityGroups = [
  { label: 'Трудящиеся', icon: '/images/about/icons/Трудящиеся.svg' },
  { label: 'Безработные', icon: '/images/about/icons/Безработные.svg' },
  { label: 'Пенсионеры', icon: '/images/about/icons/Пенсионеры.svg' },
  { label: 'Молодёжь', icon: '/images/about/icons/Молодежь.svg' },
  { label: 'Бюджетники', icon: '/images/about/icons/Госслужащие.svg' },
  { label: 'Предприниматели', icon: '/images/about/icons/Предприниматели.svg' },
  { label: 'Многодетные семьи', icon: '/images/about/icons/Семьи.svg' },
  { label: 'Люди с инвалидностью', icon: '/images/about/icons/Инвалиды.svg' },
];

const communityGroupsKz = [
  { label: 'Еңбек адамдары', icon: '/images/about/icons/Трудящиеся.svg' },
  { label: 'Жұмыссыздар', icon: '/images/about/icons/Безработные.svg' },
  { label: 'Зейнеткерлер', icon: '/images/about/icons/Пенсионеры.svg' },
  { label: 'Жастар', icon: '/images/about/icons/Молодежь.svg' },
  { label: 'Бюджет саласының қызметкерлері', icon: '/images/about/icons/Госслужащие.svg' },
  { label: 'Кәсіпкерлер', icon: '/images/about/icons/Предприниматели.svg' },
  { label: 'Көпбалалы отбасылар', icon: '/images/about/icons/Семьи.svg' },
  { label: 'Мүгедектігі бар адамдар', icon: '/images/about/icons/Инвалиды.svg' },
];

const cooperation = [
  { icon: Users, title: 'Общественные объединения' },
  { icon: Network, title: 'Политические организации' },
  { icon: HandHeart, title: 'Гражданские инициативы' },
  { icon: Globe2, title: 'Международное сотрудничество' },
];

const cooperationKz = [
  { icon: Users, title: 'Қоғамдық бірлестіктер' },
  { icon: Network, title: 'Саяси ұйымдар' },
  { icon: HandHeart, title: 'Азаматтық бастамалар' },
  { icon: Globe2, title: 'Халықаралық ынтымақтастық' },
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

const workAreasKz = [
  {
    icon: Landmark, eyebrow: '01', title: 'Саяси салада',
    items: ['Мемлекет пен қоғамды демократияландыру', 'Демократиялық сайлау және басқа да сайлау үдерістері арқылы билікке келу', 'Мемлекеттік құрылымдардың қолдауымен әлеуметтік әділ қоғам құру', 'Қазақстан Республикасында шынайы халық билігін орнықтыру', 'Адамды қанауға жол бермейтін меншік нысандарын мойындау', 'Азаматтардың құқығын қорғап, жемқорлықтың жолын кесу', 'Мемлекет пен қоғам арасындағы өзара тиімді қатынастың жаңа жүйесін қалыптастыру'],
  },
  {
    icon: CircleDollarSign, eyebrow: '02', title: 'Экономикалық салада',
    items: ['Экономиканың шикізатқа тәуелділігін азайту', 'Нақты өндіріс салаларын дамыту', 'Базалық салаларды мемлекет меншігіне қайтарып, мемлекеттік меншікті қалпына келтіру', 'Заңсыз жекешелендіруді қайта қарап, негізсіз иемденілген активтерді қайтару', 'Ұлттық валютаның тұрақтылығын қамтамасыз ететін ақша-несие саясатын жүргізу', 'Өнеркәсіп пен ауыл шаруашылығына заманауи технология енгізу'],
  },
  {
    icon: ShieldCheck, eyebrow: '03', title: 'Әлеуметтік салада',
    items: ['Елдің экономикалық мүмкіндігін ескере отырып, әлеуметтік кепілдіктерді кеңейту', 'Әлеуметтік тұрғыдан осал азаматтарды қолдау жүйесін нақты нәтижеге бағыттап жаңарту', 'Кедейлікпен күресу', 'Әділ салық жүйесін қалыптастыру', 'Несие берушілер мен қарыз алушылардың құқығын қорғайтын банк саясатын жүргізу', 'Зейнетақы жүйесін түбегейлі реформалау', 'Білім мен медициналық көмектің қолжетімділігін қамтамасыз ету'],
  },
  {
    icon: Globe2, eyebrow: '04', title: 'Халықаралық қатынастарда',
    items: ['Қазақстанның ТМД елдерімен ықпалдасу үдерістерін қолдау', 'Халықаралық экономикалық ұйымдармен және Орталық Азиядағы қауіпсіздік ұйымдарымен ынтымақтасу', 'Әлеуметтік тұрғыдан осал азаматтарға көмектесіп, қажетті халықаралық құжаттарды ратификациялау', 'Социалистік бағыттағы шетелдік партиялармен ынтымақтастық орнату'],
  },
];

export function AboutPage() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const { getBlock } = usePageBlocks('about');

  const hero = getBlock<HeroBlock>('about_hero');
  const cmsHeroTitle = hero?.titleRu?.trim();
  const legacyHeroTitles = ['ХАЛЫҚ!\nЖЕР!\nӘДІЛДІК!', 'НАРОД!\nЗЕМЛЯ!\nСПРАВЕДЛИВОСТЬ!', 'Халық! Жер! Әділдік!', 'Народ! Земля! Справедливость!'];
  const heroTitle = cmsHeroTitle && !legacyHeroTitles.includes(cmsHeroTitle)
    ? cmsHeroTitle
    : (isKz ? 'Ел байлығы – халық игілігіне!' : 'Богатство страны на благо народа!');
  const heroText = hero?.subtitleRu?.trim() || (isKz ? '«Қазақстан Халық партиясы» қоғамдық бірлестігі социалистік идеология мен солшыл идеяларды ұстанатын азаматтардың ерікті бірлестігі саналады. Партия қызметі қазақстандық ерекшелікті ескере отырып, «скандинавиялық» социализм құруға бағытталған.' : 'Общественное объединение Народная партия Казахстана — добровольное объединение граждан Республики Казахстан, приверженцев социалистической идеологии и левых идей. Деятельность партии направлена на создание и развитие в стране «скандинавского» социализма с казахстанской спецификой путём эволюционного прогресса общественного сознания и последующей трансформации государственных структур.');
  const heroImage = hero?.imageUrl?.trim() || heroImageUrl;
  const heroCtaLabel = hero?.ctaLabelRu?.trim() || (isKz ? 'Партияға қосылу' : 'Вступить в партию');
  const heroCtaHref = hero?.ctaHref?.trim() || '/vstupit';

  const community = getBlock<TextImageBlock>('about_community');
  const communityHeading = community?.headingRu?.trim() || (isKz ? 'Біз кімнің мүддесін қорғаймыз және қатарымызда кімдер бар?' : 'С кем мы и кто выступает в наших рядах');
  const communityText = community?.textRu?.trim() || (isKz ? 'ҚХП еліміздегі орта тап пен әлеуметтік тұрғыдан осал азаматтардың саяси мүддесін білдіреді. Біздің қатарымызда еңбек адамдары, жұмыссыздар, зейнеткерлер, жастар, бюджет саласының қызметкерлері, кәсіпкерлер, көпбалалы отбасылар және мүгедектігі бар азаматтар бар. Бізді әлеуметтік әділдікке, саяси және гендерлік теңдікке, құқықтық қорғаныс пен азаматтық қоғамды дамытуға ұмтылыс біріктіреді.' : 'НПК выражает политическую волю многочисленного среднего класса нашей республики и представителей социально уязвимых категорий населения. С нами трудящиеся и безработные, пенсионеры и молодёжь, бюджетники и предприниматели, многодетные семьи и люди с инвалидностью. Словом, все те, кто стремится к социальной справедливости, политическому и гендерному равенству, правовой защите и развитию гражданского общества.');

  const methods = getBlock<TextImageBlock>('about_methods');
  const methodsHeading = methods?.headingRu?.trim() || (isKz ? 'Партияның жұмыс тәсілдері' : 'Методы партии');
  const methodsText = methods?.textRu?.trim() || (isKz ? 'ҚХП өкілдері Қазақстандағы саяси үдерістерге белсенді қатысады. Партия мүшелері мемлекеттік биліктің өкілді және атқарушы органдарында еңбек етеді, жергілікті өзін-өзі басқару органдарына, әкім қызметіне және Парламентке сайланады. Олар халықтың мүддесін қорғауға және әлеуметтік бағдарланған қоғам құруға бағытталған партия бастамаларын ілгерілетеді.' : 'Представители НПК принимают самое активное участие в политических процессах, происходящих в Казахстане. Наши партийцы трудятся в представительных и исполнительных органах государственной власти, избираются в органы местного самоуправления, на должности акимов и в состав Парламента, чтобы продвигать партийные инициативы, направленные на отстаивание интересов народа и построение гуманного, цивилизованного социально ориентированного общества.');
  const methodsImage = methods?.imageUrl?.trim() || '/images/faction/faction-hero.jpg';

  const structure = getBlock<TextImageBlock>('about_structure');
  const structureHeading = structure?.headingRu?.trim() || (isKz ? 'Партия құрылымы' : 'Структура партии');
  const structureText = structure?.textRu?.trim() || (isKz ? 'ҚХП Қазақстан Республикасының бүкіл аумағында жұмыс істейді. Барлық облыста және республикалық маңызы бар қалаларда партия филиалдары, өкілдіктері мен бастауыш партия ұйымдары қызмет етеді.' : 'Деятельность НПК, в соответствии с требованиями Конституции, Закона «О политических партиях» и иных нормативно-правовых актов, осуществляется на всей территории Республики Казахстан. Во всех областях, а также в мегаполисах, функционируют партийные филиалы, представительства и первичные партийные организации.');

  const goal = getBlock<TextImageBlock>('about_goal');
  const goalHeading = goal?.headingRu?.trim() || (isKz ? 'Мақсатымыз — халық билігі орнаған қоғам құру' : 'Наша цель — общество подлинного народовластия');
  const goalText = goal?.textRu?.trim() || (isKz ? 'ҚХП әлеуметтік әділдікке, рухани кемелдікке, еркіндікке және ғылыми-техникалық прогреске сүйенген қуатты экономикаға қол жеткізуді көздейді. Мұндай қоғамның өзегінде азаматтық құқықтары толық қорғалған, өзін дамытуға және қабілетін жүзеге асыруға мүмкіндігі бар адам тұруға тиіс.\n\nБіздің міндетіміз — тәуелсіз республиканың берік іргетасына сүйене отырып, бейбіт азаматтық жолмен қуатты, өміршең, зайырлы, құқықтық және әлеуметтік мемлекет құру. Ондағы ең жоғары құндылық әр қазақстандықтың өмірі, құқығы мен бостандығы болуы керек.' : 'Целью деятельности НПК является движение к обществу подлинного народовластия, социальной справедливости, широкой духовности, свободы и процветающей экономики на базе научно-технического прогресса. Центром такого общества должен стать человек, наделённый полнотой гражданских прав и имеющий широкие возможности для самореализации, развития и проявления своих способностей и удовлетворения многообразных потребностей.\n\nНаша задача — построить мирным гражданским путём, на существующем фундаменте независимой республики, сильное, жизнеспособное, светское, правовое и социальное государство, высшей ценностью которого является жизнь каждого казахстанца, его права и свободы, как это заложено в нормах Конституции РК.');
  const visiblePrinciples = isKz ? principlesKz : principles;
  const visibleCommunityGroups = isKz ? communityGroupsKz : communityGroups;
  const visibleCooperation = isKz ? cooperationKz : cooperation;
  const visibleWorkAreas = isKz ? workAreasKz : workAreas;
  const goalParagraphs = goalText.split(/\n\s*\n/).filter(Boolean);
  const goalImage = goal?.imageUrl?.trim() || missionImageUrl;

  return (
    <div className="about-editorial">
      <section className="about-editorial__hero about-shell">
        <ScrollReveal>
          <div className="about-editorial__hero-copy">
            <span className="about-kicker">{isKz ? 'Партия туралы' : 'О партии'}</span>
            <h1>{heroTitle}</h1>
            <p>{heroText}</p>
            <div className="about-editorial__actions">
              <Link to={heroCtaHref} className="about-button about-button--primary">
                {heroCtaLabel}<ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/programma" className="about-button about-button--text">
                {isKz ? 'Партия бағдарламасы' : 'Программа партии'}<ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <figure className="about-editorial__hero-media">
            <img src={heroImage} alt={isKz ? 'Қазақстан Халық партиясының съезі' : 'Съезд Народной партии Казахстана'} />
            <figcaption>{isKz ? 'Қазақстан Халық партиясы' : 'Народная партия Казахстана'}</figcaption>
          </figure>
        </ScrollReveal>
      </section>

      <section className="about-principles about-shell" aria-label="Принципы партии">
        {visiblePrinciples.map((principle, index) => (
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
              <span className="about-index">{isKz ? '01 / Қауымдастық' : '01 / Сообщество'}</span>
              <h2>{communityHeading}</h2>
            </div>
          </ScrollReveal>
          <div className="about-row__content">
            <ScrollReveal>
              <p className="about-lead">{communityText}</p>
            </ScrollReveal>
            <ScrollReveal>
              <Link to="/vstupit" className="about-statement">
                {isKz ? 'Ойымыз ортақ болса, бізге қосылыңыз!' : 'Приходи к нам, если считаешь так же!'}<ArrowRight size={20} aria-hidden="true" />
              </Link>
            </ScrollReveal>
            <div className="about-groups" aria-label={isKz ? 'Партия кімдерді біріктіреді?' : 'Кого объединяет партия'}>
              {visibleCommunityGroups.map((group, index) => (
                <ScrollReveal key={group.label} delay={(index % 4) * 0.04}>
                  <div className="about-group">
                    <div className="about-group__photo" aria-hidden="true">
                      <img src={group.icon} alt="" />
                    </div>
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
              <span className="about-index">{isKz ? '02 / Қызмет' : '02 / Деятельность'}</span>
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
                  <img src={methodsImage} alt={isKz ? 'ҚХП фракциясының жұмысы' : 'Работа фракции НПК'} />
                </figure>
                <div className="about-methods__cards">
                  <article>
                    <Landmark size={24} strokeWidth={1.6} aria-hidden="true" />
                    <h3>{isKz ? 'Саяси қатысу' : 'Политическое участие'}</h3>
                    <p>{isKz ? 'Азаматтардың мүддесін білдіру, заң шығару жұмысы және халық игілігіне бағытталған шешімдер.' : 'Представительство интересов граждан, законодательная работа и решения в интересах народа.'}</p>
                    <Link to="/frakciya">{isKz ? 'Фракция туралы' : 'О фракции'}<ArrowRight size={15} /></Link>
                  </article>
                  <article>
                    <Building2 size={24} strokeWidth={1.6} aria-hidden="true" />
                    <h3>{isKz ? 'Өңірлердегі жұмыс' : 'Работа на местах'}</h3>
                    <p>{isKz ? 'Филиалдар, мәслихаттар мен қоғамдық қабылдау бөлмелері партия бастамаларын халықтың нақты сұранысымен байланыстырады.' : 'Филиалы, маслихаты и общественные приёмные связывают инициативы партии с реальными запросами людей.'}</p>
                    <Link to="/filialy">{isKz ? 'Филиалдарымыз' : 'Наши филиалы'}<ArrowRight size={15} /></Link>
                  </article>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <p className="about-callout">{isKz ? 'Ел байлығы – халық игілігіне!' : 'Богатство страны на благо народа!'}</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="about-row">
          <ScrollReveal>
            <div className="about-row__intro">
              <span className="about-index">{isKz ? '03 / Ұйым' : '03 / Организация'}</span>
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
                  <img src={mapKzUrl} alt={isKz ? 'Қазақстан Халық партиясы филиалдарының картасы' : 'Карта филиалов Народной партии Казахстана'} />
                </div>
                <ol className="about-structure__levels">
                  <li><span>01</span><strong>{isKz ? 'Филиалдар' : 'Филиалы'}</strong><p>{isKz ? 'Барлық облыс пен республикалық маңызы бар қаладағы өңірлік бөлімшелер.' : 'Региональные отделения во всех областях и городах республиканского значения.'}</p></li>
                  <li><span>02</span><strong>{isKz ? 'Өкілдіктер' : 'Представительства'}</strong><p>{isKz ? 'Партияның аудандар мен ірі елді мекендердегі жұмысы.' : 'Работа партии в районах и крупных населённых пунктах.'}</p></li>
                  <li><span>03</span><strong>{isKz ? 'Бастауыш ұйымдар' : 'Первичные организации'}</strong><p>{isKz ? 'Адамдардың тұрғылықты, оқу және жұмыс орнында тұрақты қызмет атқаратын ұйымдар.' : 'Постоянная работа рядом с людьми — по месту жительства, учёбы и труда.'}</p></li>
                </ol>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="about-open">
          <ScrollReveal>
            <span className="about-index">{isKz ? '04 / Әріптестік' : '04 / Партнёрство'}</span>
            <h2>{isKz ? 'Біз баршаға ашықпыз' : 'Мы открыты для всех'}</h2>
            <p>{isKz ? 'ҚХП демократияны, әлеуметтік әділдікті, гендерлік теңдікті және құқық үстемдігін қолдайтын қоғамдық, саяси, азаматтық және халықаралық ұйымдармен ынтымақтасуға дайын.' : 'НПК готова к сотрудничеству со всеми общественными, политическими, гражданскими и международными объединениями, стоящими на позициях демократии, социальной справедливости, гендерного равенства и правового регулирования.'}</p>
          </ScrollReveal>
          <div className="about-open__grid">
            {visibleCooperation.map((item, index) => (
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
              <span className="about-index">{isKz ? '05 / Миссия' : '05 / Миссия'}</span>
              <h2>{goalHeading}</h2>
              {goalParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <p className="about-mission__statement">{isKz ? 'Ел байлығы – халық игілігіне!' : 'Богатство страны на благо народа!'}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <figure className="about-mission__media">
              <img src={goalImage} alt={isKz ? 'Қазақстан Халық партиясы съезінің қатысушылары' : 'Участники съезда Народной партии Казахстана'} />
            </figure>
          </ScrollReveal>
        </div>
      </section>

      <section className="about-shell about-directions">
        <ScrollReveal>
          <div className="about-directions__heading">
            <span className="about-index">{isKz ? '06 / Бағдарлама' : '06 / Программа'}</span>
            <h2>{isKz ? 'ҚХП жұмысының негізгі бағыттары' : 'Основные направления работы НПК'}</h2>
          </div>
        </ScrollReveal>
        <div className="about-directions__grid">
          {visibleWorkAreas.map((area, index) => (
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
              <span>{isKz ? 'Қазақстан Халық партиясы' : 'Народная партия Казахстана'}</span>
              <h2>{isKz ? 'Ел байлығы – халық игілігіне!' : 'Богатство страны на благо народа!'}</h2>
              <p>{isKz ? 'Құндылықтарымыз бен мақсаттарымызды қолдасаңыз, партия қатарына қосылыңыз.' : 'Если вы разделяете наши ценности и цели — присоединяйтесь к партии.'}</p>
            </div>
            <Link to="/vstupit" className="about-button about-button--light">
              {isKz ? 'Партияға қосылу' : 'Вступить в партию'}<ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
