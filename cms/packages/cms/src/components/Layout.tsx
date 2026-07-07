import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Landmark,
  ShoppingCart,
  Users2,
  LifeBuoy,
} from 'lucide-react';
import { useAuthStore, Role } from '@/store/authStore';
import { useNewJoinRequestsCount } from '@/hooks/useJoinRequests';
import { useNewAppealsCount } from '@/hooks/useAppeals';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: 'zayavki' | 'obrashcheniya';
  children?: { label: string; path: string }[];
}

interface NavGroupDef {
  title: string;
  items: NavItem[];
}

const ALL_ROLES: Role[] = [
  'ADMIN',
  'CHIEF_EDITOR',
  'SECTION_EDITOR',
  'FACTION',
  'BRANCH_EDITOR',
  'RECEPTION_MANAGER',
];

// Структура сайдбара НПК — Сводка / CRM / CMS / Поддержка / Настройки.
// «Старые» разделы (Медиабиблиотека, Команда, Кандидаты, История, Программа,
// Медиапроекты, СМИ о нас, Отзывы) не потеряны — они спрятаны вкладками
// внутри соответствующих экранов «Управление страницами» (см. src/pages/hubs).
const navGroups: NavGroupDef[] = [
  {
    title: '',
    items: [{ label: 'Сводка', path: '/dashboard', icon: LayoutDashboard, roles: ALL_ROLES }],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Заявки', path: '/zayavki', icon: ClipboardList, roles: ['ADMIN'], badge: 'zayavki' },
      {
        label: 'Обращения',
        path: '/obrashcheniya',
        icon: MessageSquareText,
        roles: ['ADMIN', 'RECEPTION_MANAGER'],
        badge: 'obrashcheniya',
      },
      { label: 'Интернет-магазин', path: '/magazin', icon: ShoppingCart, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'CMS',
    items: [
      {
        label: 'Новости и медиа',
        icon: Newspaper,
        roles: ['ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR'],
        children: [
          { label: 'Создать', path: '/news/new' },
          { label: 'Все новости', path: '/news' },
          { label: 'Черновики', path: '/news?status=DRAFT' },
          { label: 'Народный подкаст', path: '/podcast' },
          { label: 'Галерея', path: '/galereya' },
        ],
      },
      {
        label: 'Фракция',
        icon: Landmark,
        roles: ['ADMIN', 'CHIEF_EDITOR', 'FACTION'],
        children: [
          { label: 'Создать', path: '/frakciya/zaprosy?create=1' },
          { label: 'Все запросы', path: '/frakciya/zaprosy' },
          { label: 'Депутаты', path: '/frakciya/deputaty' },
        ],
      },
      {
        // Внутри «Страниц» — своя вложенная мини-панель со всеми разделами
        // (Главная, О партии, Филиалы, Пресс-центр, Контакты, Меню, Пользователи),
        // см. PageEditor.tsx → PAGE_NAV_TREE. Отдельные пункты тут не нужны.
        label: 'Управление страницами',
        path: '/pages',
        icon: Users2,
        roles: ['ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'FACTION', 'BRANCH_EDITOR'],
      },
    ],
  },
];

const bottomItems: NavItem[] = [
  { label: 'Поддержка', path: '/podderzhka', icon: LifeBuoy, roles: ALL_ROLES },
  { label: 'Настройки', path: '/settings', icon: Settings, roles: ['ADMIN'] },
];

// Бейджи-счётчики новых записей рядом с пунктами CRM.
function NavBadge({ kind }: { kind: 'zayavki' | 'obrashcheniya' }) {
  const { data: joinCount } = useNewJoinRequestsCount();
  const { data: appealsCount } = useNewAppealsCount();
  const count = kind === 'zayavki' ? joinCount : appealsCount;
  if (!count) return null;
  return (
    <span className="ml-auto shrink-0 bg-brand-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {count}
    </span>
  );
}

function NavGroup({ group, collapsed }: { group: NavGroupDef; collapsed: boolean }) {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (label: string) => {
    setOpenItems((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="mb-1">
      {group.title && !collapsed && (
        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/40 select-none">
          {group.title}
        </p>
      )}
      {group.title && collapsed && <div className="my-2 mx-3 border-t border-white/10" />}
      {group.items.map((item) => {
        const Icon = item.icon;
        if (item.children) {
          const isOpen = openItems.includes(item.label);
          const anyChildActive = item.children.some((c) => isActive(c.path.split('?')[0]));
          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-lg mx-1
                  ${anyChildActive ? 'text-white bg-brand-red/20' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="ml-9 mt-0.5 mb-1 border-l border-white/10 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block py-1.5 px-2 text-sm rounded transition-colors
                        ${isActive(child.path.split('?')[0]) ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <Link
            key={item.path}
            to={item.path!}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-lg mx-1
              ${isActive(item.path!) ? 'bg-brand-red text-white font-medium shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && <NavBadge kind={item.badge} />}
          </Link>
        );
      })}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const role = user?.role ?? 'ADMIN';

  // Фильтруем разделы/пункты по роли текущего пользователя и убираем группы,
  // в которых после фильтрации не осталось видимых пунктов.
  const visibleGroups = useMemo(() => {
    return navGroups
      .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
      .filter((group) => group.items.length > 0);
  }, [role]);

  const visibleBottom = useMemo(() => bottomItems.filter((item) => item.roles.includes(role)), [role]);

  return (
    <div className="flex h-screen bg-brand-cream overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-brand-dark transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!collapsed && (
            <div>
              <span className="text-white font-bold text-lg tracking-tight">НПК</span>
              <p className="text-gray-400 text-[10px] mt-0.5">Система управления</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {visibleGroups.map((group) => (
            <NavGroup key={group.title} group={group} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom items */}
        <div className="border-t border-white/10 py-2">
          <NavGroup group={{ title: '', items: visibleBottom }} collapsed={collapsed} />
        </div>

        {/* User */}
        <div className="border-t border-white/10 px-3 py-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.name ?? user?.email ?? 'Admin'}</p>
                <p className="text-gray-400 text-[10px] truncate">{user?.role ?? 'ADMIN'}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="text-gray-400 hover:text-white transition-colors" title="Выйти">
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-brand-silver flex items-center justify-between px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-cream rounded-lg px-3 py-2 w-64">
              <svg className="w-4 h-4 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Поиск..."
                className="bg-transparent text-sm text-brand-dark placeholder-brand-gray outline-none w-full"
              />
              <span className="text-[10px] text-brand-gray border border-brand-silver rounded px-1">⌘K</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-brand-gray hover:text-brand-dark transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold">
                {(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-brand-dark leading-tight">{user?.name ?? 'Администратор'}</p>
                <p className="text-[10px] text-brand-gray leading-tight">{user?.role ?? 'ADMIN'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
