import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface SiteCrumb {
  label: string;
  href?: string;
}

const TOP_LEVEL: Record<string, string> = {
  '/o-partii': 'О партии',
  '/proekty': 'Проекты',
  '/programma': 'Программа',
  '/kandidaty': 'Кандидаты',
  '/media': 'Медиа',
  '/priemnaya': 'Общественная приёмная',
  '/kontakty': 'Контакты',
  '/vstupit': 'Вступить в партию',
  '/filialy': 'Филиалы',
  '/rukovodstvo': 'Руководство партии',
  '/frakciya': 'Фракция',
  '/mediakits': 'Пресс-кит',
  '/search': 'Поиск',
  '/magazin': 'Магазин',
  '/ustav': 'Устав партии',
};

function crumbsFor(pathname: string): SiteCrumb[] {
  if (pathname === '/') return [];
  if (TOP_LEVEL[pathname]) return [{ label: TOP_LEVEL[pathname] }];

  if (pathname === '/novosti') return [{ label: 'Пресс-центр', href: '/novosti' }, { label: 'Новости и релизы' }];
  if (pathname === '/smi-o-nas') return [{ label: 'Пресс-центр', href: '/novosti' }, { label: 'СМИ о нас' }];
  if (pathname === '/narodnoe-media') return [{ label: 'Пресс-центр', href: '/novosti' }, { label: 'Народное медиа' }];
  if (pathname.startsWith('/narodnoe-media/')) return [
    { label: 'Пресс-центр', href: '/novosti' },
    { label: 'Народное медиа', href: '/narodnoe-media' },
    { label: 'Профиль медиакоманды' },
  ];

  if (pathname === '/o-partii/istoriya') return [{ label: 'О партии', href: '/o-partii' }, { label: 'История партии' }];
  if (pathname === '/o-partii/ustav') return [{ label: 'О партии', href: '/o-partii' }, { label: 'Устав партии' }];
  if (pathname.startsWith('/o-partii/')) return [{ label: 'О партии', href: '/o-partii' }, { label: 'Раздел о партии' }];

  if (pathname === '/frakciya/zaprosy') return [{ label: 'Фракция', href: '/frakciya' }, { label: 'Депутатские запросы' }];
  if (pathname.startsWith('/frakciya/zaprosy/')) return [
    { label: 'Фракция', href: '/frakciya' },
    { label: 'Депутатские запросы', href: '/frakciya/zaprosy' },
    { label: 'Материал' },
  ];

  if (pathname.startsWith('/rukovodstvo/')) return [{ label: 'Руководство партии', href: '/rukovodstvo' }, { label: 'Профиль руководителя' }];
  if (pathname.startsWith('/filialy/')) return [{ label: 'Филиалы', href: '/filialy' }, { label: 'Страница филиала' }];
  if (pathname.startsWith('/novosti/')) return [
    { label: 'Пресс-центр', href: '/novosti' },
    { label: 'Новости и релизы', href: '/novosti' },
    { label: 'Материал' },
  ];
  if (pathname.startsWith('/proekty/')) return [{ label: 'Проекты', href: '/proekty' }, { label: 'О проекте' }];
  if (pathname.startsWith('/verify/')) return [{ label: 'Проверка партбилета' }];

  return [{ label: 'Страница' }];
}

export function SiteBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname);
  if (crumbs.length === 0) return null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 pb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.href ?? 'current'}-${crumb.label}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb.href && index < crumbs.length - 1 ? (
                  <BreadcrumbLink asChild><Link to={crumb.href}>{crumb.label}</Link></BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
