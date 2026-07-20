import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import { useA11y } from '@/contexts/A11yContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useT } from '@/i18n/useT';
import type { TranslationKey } from '@/i18n/ru';

/* ─── Dropdown nav structure ───────────────────────────────────────── */
type SubLink = { label: string; href: string; desc?: string };
type NavItem = { label: string; href: string; children?: SubLink[]; branches?: true };

const BRANCHES_LIST = [
  { short: 'Алматы',                        href: '/filialy' },
  { short: 'Астана',                         href: '/filialy' },
  { short: 'Шымкент',                        href: '/filialy' },
  { short: 'Акмолинская область',            href: '/filialy' },
  { short: 'Актюбинская область',            href: '/filialy' },
  { short: 'Алматинская область',            href: '/filialy' },
  { short: 'Атырауская область',             href: '/filialy' },
  { short: 'Восточно-Казахстанская область', href: '/filialy' },
  { short: 'Жетысуская область',             href: '/filialy' },
  { short: 'Жамбылская область',             href: '/filialy' },
  { short: 'Западно-Казахстанская область',  href: '/filialy' },
  { short: 'Карагандинская область',         href: '/filialy' },
  { short: 'Костанайская область',           href: '/filialy' },
  { short: 'Область Абай',                   href: '/filialy' },
  { short: 'Кызылординская область',         href: '/filialy' },
  { short: 'Мангистауская область',          href: '/filialy' },
  { short: 'Павлодарская область',           href: '/filialy' },
  { short: 'Северо-Казахстанская область',   href: '/filialy' },
  { short: 'Туркестанская область',          href: '/filialy' },
  { short: 'Улытауская область',             href: '/filialy' },
];

const NAV: NavItem[] = [
  {
    label: 'О партии',
    href: '/o-partii',
    children: [
      { label: 'О партии',       href: '/o-partii' },
      { label: 'История партии', href: '/o-partii/istoriya' },
      { label: 'Руководство',    href: '/rukovodstvo' },
      { label: 'Устав',          href: '/o-partii/ustav' },
      { label: 'Программа',      href: '/programma' },
      { label: 'Проекты',        href: '/proekty' },
    ],
  },
  {
    label: 'Фракция',
    href: '/frakciya',
    children: [
      { label: 'О фракции',           href: '/frakciya' },
      { label: 'Состав фракции',      href: '/frakciya/sostav' },
      { label: 'Депутатские запросы', href: '/frakciya/zaprosy' },
    ],
  },
  {
    label: 'Общественная приёмная',
    href: '/priemnaya',
  },
  {
    label: 'Филиалы',
    href: '/filialy',
    branches: true,
  },
  {
    label: 'Пресс-центр',
    href: '/novosti',
    children: [
      { label: 'Новости и релизы',                  href: '/novosti' },
      { label: 'СМИ о нас',                         href: '/smi-o-nas' },
      { label: 'Галерея',                            href: '/galereya' },
      { label: 'О портале «Халық үні Қазақстан»',   href: '/narodnoe-media' },
      { label: 'Народный подкаст',                   href: '/podcast' },
      { label: 'Видео',                              href: '/media' },
    ],
  },
  {
    label: 'Контакты',
    href: '/kontakty',
  },
  {
    label: 'Магазин',
    href: '/magazin',
  },
];

const NAV_LABEL_KEYS: Record<string, TranslationKey> = {
  'О партии': 'nav.about',
  'История партии': 'nav.history',
  'Руководство': 'nav.leadership',
  'Устав': 'nav.charter',
  'Программа': 'nav.program',
  'Проекты': 'nav.projects',
  'Фракция': 'nav.faction',
  'О фракции': 'nav.factionAbout',
  'Состав фракции': 'nav.factionComposition',
  'Депутатские запросы': 'nav.factionRequests',
  'Общественная приёмная': 'nav.reception',
  'Филиалы': 'nav.branches',
  'Пресс-центр': 'nav.pressCenter',
  'Новости и релизы': 'nav.newsReleases',
  'СМИ о нас': 'nav.mediaAboutUs',
  'Галерея': 'nav.gallery',
  'О портале «Халық үні Қазақстан»': 'nav.portal',
  'Народный подкаст': 'nav.podcast',
  'Видео': 'nav.video',
  'Контакты': 'nav.contacts',
  'Магазин': 'nav.shop',
};

