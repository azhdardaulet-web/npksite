import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Youtube } from 'lucide-react';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import { useLanguage } from '@/i18n/LanguageContext';
import { mediaTeam, type MediaTeamMember } from '@/lib/mediaTeam';
import './NarodnoeMediaPage.css';

interface HeroBlock {
  titleRu?: string;
  titleKz?: string;
  subtitleRu?: string;
  subtitleKz?: string;
  ctaLabelRu?: string;
  ctaLabelKz?: string;
  ctaHref?: string;
}

interface TextBlock {
  headingRu?: string;
  headingKz?: string;
  textRu?: string;
  textKz?: string;
}

const SOCIALS = [
  { name: 'YouTube', count: 139000, url: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', icon: 'yt' },
  { name: 'TikTok', count: 113200, url: 'https://www.tiktok.com/@halyk_partiyasy', icon: 'tt' },
  { name: 'Instagram', count: 12700, url: 'https://www.instagram.com/halyk_partiyasy/', icon: 'ig' },
  { name: 'Facebook', count: 7000, url: 'https://www.facebook.com/halykpartiyasy', icon: 'fb' },
  { name: 'Telegram', count: 313, url: 'https://t.me/halykparty', icon: 'tg' },
];

const PROJECTS = [
  {
    tagRu: 'Информационная программа', tagKz: 'Ақпараттық бағдарлама', title: '«Ақпар»',
    descRu: 'Главные события страны и мира — коротко, честно и по делу.',
    descKz: 'Ел мен әлемдегі басты оқиғалар — қысқа, шынайы және нақты.',
    url: 'https://www.youtube.com/playlist?list=PLU7hEoO09-lcmwqPhem2yNbOpdm6SUdyB',
    image: '/images/media/project-akpar.jpg',
  },
  {
    tagRu: 'Парламентская жизнь', tagKz: 'Парламент өмірі', title: '«Фракция покажет»',
    descRu: 'Как депутаты фракции отстаивают интересы народа в Парламенте — без бюрократического тумана.',
    descKz: 'Фракция депутаттарының Парламентте халық мүддесін қалай қорғайтыны туралы.',
    url: 'https://www.youtube.com/playlist?list=PLU7hEoO09-lctIuMfA97NbgTlBC8tuHux',
    image: '/images/media/project-faction.jpg',
  },
  {
    tagRu: 'Репортажи с мест', tagKz: 'Өңірлік репортаждар', title: '«Регионы / Аймақтар»',
    descRu: 'Реальная жизнь регионов Казахстана: проблемы, люди и решения — от аула до мегаполиса.',
    descKz: 'Қазақстан өңірлерінің шынайы өмірі: ауылдан мегаполиске дейінгі мәселелер, адамдар және шешімдер.',
    url: 'https://www.youtube.com/playlist?list=PLU7hEoO09-lfYUh6FIweVHCB0lFrY7U5y',
    image: '/images/media/project-regions.jpg',
  },
];

const STUDIO_IMAGES = [
  { image: '/images/media/studio-production.jpg', altRu: 'Студия и аппаратная', altKz: 'Студия және аппараттық бөлме', featured: true },
  { image: '/images/media/studio-camera.jpg', altRu: 'Съёмочная камера', altKz: 'Түсірілім камерасы' },
  { image: '/images/media/studio-control.jpg', altRu: 'Работа режиссёра эфира', altKz: 'Эфир режиссерінің жұмысы' },
  { image: '/images/media/studio-set.jpg', altRu: 'Новостная студия', altKz: 'Жаңалықтар студиясы' },
  { image: '/images/media/studio-parliament.jpg', altRu: 'Парламентская площадка', altKz: 'Парламент алаңы' },
];

const LEGACY_HERO_SUBTITLE_RU = 'Собственная студия, ежедневный эфир и аудитория, которая опережает партийные СМИ страны. Мы освещаем внутреннюю и международную политику, обсуждаем важные социальные вопросы и продвигаем левоцентристские ценности справедливости.';
const HERO_SUBTITLE_RU = 'Собственная студия, ежедневный эфир и работа на опережение, чтобы предоставить информацию своей аудитории раньше других СМИ страны. Мы освещаем внутреннюю и международную политику, обсуждаем важные социальные вопросы и продвигаем ценности социальной справедливости.';
const HERO_SUBTITLE_KZ = 'Жеке студия, күнделікті эфир және өз аудиториясына ақпаратты еліміздің басқа БАҚ-тарынан бұрын ұсыну үшін озық жұмыс. Біз ішкі және халықаралық саясатты жариялаймыз, маңызды әлеуметтік мәселелерді талқылаймыз және әлеуметтік әділдік құндылықтарын ілгерілетеміз.';

function fmtCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return value.toString();
}

function SocialIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  if (icon === 'yt') return <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" /></svg>;
  if (icon === 'tt') return <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.09-3.18V9.01a6.34 6.34 0 1 0 7.54 6.29V8.79a8.18 8.18 0 0 0 4.78 1.52V6.86c-.34 0-.68-.06-1.01-.17z" /></svg>;
  if (icon === 'ig') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  if (icon === 'fb') return <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M21.8 3.6 18.6 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.1 12.8 1.3 11.3c-1-.3-1.1-1 .2-1.5L20.3 2.5c.9-.3 1.7.2 1.5 1.1z" /></svg>;
}

function useAnimatedCount(target: number, formatter: (value: number) => string, duration = 1500) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        element.textContent = formatter(value);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [duration, formatter, target]);

  return ref;
}

function SocialCard({ social, isKz }: { social: typeof SOCIALS[number]; isKz: boolean }) {
  const countRef = useAnimatedCount(social.count, fmtCount);
  return (
    <a className="npm-social-card" href={social.url} target="_blank" rel="noopener noreferrer">
      <div className="npm-social-card__top">
        <span className="npm-social-card__icon"><SocialIcon icon={social.icon} size={19} /></span>
        <ArrowUpRight size={17} />
      </div>
      <div>
        <span className="npm-social-card__count" ref={countRef}>0</span>
        <span className="npm-social-card__label">{social.name} · {isKz ? 'жазылушы' : 'подписчики'}</span>
      </div>
    </a>
  );
}

function TeamCard({ member, isKz }: { member: MediaTeamMember; isKz: boolean }) {
  return (
    <Link className="npm-team-card" to={`/narodnoe-media/${member.slug}`}>
      <div className="npm-team-card__image">
        <img src={member.image} alt={isKz ? member.nameKz : member.nameRu} loading="lazy" decoding="async" style={{ objectPosition: member.imagePosition }} />
      </div>
      <div className="npm-team-card__body">
        <span>{isKz ? member.roleKz : member.roleRu}</span>
        <h3>{isKz ? member.nameKz : member.nameRu}</h3>
        <div>{isKz ? 'Толығырақ' : 'Подробнее'} <ArrowUpRight size={15} /></div>
      </div>
    </Link>
  );
}

