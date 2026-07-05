import { Link } from 'react-router-dom';
import {
  Newspaper, Image, ShoppingCart, ClipboardList,
  Handshake, Users, Building2, Layers, Briefcase,
  TrendingUp, TrendingDown, FileText, UserCheck,
} from 'lucide-react';

const kpiCards = [
  {
    label: 'Всего публикаций',
    value: '0',
    trend: null,
    icon: Newspaper,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Опубликовано в мае',
    value: '0',
    trend: null,
    icon: TrendingUp,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    label: 'Новых заявок',
    value: '0',
    trend: null,
    icon: ClipboardList,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    label: 'Новых резюме',
    value: '0',
    trend: null,
    icon: UserCheck,
    iconBg: 'bg-red-50',
    iconColor: 'text-brand-red',
  },
];

const quickLinks = [
  { title: 'Новости', path: '/news', icon: Newspaper, desc: 'Пресс-релизы и статьи' },
  { title: 'Медиабиблиотека', path: '/media', icon: Image, desc: 'Фото и файлы' },
  { title: 'План закупок', path: '/purchases', icon: ShoppingCart, desc: 'Лоты и импорт Excel' },
  { title: 'Заявки поставщиков', path: '/supplier-forms', icon: ClipboardList, desc: 'Анкеты партнёров' },
  { title: 'Резюме', path: '/resumes', icon: UserCheck, desc: 'Входящие отклики' },
  { title: 'Вакансии', path: '/vacancies', icon: FileText, desc: 'Открытые позиции' },
  { title: 'Партнёры', path: '/partners', icon: Handshake, desc: 'Логотипы и ссылки' },
  { title: 'Клиенты', path: '/clients', icon: Briefcase, desc: 'Логотипы клиентов на главной' },
  { title: 'Команда сайта', path: '/team', icon: Users, desc: 'Сотрудники' },
  { title: 'Офисы', path: '/offices', icon: Building2, desc: 'Адреса и контакты' },
  { title: 'Страницы сайта', path: '/pages', icon: Layers, desc: 'Блоки и контент' },
];

const recentActivity = [
  { action: 'Новость создана', detail: 'Итоги квартала 2026', time: 'только что', icon: Newspaper },
  { action: 'Файл загружен', detail: 'photo_press_2026.jpg', time: '5 мин назад', icon: Image },
  { action: 'Заявка поставщика', detail: 'ТОО "ЛогистикПро"', time: '23 мин назад', icon: ClipboardList },
  { action: 'Новое резюме', detail: 'Специалист по PR', time: '1 час назад', icon: UserCheck },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
        <p className="text-brand-gray text-sm mt-0.5">Добро пожаловать в DAR Rail CMS</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-brand-silver/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-brand-gray">{card.label}</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">{card.value}</p>
                  <p className="text-xs text-brand-gray mt-1">— данные загружаются</p>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon size={22} className={card.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-brand-silver/50 p-5">
          <h2 className="text-base font-semibold text-brand-dark mb-4">Быстрый доступ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-3 p-3 rounded-lg border border-brand-silver/60 hover:border-brand-red hover:bg-brand-cream transition-all group"
                >
                  <div className="p-2 bg-brand-cream rounded-lg group-hover:bg-brand-red/10 transition-colors">
                    <Icon size={16} className="text-brand-gray group-hover:text-brand-red transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{link.title}</p>
                    <p className="text-[11px] text-brand-gray truncate">{link.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-silver/50 p-5">
          <h2 className="text-base font-semibold text-brand-dark mb-4">Последние действия</h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 bg-brand-cream rounded-lg shrink-0 mt-0.5">
                    <Icon size={14} className="text-brand-gray" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-dark">{item.action}</p>
                    <p className="text-xs text-brand-gray truncate">{item.detail}</p>
                  </div>
                  <p className="text-[10px] text-brand-gray shrink-0">{item.time}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-brand-gray mt-4 text-center">
            Данные появятся после подключения API
          </p>
        </div>
      </div>
    </div>
  );
}