const BRANCH_LABEL_KEYS: TranslationKey[] = [
  'nav.branch.almaty', 'nav.branch.astana', 'nav.branch.shymkent',
  'nav.branch.akmola', 'nav.branch.aktobe', 'nav.branch.almatyRegion',
  'nav.branch.atyrau', 'nav.branch.eastKazakhstan', 'nav.branch.jetisu',
  'nav.branch.zhambyl', 'nav.branch.westKazakhstan', 'nav.branch.karaganda',
  'nav.branch.kostanay', 'nav.branch.abay', 'nav.branch.kyzylorda',
  'nav.branch.mangystau', 'nav.branch.pavlodar', 'nav.branch.northKazakhstan',
  'nav.branch.turkistan', 'nav.branch.ulytau',
];

const PATH_TO_PAGE_SLUG: Record<string, string> = {
  '/o-partii': 'about',
  '/o-partii/istoriya': 'history',
  '/o-partii/ustav': 'ustav',
  '/ustav': 'ustav',
  '/rukovodstvo': 'leadership',
  '/programma': 'program',
  '/proekty': 'projects',
  '/frakciya': 'faction',
  '/priemnaya': 'priemnaya',
  '/filialy': 'branches',
  '/novosti': 'news',
  '/smi-o-nas': 'smi',
  '/narodnoe-media': 'press-center',
  '/media': 'media',
  '/kontakty': 'contacts',
  '/magazin': 'shop',
};

/* ─── Social icons ─────────────────────────────────────────────────── */
const SocialYouTube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
  </svg>
);
const SocialInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);
const SocialFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const SocialTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.86a8.22 8.22 0 0 0 4.8 1.54V6.93a4.85 4.85 0 0 1-1.03-.24z"/>
  </svg>
);
const SocialTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconAccessibility = () => (
  <svg width="20" height="14" viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="13" height="10" rx="5" />
    <rect x="22" y="4" width="13" height="10" rx="5" />
    <path d="M14 9h8" />
    <path d="M1 9 Q0 4 0 2" />
    <path d="M35 9 Q36 4 36 2" />
  </svg>
);
const IconGlobe = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l4 4 4-4"/>
  </svg>
);