export function NarodnoeMediaPage() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const totalRef = useAnimatedCount(270000, (value) => `${Math.round(value / 1000)}K+`, 1800);
  const { getBlock } = usePageBlocks('press-center');

  const hero = getBlock<HeroBlock>('press_hero');
  const heroTitle = (isKz ? hero?.titleKz : hero?.titleRu)?.trim()
    || (isKz ? 'Халық сенетін\nхалық медиасы' : 'Народное медиа,\nкоторому верит народ');
  const heroTitleParts = heroTitle.split('\n');
  const cmsHeroSubtitle = (isKz ? hero?.subtitleKz : hero?.subtitleRu)?.trim();
  const heroSubtitle = !isKz && cmsHeroSubtitle === LEGACY_HERO_SUBTITLE_RU
    ? HERO_SUBTITLE_RU
    : cmsHeroSubtitle || (isKz ? HERO_SUBTITLE_KZ : HERO_SUBTITLE_RU);
  const heroCtaLabel = (isKz ? hero?.ctaLabelKz : hero?.ctaLabelRu)?.trim() || (isKz ? 'Жазылу' : 'Подписаться');
  const heroCtaHref = hero?.ctaHref?.trim() || 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA';

  const studio = getBlock<TextBlock>('press_studio');
  const studioHeading = (isKz ? studio?.headingKz : studio?.headingRu)?.trim() || (isKz ? 'Халық медиасы қалай жұмыс істейді' : 'Как работает народное медиа');
  const studioText = (isKz ? studio?.textKz : studio?.textRu)?.trim() || (isKz
    ? 'Идеядан түсірілімге, монтаждан жариялауға дейінгі толық өндіріс циклі. Партияның өз студиясы.'
    : 'Полный цикл производства — от идеи и съёмки до монтажа и публикации. Собственная студия в сердце партии.');

  const cta = getBlock<TextBlock>('press_cta');
  const ctaHeading = (isKz ? cta?.headingKz : cta?.headingRu)?.trim() || (isKz ? 'Халық медиасына жазылыңыз' : 'Подпишись на народное медиа');
  const ctaText = (isKz ? cta?.textKz : cta?.textRu)?.trim() || (isKz
    ? 'Жазылыңыз, талқылауларға қатысыңыз және басты оқиғалардан хабардар болыңыз.'
    : 'Подписывайтесь, участвуйте в обсуждениях и будьте в курсе ключевых событий.');

  const ticker = isKz
    ? ['Ақпар', 'Фракция көрсетеді', 'Өңірлер / Аймақтар', 'Тікелей эфир', 'Халық медиасы']
    : ['Ақпар', 'Фракция покажет', 'Регионы / Аймақтар', 'Прямой эфир', 'Народное медиа'];

  return (
    <div className="npm-page">
      <section className="npm-hero">
        <div className="npm-hero__glow" />
        <div className="npm-hero__content">
          <div className="npm-live"><span />{isKz ? 'ҚХП медиасы · Эфирде' : 'Медиа НПК · В эфире'}</div>
          <h1>
            {heroTitleParts.map((part, index) => (
              <span className={index === 1 ? 'npm-accent' : undefined} key={part}>{part}{index < heroTitleParts.length - 1 && ' '}</span>
            ))}
          </h1>
          <p>{heroSubtitle}</p>
          <div className="npm-hero__actions">
            <a className="npm-button npm-button--primary" href={heroCtaHref} target="_blank" rel="noopener noreferrer"><Youtube size={18} />{heroCtaLabel} →</a>
            <a className="npm-button npm-button--secondary" href="#projects">{isKz ? 'Бағдарламаларымыз' : 'Наши программы'}</a>
          </div>
        </div>
      </section>

      <section className="npm-audience">
        <div className="npm-audience__intro">
          <span>{isKz ? 'Біздің аудитория' : 'Наша аудитория'}</span>
          <h2>Халық Үні Қазақстан</h2>
          <p>{isKz
            ? '«Халық Үні Қазақстан» — Қазақстан Халық партиясының ақпараттық-талдамалық жаңалықтар интернет-журналы. Ең жаңа жаңалықтар, ең өзекті мәселелер, ең өткір пікірталастар және ең объективті ақпарат.'
            : '«Халық Үні Қазақстан» — информационно-аналитический новостной интернет-журнал Народной партии Казахстана. Самые свежие новости, самые актуальные проблемы, самые острые дискуссии, самая объективная информация.'}</p>
        </div>
        <div className="npm-audience__cards">
          {SOCIALS.map((social) => <SocialCard key={social.name} social={social} isKz={isKz} />)}
          <div className="npm-total-card">
            <span ref={totalRef}>0</span>
            <p>{isKz ? 'арналарымыздың жалпы аудиториясы' : 'суммарная аудитория наших каналов'}</p>
          </div>
        </div>
      </section>

      <div className="npm-ticker">
        <div className="npm-ticker__track">
          {[0, 1].map((copy) => (
            <span aria-hidden={copy === 1} key={copy}>
              {ticker.map((item) => <span key={item}>{item} <b>•</b> </span>)}
            </span>
          ))}
        </div>
      </div>

      <section className="npm-section" id="projects">
        <div className="npm-eyebrow">{isKz ? 'Медиа жобалар' : 'Медиапроекты'}</div>
        <h2>{isKz ? 'Ел көретін бағдарламалар' : 'Программы, которые смотрит страна'}</h2>
        <div className="npm-projects">
          {PROJECTS.map((project) => (
            <article className="npm-project-card" key={project.title}>
              <div className="npm-project-card__image"><img src={project.image} alt={project.title} loading="lazy" decoding="async" /></div>
              <div className="npm-project-card__body">
                <span>{isKz ? project.tagKz : project.tagRu}</span>
                <h3>{project.title}</h3>
                <p>{isKz ? project.descKz : project.descRu}</p>
                <a href={project.url} target="_blank" rel="noopener noreferrer"><Youtube size={16} />{isKz ? 'YouTube-та көру' : 'Смотреть на YouTube'}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="npm-section">
        <div className="npm-section__split-heading">
          <div><div className="npm-eyebrow">{isKz ? 'Біздің студия' : 'Наша студия'}</div><h2>{studioHeading}</h2></div>
          <p>{studioText}</p>
        </div>
        <div className="npm-studio-grid">
          {STUDIO_IMAGES.map((item) => (
            <div className={item.featured ? 'is-featured' : undefined} key={item.image}>
              <img src={item.image} alt={isKz ? item.altKz : item.altRu} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </section>

      <section className="npm-section">
        <div className="npm-eyebrow">{isKz ? 'Халық медиасының тұлғалары' : 'Лица народного медиа'}</div>
        <h2>{isKz ? 'Эфирді жасайтын адамдар' : 'Люди, которые делают эфир'}</h2>
        <div className="npm-team-grid">
          {mediaTeam.map((member) => <TeamCard member={member} isKz={isKz} key={member.slug} />)}
        </div>
      </section>

      <section className="npm-follow" id="follow">
        <div>
          <span aria-hidden="true">ЭФИР</span>
          <h2>{ctaHeading}</h2>
          <p>{ctaText}</p>
          <div className="npm-follow__links">
            {SOCIALS.map((social) => <a href={social.url} target="_blank" rel="noopener noreferrer" key={social.name}><SocialIcon icon={social.icon} />{social.name}</a>)}
          </div>
        </div>
      </section>
    </div>
  );
}
