import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Image,
  ShoppingCart,
  FileText,
  Users,
  Layers,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Briefcase,
  UserCheck,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: { label: string; path: string }[];
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Редакция',
    items: [
      {
        label: 'Новости',
        icon: Newspaper,
        children: [
          { label: 'Все новости', path: '/news' },
          { label: 'Черновики', path: '/news?status=DRAFT' },
          { label: 'Создать', path: '/news/new' },
          { label: 'Категории', path: '/news/categories' },
        ],
      },
      { label: 'Медиабиблиотека', path: '/media', icon: Image },
    ],
  },
  {
    title: 'Закупки и поставщики',
    items: [
      {
        label: 'План закупок',
        icon: ShoppingCart,
        children: [
          { label: 'Все позиции', path: '/purchases' },
        ],
      },
      {
        label: 'Заявки поставщиков',
        icon: ClipboardList,
        children: [
          { label: 'Новые', path: '/supplier-forms?status=NEW' },
          { label: 'В обработке', path: '/supplier-forms?status=IN_PROGRESS' },
          { label: 'Обработанные', path: '/supplier-forms?status=DONE' },
        ],
      },
      { label: 'Документы', path: '/documents', icon: FileText },
    ],
  },
  {
    title: 'Кадры (HR)',
    items: [
      {
        label: 'Резюме',
        icon: UserCheck,
        children: [
          { label: 'Входящие', path: '/resumes?status=NEW' },
          { label: 'На рассмотрении', path: '/resumes?status=REVIEWING' },
          { label: 'Архив', path: '/resumes?status=REJECTED' },
        ],
      },
      {
        label: 'Вакансии',
        icon: Briefcase,
        children: [
          { label: 'Активные', path: '/vacancies?status=ACTIVE' },
          { label: 'Закрытые', path: '/vacancies?status=CLOSED' },
        ],
      },
    ],
  },
  {
    title: 'Клиенты',
    items: [
      {
        label: 'Анкеты удовлетворённости',
        icon: ClipboardList,
        children: [
          { label: 'Все анкеты', path: '/surveys' },
          { label: 'Перевозки', path: '/surveys?type=transportation' },
          { label: 'Экспедирование', path: '/surveys?type=forwarding' },
        ],
      },
    ],
  },
  {
    title: 'Сайт',
    items: [
      {
        label: 'Страницы',
        icon: Layers,
        children: [
          { label: 'Главная', path: '/pages/home' },
          { label: 'О компании', path: '/pages/about' },
          { label: 'Услуги', path: '/pages/services' },
          { label: 'ESG', path: '/pages/esg' },
          { label: 'Контакты', path: '/pages/contacts' },
          { label: '↳ Офисы и руководство', path: '/offices' },
        ],
      },
    ],
  },
  {
    title: 'Система',
    items: [
      { label: 'Пользователи', path: '/users', icon: Users },
      { label: 'Настройки', path: '/settings', icon: Settings },
    ],
  },
];

function NavGroup({ group, collapsed }: { group: typeof navGroups[0]; collapsed: boolean }) {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (label: string) => {
    setOpenItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
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
      {group.items.map(item => {
        const Icon = item.icon;
        if (item.children) {
          const isOpen = openItems.includes(item.label);
          const anyChildActive = item.children.some(c => location.pathname === c.path);
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
                  {item.children.map(child => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block py-1.5 px-2 text-sm rounded transition-colors
                        ${isActive(child.path)
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'}`}
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
              ${isActive(item.path!)
                ? 'bg-brand-red text-white font-medium shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

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
              <span className="text-white font-bold text-lg tracking-tight">DAR Rail</span>
              <p className="text-gray-400 text-[10px] mt-0.5">Система управления</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(p => !p)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {navGroups.map(group => (
            <NavGroup key={group.title} group={group} collapsed={collapsed} />
          ))}
        </nav>

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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
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
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
