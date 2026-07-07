import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, MessageSquareText, Newspaper, ShoppingCart,
  Plus, ArrowRight, ChevronLeft, ChevronRight, CalendarDays,
} from 'lucide-react';
import { useNewJoinRequestsCount } from '@/hooks/useJoinRequests';
import { useNewAppealsCount } from '@/hooks/useAppeals';
import { useNews } from '@/hooks/useNews';
import { useShopSubscribers } from '@/hooks/useShopSubscribers';
import { useUsers } from '@/hooks/useUsers';
import { ROLES, ROLE_ORDER } from '@/pages/UsersPage';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function MiniCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1);
  // Понедельник = 0 ... Воскресенье = 6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-silver/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-brand-dark flex items-center gap-1.5">
          <CalendarDays size={15} className="text-brand-red" /> {MONTHS[month]} {year}
        </span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 text-brand-gray hover:text-brand-dark rounded"><ChevronLeft size={15} /></button>
          <button onClick={nextMonth} className="p-1 text-brand-gray hover:text-brand-dark rounded"><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[10px] font-medium text-brand-gray py-1">{w}</span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`text-xs py-1.5 rounded-full ${
              d === null ? '' : isToday(d) ? 'bg-brand-red text-white font-bold' : 'text-brand-dark'
            }`}
          >
            {d ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: joinCount } = useNewJoinRequestsCount();
  const { data: appealsCount } = useNewAppealsCount();
  const { data: newsList } = useNews({}, 1, 8);
  const { data: subscribers = [] } = useShopSubscribers();
  const { data: users = [] } = useUsers();

  const [authorFilter, setAuthorFilter] = useState('');

  const statCards = [
    { label: 'Новых заявок', value: joinCount ?? 0, icon: ClipboardList, bg: 'bg-orange-50', color: 'text-orange-500' },
    { label: 'Новых обращений', value: appealsCount ?? 0, icon: MessageSquareText, bg: 'bg-red-50', color: 'text-brand-red' },
    { label: 'Всего публикаций', value: newsList?.total ?? 0, icon: Newspaper, bg: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'Покупки', value: subscribers.length, icon: ShoppingCart, bg: 'bg-green-50', color: 'text-green-500' },
  ];

  // Реальная лента последних публикаций (без выдуманных событий) —
  // источник: та же новость-модель, что и раздел «Новости».
  const recentNews = useMemo(() => {
    const items = newsList?.data ?? [];
    const filtered = authorFilter ? items.filter((n) => n.author.id === authorFilter) : items;
    return [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [newsList, authorFilter]);

  const statusLabel: Record<string, { label: string; color: string }> = {
    PUBLISHED: { label: 'Опубликован', color: 'text-green-600' },
    DRAFT: { label: 'Черновик', color: 'text-brand-gray' },
    SCHEDULED: { label: 'Запланирован', color: 'text-blue-600' },
    ARCHIVED: { label: 'В архиве', color: 'text-brand-gray' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Сводка</h1>
        <p className="text-brand-gray text-sm mt-0.5">Добро пожаловать в CMS НПК</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-brand-silver/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-brand-gray">{card.label}</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon size={22} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users + role hierarchy */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-silver/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-brand-dark">Пользователи CMS</h2>
            <p className="text-xs text-brand-gray mt-0.5">
              {users.length} пользователей · {users.filter((u) => u.status === 'ACTIVE').length} активных
            </p>
          </div>
          <Link
            to="/users"
            className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
          >
            <Plus size={16} /> Добавить пользователя
          </Link>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-brand-gray mb-2">Иерархия ролей</p>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {ROLE_ORDER.map((role, i) => (
            <div key={role} className="flex items-center gap-2 shrink-0">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${ROLES[role].color}`}>
                {ROLES[role].label}
              </span>
              {i < ROLE_ORDER.length - 1 && <ArrowRight size={13} className="text-brand-silver" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {ROLE_ORDER.map((role) => (
            <div key={role} className="border border-brand-silver/60 rounded-lg p-3">
              <p className={`text-xs font-semibold px-2 py-0.5 rounded inline-block mb-2 ${ROLES[role].badge}`}>
                {ROLES[role].label}
              </p>
              <ul className="space-y-0.5">
                {ROLES[role].access.map((a) => (
                  <li key={a} className="text-[11px] text-brand-gray">• {a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity (real news data) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-brand-silver/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-brand-dark">Последние действия</h2>
            <span className="text-xs text-brand-gray">{recentNews.length} записей</span>
          </div>
          {recentNews.length === 0 ? (
            <p className="text-sm text-brand-gray text-center py-8">Пока нет публикаций</p>
          ) : (
            <div className="divide-y divide-brand-silver/30">
              {recentNews.map((n) => {
                const st = statusLabel[n.status] ?? { label: n.status, color: 'text-brand-gray' };
                const title = n.translations.find((t) => t.lang === 'ru')?.title ?? n.translations[0]?.title ?? n.slug;
                return (
                  <Link key={n.id} to={`/news/${n.id}/edit`} className="flex items-center gap-3 py-2.5 hover:bg-brand-cream/30 -mx-2 px-2 rounded transition-colors">
                    <span className={`text-xs font-medium shrink-0 w-24 ${st.color}`}>{st.label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brand-dark truncate">{title}</p>
                      <p className="text-[11px] text-brand-gray">{n.author.name}</p>
                    </div>
                    <span className="text-[11px] text-brand-gray shrink-0">
                      {new Date(n.updatedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendar + employee filter */}
        <div className="space-y-4">
          <MiniCalendar />
          <div className="bg-white rounded-xl shadow-sm border border-brand-silver/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-gray mb-2">Фильтр по сотруднику</p>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red bg-white"
            >
              <option value="">Все сотрудники</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