const socials = [
  { icon: <SocialYouTube />,   href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', label: 'YouTube' },
  { icon: <SocialInstagram />, href: 'https://www.instagram.com/halyk_partiyasy/',                 label: 'Instagram' },
  { icon: <SocialFacebook />,  href: 'https://www.facebook.com/halykpartiyasy',                   label: 'Facebook' },
  { icon: <SocialTikTok />,    href: 'https://www.tiktok.com/@halyk_partiyasy',                   label: 'TikTok' },
  { icon: <SocialTelegram />,  href: 'https://t.me/halykparty',                                   label: 'Telegram' },
];

/* ─── Dropdown menu components ─────────────────────────────────────── */
function StandardDropdown({ items }: { items: SubLink[] }) {
  const t = useT();
  return (
    <div className="absolute top-full left-0 pt-1 z-50 min-w-[220px]">
      <div className="bg-surface border border-line shadow-2xl py-1.5">
        {items.map((item) => (
          <Link
            key={item.href + item.label}
            to={item.href}
            className="block px-5 py-2.5 text-[12px] font-medium tracking-[0.03em] text-text-muted hover:text-text-base hover:bg-surface-2 transition-colors duration-100 whitespace-nowrap"
          >
            {t(NAV_LABEL_KEYS[item.label])}
          </Link>
        ))}
      </div>
    </div>
  );
}

function BranchesDropdown() {
  const t = useT();
  const cities = BRANCHES_LIST.slice(0, 3);
  const oblasts = BRANCHES_LIST.slice(3);
  return (
    <div className="absolute top-full left-0 pt-1 z-50 w-[480px]">
      <div className="bg-surface border border-line shadow-2xl p-4">
        <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-text-muted mb-2 px-1">{t('nav.branchesCities')}</div>
        <div className="flex gap-1 mb-3 flex-wrap">
          {cities.map((b, index) => (
            <Link key={b.short} to={b.href}
              className="px-3 py-1.5 text-[12px] font-medium text-text-muted hover:text-text-base bg-surface-2 hover:bg-line border border-line transition-all duration-100">
              {t(BRANCH_LABEL_KEYS[index])}
            </Link>
          ))}
        </div>
        <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-text-muted mb-2 px-1">{t('nav.branchesRegions')}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {oblasts.map((b, index) => (
            <Link key={b.short} to={b.href}
              className="px-1 py-1.5 text-[12px] font-medium text-text-muted hover:text-text-base hover:bg-surface-2 transition-colors duration-100 truncate">
              {t(BRANCH_LABEL_KEYS[index + 3])}
            </Link>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-line">
          <Link to="/filialy" className="text-[11px] font-semibold text-accent-brand hover:brightness-125 tracking-[0.06em] uppercase transition-colors">
            {t('nav.allBranches')}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── NavItem with hover dropdown ──────────────────────────────────── */
function NavMenuItem({ item }: { item: NavItem }) {
  const t = useT();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasDropdown = !!(item.children || item.branches);
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 80);
  };

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <Link
        to={item.href}
        className={cn(
          'relative h-full flex items-center gap-1 px-3 text-[12px] font-medium tracking-[0.05em] uppercase transition-colors duration-150 whitespace-nowrap select-none',
          isActive
            ? 'text-text-base after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent-brand'
            : 'text-text-muted hover:text-text-base'
        )}
      >
        {t(NAV_LABEL_KEYS[item.label])}
        {hasDropdown && (
          <span className={cn('transition-transform duration-150', open && 'rotate-180')}>
            <ChevronDown />
          </span>
        )}
      </Link>

      {open && hasDropdown && (
        <div onMouseEnter={show} onMouseLeave={hide}>
          {item.branches
            ? <BranchesDropdown />
            : <StandardDropdown items={item.children!} />
          }
        </div>
      )}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────── */
export function DesktopHeader() {
  const { language, setLanguage } = useLanguage();
  const t = useT();
  const { isVisible } = usePageVisibility();
  const { openPanel } = useA11y();
  const visibleNav = NAV
    .filter((item) => isVisible(PATH_TO_PAGE_SLUG[item.href] ?? item.href))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => isVisible(PATH_TO_PAGE_SLUG[child.href] ?? child.href)),
    }));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      {/* ── Top bar: Logo | Socials | Join button ── */}
      <div className="bg-bg/95 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1440px] mx-auto px-8 h-[64px] flex items-center gap-6">
          <Link to="/" className="shrink-0 flex items-center">
            <img
              src={language === 'kz' ? '/images/logo-kz.svg' : '/images/logo-rus.svg'}
              alt={t('brand.fullName')}
              /* WHY: у logo-kz.svg почти вдвое больше пустого поля вокруг эмблемы
                 внутри своего viewBox, чем у logo-rus.svg — при одинаковой высоте
                 контейнера видимый рисунок казахского логотипа был заметно мельче. */
              className={language === 'kz' ? 'h-[60px] w-auto' : 'h-[38px] w-auto'}
            />
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-base hover:bg-surface-2 transition-all duration-150"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <div className="w-px h-6 bg-line shrink-0" />
          <Link to="/vstupit" className="shrink-0">
            <button className="px-6 py-2.5 bg-accent-brand hover:brightness-90 text-accent-brand-text text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150 rounded-none">
              {t('nav.join')}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Bottom bar: Main nav ── */}
      <div className="bg-surface/95 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1440px] mx-auto px-8 h-[44px] flex items-center justify-between">
          <nav className="flex items-center h-full">
          {visibleNav.map((item) => (
              <NavMenuItem key={item.href + item.label} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-0.5 shrink-0">
            <Link to="/search" aria-label={t('search.title')} className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-base hover:bg-surface-2 rounded-none transition-all duration-150">
              <IconSearch />
            </Link>
            <div className="flex items-center gap-1 mx-2 border-r border-line pr-3">
              <IconGlobe />
              <button
                onClick={() => setLanguage('kz')}
                className={cn('text-[12px] font-medium tracking-[0.04em] transition-colors', language === 'kz' ? 'text-text-base' : 'text-text-muted hover:text-text-base')}
              >{t('language.kz')}</button>
              <span className="text-text-muted text-[10px]">|</span>
              <button
                onClick={() => setLanguage('ru')}
                className={cn('text-[12px] font-medium tracking-[0.04em] transition-colors', language === 'ru' ? 'text-text-base' : 'text-text-muted hover:text-text-base')}
              >{t('language.ru')}</button>
            </div>
            <ThemeToggle />
            <button
              aria-label={t('accessibility.open')}
              onClick={openPanel}
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-base hover:bg-surface-2 rounded-none transition-all duration-150"
            >
              <IconAccessibility />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
