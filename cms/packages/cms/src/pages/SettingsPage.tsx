import { useState, useRef } from 'react';
import {
  Save, Check, Users, Shield, ShieldCheck, Plus, Pencil, Trash2,
  Eye, EyeOff, BarChart3, FileText, Newspaper, Calendar as CalendarIcon,
  Link2, Bot, Key, Globe, RefreshCw, AlertCircle, ChevronLeft,
  ChevronRight, Activity, Settings2, Layers, Cpu,
} from 'lucide-react';

// ─── Role types (shared with UsersPage) ───────────────────────────────────────

export type Role = 'ADMIN' | 'SYSADMIN' | 'PRESS_SECRETARY' | 'HR_MANAGER' | 'PROCUREMENT_MANAGER';

interface RoleInfo {
  label: string;
  description: string;
  color: string;
  badge: string;
  access: string[];
}

export const ROLES: Record<Role, RoleInfo> = {
  ADMIN: {
    label: 'Администратор',
    description: 'Полный доступ ко всем разделам. Управление пользователями, настройками системы.',
    color: 'bg-red-50 text-red-700 border-red-200',
    badge: 'bg-red-100 text-red-700',
    access: ['Все разделы', 'Пользователи', 'Настройки', 'Удаление данных'],
  },
  SYSADMIN: {
    label: 'Сисадмин',
    description: 'Технические настройки, редактор страниц, партнёры, медиабиблиотека.',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    access: ['Редактор страниц', 'Медиабиблиотека', 'Партнёры', 'Офисы', 'Настройки'],
  },
  PRESS_SECRETARY: {
    label: 'Пресс-секретарь',
    description: 'Создание и публикация новостей, загрузка медиафайлов, редактирование контента.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    access: ['Новости', 'Медиабиблиотека', 'Документы'],
  },
  HR_MANAGER: {
    label: 'HR-менеджер',
    description: 'Управление вакансиями, обработка резюме, редактирование команды сайта.',
    color: 'bg-green-50 text-green-700 border-green-200',
    badge: 'bg-green-100 text-green-700',
    access: ['Вакансии', 'Резюме', 'Команда сайта'],
  },
  PROCUREMENT_MANAGER: {
    label: 'Закупщик',
    description: 'Управление планом закупок, обработка заявок поставщиков.',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    access: ['План закупок', 'Заявки поставщиков', 'Документы'],
  },
};

const ROLE_ORDER: Role[] = ['ADMIN', 'SYSADMIN', 'PRESS_SECRETARY', 'HR_MANAGER', 'PROCUREMENT_MANAGER'];

// ─── User types ───────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'BLOCKED';
  lastLogin: string | null;
  createdAt: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin', email: 'admin@darrail.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: 'Сегодня, 09:41', createdAt: '01.01.2025' },
  { id: '2', name: 'Айгерим Нурланова', email: 'press@darrail.com', role: 'PRESS_SECRETARY', status: 'ACTIVE', lastLogin: 'Вчера, 14:20', createdAt: '15.03.2025' },
  { id: '3', name: 'Сергей Ли', email: 'sysadmin@darrail.com', role: 'SYSADMIN', status: 'ACTIVE', lastLogin: '02.05.2026', createdAt: '01.02.2025' },
  { id: '4', name: 'Динара Сейткали', email: 'hr@darrail.com', role: 'HR_MANAGER', status: 'BLOCKED', lastLogin: '10.03.2026', createdAt: '01.04.2025' },
];

// ─── Audit log types ──────────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  canRollback: boolean;
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: 'a1', userId: '2', userName: 'Айгерим Нурланова', userRole: 'PRESS_SECRETARY', action: 'PUBLISH', entity: 'Новость', entityId: 'news-031', details: 'Опубликована статья «Итоги I квартала 2026»', timestamp: '07.05.2026 11:32', canRollback: true },
  { id: 'a2', userId: '1', userName: 'Admin', userRole: 'ADMIN', action: 'CREATE', entity: 'Пользователь', entityId: 'usr-004', details: 'Создан пользователь hr@darrail.com (HR-менеджер)', timestamp: '07.05.2026 10:15', canRollback: false },
  { id: 'a3', userId: '2', userName: 'Айгерим Нурланова', userRole: 'PRESS_SECRETARY', action: 'UPDATE', entity: 'Новость', entityId: 'news-030', details: 'Обновлён текст статьи «Безопасность на путях»', timestamp: '06.05.2026 16:44', canRollback: true },
  { id: 'a4', userId: '3', userName: 'Сергей Ли', userRole: 'SYSADMIN', action: 'UPDATE', entity: 'Страница', entityId: 'page-home', details: 'Изменён блок Hero на главной странице', timestamp: '06.05.2026 14:10', canRollback: true },
  { id: 'a5', userId: '2', userName: 'Айгерим Нурланова', userRole: 'PRESS_SECRETARY', action: 'CREATE', entity: 'Новость', entityId: 'news-029', details: 'Создан черновик «День машиниста — 2026»', timestamp: '05.05.2026 09:55', canRollback: false },
  { id: 'a6', userId: '1', userName: 'Admin', userRole: 'ADMIN', action: 'DELETE', entity: 'Медиафайл', entityId: 'media-018', details: 'Удалён файл train_old.jpg', timestamp: '04.05.2026 17:30', canRollback: false },
  { id: 'a7', userId: '3', userName: 'Сергей Ли', userRole: 'SYSADMIN', action: 'UPDATE', entity: 'Партнёры', entityId: 'partner-05', details: 'Обновлён логотип партнёра «КТЖ-Грузовые»', timestamp: '03.05.2026 13:22', canRollback: true },
  { id: 'a8', userId: '2', userName: 'Айгерим Нурланова', userRole: 'PRESS_SECRETARY', action: 'PUBLISH', entity: 'Новость', entityId: 'news-028', details: 'Опубликована новость «Участие в Rail Forum 2026»', timestamp: '02.05.2026 10:00', canRollback: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function actionLabel(action: string) {
  const map: Record<string, { label: string; color: string }> = {
    CREATE:  { label: 'Создан',    color: 'bg-green-50 text-green-700' },
    UPDATE:  { label: 'Изменён',   color: 'bg-blue-50 text-blue-700' },
    DELETE:  { label: 'Удалён',    color: 'bg-red-50 text-red-700' },
    PUBLISH: { label: 'Опубликован', color: 'bg-purple-50 text-purple-700' },
    ARCHIVE: { label: 'В архив',   color: 'bg-gray-100 text-gray-600' },
  };
  return map[action] ?? { label: action, color: 'bg-gray-100 text-gray-600' };
}

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

function Calendar({ year, month, activeDay, onSelect }: {
  year: number; month: number; activeDay: number | null; onSelect: (d: number) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-xs text-brand-gray font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={!d}
            onClick={() => d && onSelect(d)}
            className={`text-xs py-1.5 rounded-lg transition-colors ${
              !d ? 'invisible' :
              activeDay === d ? 'bg-brand-red text-white font-semibold' :
              isToday(d) ? 'bg-brand-cream text-brand-dark font-semibold border border-brand-red/30' :
              'text-brand-dark hover:bg-brand-cream'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-dark mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red';

function IntegrationCard({
  logo, name, description, keyLabel, keyValue, onKeyChange, status, onConnect,
}: {
  logo: React.ReactNode;
  name: string;
  description: string;
  keyLabel: string;
  keyValue: string;
  onKeyChange: (v: string) => void;
  status: 'connected' | 'not_configured' | 'error';
  onConnect: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center text-brand-dark shrink-0">
            {logo}
          </div>
          <div>
            <p className="font-semibold text-brand-dark text-sm">{name}</p>
            <p className="text-xs text-brand-gray mt-0.5">{description}</p>
          </div>
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
          status === 'connected' ? 'bg-green-50 text-green-700' :
          status === 'error' ? 'bg-red-50 text-red-600' :
          'bg-gray-100 text-gray-500'
        }`}>
          {status === 'connected' ? 'Подключено' : status === 'error' ? 'Ошибка' : 'Не настроено'}
        </span>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <label className="block text-xs font-medium text-brand-gray mb-1">{keyLabel}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={show ? 'text' : 'password'}
                value={keyValue}
                onChange={e => onKeyChange(e.target.value)}
                placeholder="Вставьте ключ или ID..."
                className={`${inputCls} pr-9`}
              />
              <button type="button" onClick={() => setShow(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              type="button"
              onClick={onConnect}
              className="px-3 py-2 text-xs font-medium bg-brand-dark text-white rounded-lg hover:bg-brand-dark/90 whitespace-nowrap"
            >
              Проверить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiProviderCard({
  icon, name, description, keyValue, onKeyChange, model, onModelChange, models,
  enabledRoles, onToggleRole, enabled, onToggle,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  keyValue: string;
  onKeyChange: (v: string) => void;
  model: string;
  onModelChange: (v: string) => void;
  models: { value: string; label: string }[];
  enabledRoles: Role[];
  onToggleRole: (r: Role) => void;
  enabled: boolean;
  onToggle: () => void;
}) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-brand-dark text-sm">{name}</p>
            <p className="text-xs text-brand-gray mt-0.5">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${enabled ? 'bg-brand-red' : 'bg-brand-silver'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {enabled && (
        <>
          <div>
            <label className="block text-xs font-medium text-brand-gray mb-1">API ключ</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={e => onKeyChange(e.target.value)}
                placeholder="sk-..."
                className={`${inputCls} pr-9`}
              />
              <button type="button" onClick={() => setShowKey(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-gray mb-1">Модель</label>
            <select
              value={model}
              onChange={e => onModelChange(e.target.value)}
              className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
            >
              {models.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium text-brand-gray mb-2">Доступ для ролей</p>
            <div className="flex flex-wrap gap-2">
              {ROLE_ORDER.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onToggleRole(role)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    enabledRoles.includes(role)
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-white text-brand-gray border-brand-silver hover:border-brand-dark'
                  }`}
                >
                  {ROLES[role].label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── User modal ───────────────────────────────────────────────────────────────

function UserModal({
  initial, onSave, onClose,
}: {
  initial?: User;
  onSave: (data: Omit<User, 'id' | 'lastLogin' | 'createdAt'> & { password?: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: initial?.role ?? 'PRESS_SECRETARY' as Role,
    status: initial?.status ?? 'ACTIVE' as 'ACTIVE' | 'BLOCKED',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);

  const isEdit = !!initial;
  const isValid = form.name && form.email && (isEdit || form.password.length >= 8);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-brand-silver/40 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-brand-dark">
            {isEdit ? 'Редактировать пользователя' : 'Новый пользователь'}
          </h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-dark text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Имя *">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={inputCls} placeholder="Айгерим Нурланова" />
            </Field>
            <Field label="Email *">
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={inputCls} placeholder="user@darrail.com" />
            </Field>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">Роль *</label>
            <div className="space-y-2">
              {ROLE_ORDER.map(role => {
                const info = ROLES[role];
                return (
                  <label key={role} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.role === role ? info.color : 'border-brand-silver hover:border-brand-gray/40'}`}>
                    <input type="radio" name="role" value={role} checked={form.role === role}
                      onChange={() => setForm(p => ({ ...p, role }))} className="mt-0.5 accent-[#D64238]" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-dark">{info.label}</p>
                      <p className="text-xs text-brand-gray mt-0.5 leading-relaxed">{info.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <Field label={`Пароль${isEdit ? ' — оставьте пустым, чтобы не менять' : ' *'}`}>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={`${inputCls} pr-9`}
                placeholder={isEdit ? 'Новый пароль (минимум 8 символов)' : 'Минимум 8 символов'} />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          {isEdit && (
            <div className="flex items-center justify-between p-3 bg-brand-cream rounded-lg">
              <div>
                <p className="text-sm font-medium text-brand-dark">Статус аккаунта</p>
                <p className="text-xs text-brand-gray">{form.status === 'ACTIVE' ? 'Пользователь активен' : 'Доступ заблокирован'}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, status: p.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.status === 'ACTIVE' ? 'bg-green-500' : 'bg-brand-gray'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.status === 'ACTIVE' ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-brand-silver/40 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-brand-gray hover:text-brand-dark">Отмена</button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className="px-4 py-2 text-sm bg-brand-red text-white rounded-lg hover:bg-brand-red/90 disabled:opacity-40"
          >
            {isEdit ? 'Сохранить' : 'Создать пользователя'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UTM Builder ──────────────────────────────────────────────────────────────

function UtmBuilder() {
  const [utm, setUtm] = useState({ url: '', source: '', medium: '', campaign: '', term: '', content: '' });
  const [copied, setCopied] = useState(false);

  const result = (() => {
    if (!utm.url) return '';
    try {
      const u = new URL(utm.url);
      if (utm.source) u.searchParams.set('utm_source', utm.source);
      if (utm.medium) u.searchParams.set('utm_medium', utm.medium);
      if (utm.campaign) u.searchParams.set('utm_campaign', utm.campaign);
      if (utm.term) u.searchParams.set('utm_term', utm.term);
      if (utm.content) u.searchParams.set('utm_content', utm.content);
      return u.toString();
    } catch { return ''; }
  })();

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const f = (key: keyof typeof utm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setUtm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-brand-dark flex items-center gap-2">
        <Link2 size={16} className="text-brand-red" /> Конструктор UTM-меток
      </h3>

      <Field label="Целевой URL *">
        <input value={utm.url} onChange={f('url')} className={inputCls} placeholder="https://darrail.com/news/..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="utm_source *">
          <input value={utm.source} onChange={f('source')} className={inputCls} placeholder="google, yandex, telegram" />
        </Field>
        <Field label="utm_medium *">
          <input value={utm.medium} onChange={f('medium')} className={inputCls} placeholder="cpc, organic, email" />
        </Field>
        <Field label="utm_campaign *">
          <input value={utm.campaign} onChange={f('campaign')} className={inputCls} placeholder="brand_awareness_may26" />
        </Field>
        <Field label="utm_term">
          <input value={utm.term} onChange={f('term')} className={inputCls} placeholder="перевозки, логистика" />
        </Field>
        <Field label="utm_content">
          <input value={utm.content} onChange={f('content')} className={inputCls} placeholder="banner_top, button_cta" />
        </Field>
      </div>

      {result && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-brand-gray">Готовая ссылка:</p>
          <div className="flex items-start gap-2 p-3 bg-brand-cream/60 rounded-lg border border-brand-silver/60">
            <p className="flex-1 text-xs text-brand-dark break-all font-mono leading-relaxed">{result}</p>
            <button
              type="button"
              onClick={copy}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-brand-dark text-white hover:bg-brand-dark/90'}`}
            >
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'audit' | 'integrations' | 'site';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'overview',      label: 'Обзор',        icon: BarChart3 },
  { id: 'users',         label: 'Пользователи', icon: Users },
  { id: 'audit',         label: 'Аудит',        icon: Activity },
  { id: 'integrations',  label: 'Интеграции',   icon: Layers },
  { id: 'site',          label: 'Сайт',         icon: Settings2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // ── Users state ──────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [userModal, setUserModal] = useState<{ open: boolean; editing?: User }>({ open: false });
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  // ── Audit state ──────────────────────────────────────────────────
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [auditEntries, setAuditEntries] = useState(MOCK_AUDIT);
  const [auditUserFilter, setAuditUserFilter] = useState<string>('ALL');

  // ── Integrations state ───────────────────────────────────────────
  const [analyticsKeys, setAnalyticsKeys] = useState({
    googleAnalytics: '',
    searchConsole: '',
    googleAds: '',
    yandexMetrica: '',
    facebookPixel: '',
  });
  const [aiProviders, setAiProviders] = useState({
    openai: { enabled: false, key: '', model: 'gpt-4o', roles: ['PRESS_SECRETARY', 'ADMIN'] as Role[] },
    claude: { enabled: false, key: '', model: 'claude-sonnet-4-6', roles: ['PRESS_SECRETARY', 'ADMIN'] as Role[] },
    gemini: { enabled: false, key: '', model: 'gemini-2.0-flash', roles: ['PRESS_SECRETARY', 'ADMIN'] as Role[] },
  });

  // ── Site settings state ──────────────────────────────────────────
  const [siteSaved, setSiteSaved] = useState(false);
  const [siteForm, setSiteForm] = useState({
    companyNameRu: 'ТОО «Dar Rail»',
    companyNameKz: '«Dar Rail» ЖШС',
    emailNotifications: 'info@darrail.com',
    phone: '+7 (7172) 39 99 88',
    maintenanceMode: false,
    newsPerPage: '10',
    defaultLang: 'ru',
  });

  // ── User handlers ────────────────────────────────────────────────
  function handleSaveUser(data: Omit<User, 'id' | 'lastLogin' | 'createdAt'> & { password?: string }) {
    if (userModal.editing) {
      setUsers(prev => prev.map(u => u.id === userModal.editing!.id ? { ...u, ...data } : u));
    } else {
      setUsers(prev => [...prev, {
        id: Date.now().toString(), name: data.name, email: data.email,
        role: data.role, status: data.status, lastLogin: null,
        createdAt: new Date().toLocaleDateString('ru-RU'),
      }]);
    }
    setUserModal({ open: false });
  }

  function handleDeleteUser(user: User) {
    if (user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1) {
      alert('Нельзя удалить единственного администратора');
      return;
    }
    if (window.confirm(`Удалить пользователя «${user.name}»?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  }

  // ── Audit helpers ────────────────────────────────────────────────
  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  const filteredAudit = auditEntries.filter(e =>
    auditUserFilter === 'ALL' || e.userId === auditUserFilter
  );

  // ── AI helpers ───────────────────────────────────────────────────
  function toggleAiProvider(provider: keyof typeof aiProviders) {
    setAiProviders(p => ({ ...p, [provider]: { ...p[provider], enabled: !p[provider].enabled } }));
  }
  function setAiKey(provider: keyof typeof aiProviders, key: string) {
    setAiProviders(p => ({ ...p, [provider]: { ...p[provider], key } }));
  }
  function setAiModel(provider: keyof typeof aiProviders, model: string) {
    setAiProviders(p => ({ ...p, [provider]: { ...p[provider], model } }));
  }
  function toggleAiRole(provider: keyof typeof aiProviders, role: Role) {
    setAiProviders(p => {
      const current = p[provider].roles;
      const next = current.includes(role) ? current.filter(r => r !== role) : [...current, role];
      return { ...p, [provider]: { ...p[provider], roles: next } };
    });
  }

  // Save AI keys to localStorage so NewsEditor can read them
  function saveIntegrations() {
    const active = Object.entries(aiProviders).find(([, v]) => v.enabled && v.key);
    if (active) {
      const [provider, config] = active;
      localStorage.setItem('cms_ai_provider', provider);
      localStorage.setItem('cms_ai_key', config.key);
      localStorage.setItem('cms_ai_model', config.model);
    } else {
      localStorage.removeItem('cms_ai_provider');
      localStorage.removeItem('cms_ai_key');
      localStorage.removeItem('cms_ai_model');
    }
  }

  const filteredUsers = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Настройки</h1>
        <p className="text-brand-gray text-sm mt-0.5">Управление системой, пользователями и интеграциями</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-brand-cream/60 rounded-xl p-1.5 border border-brand-silver/40 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-brand-dark shadow-sm border border-brand-silver/50'
                : 'text-brand-gray hover:text-brand-dark'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ОБЗОР ──────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Новостей опубликовано', value: '47', icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Пользователей CMS', value: String(users.length), icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Файлов в медиатеке', value: '214', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Страниц сайта', value: '6', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-2xl font-bold text-brand-dark">{value}</p>
                <p className="text-xs text-brand-gray mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Content breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
              <h3 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
                <Newspaper size={16} className="text-brand-red" /> Новости по типам
              </h3>
              {[
                { label: 'Пресс-релизы', count: 19, total: 47 },
                { label: 'Статьи', count: 22, total: 47 },
                { label: 'СМИ о нас', count: 6, total: 47 },
              ].map(({ label, count, total }) => (
                <div key={label} className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-brand-dark">{label}</span>
                    <span className="text-brand-gray font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-brand-silver/40 rounded-full h-1.5">
                    <div className="bg-brand-red h-1.5 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
              <h3 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
                <Activity size={16} className="text-brand-red" /> Последние действия
              </h3>
              <div className="space-y-3">
                {MOCK_AUDIT.slice(0, 5).map(entry => {
                  const { label, color } = actionLabel(entry.action);
                  return (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${color}`}>{label}</span>
                      <div className="min-w-0">
                        <p className="text-brand-dark truncate">{entry.details}</p>
                        <p className="text-xs text-brand-gray mt-0.5">{entry.userName} · {entry.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Users quick view */}
          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-dark flex items-center gap-2">
                <Users size={16} className="text-brand-red" /> Пользователи
              </h3>
              <button onClick={() => setActiveTab('users')} className="text-xs text-brand-red hover:underline">
                Управлять →
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 bg-brand-cream/50 rounded-lg border border-brand-silver/40">
                  <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-dark">{u.name}</p>
                    <p className="text-xs text-brand-gray">{ROLES[u.role].label}</p>
                  </div>
                  {u.status === 'BLOCKED' && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">Блок</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ПОЛЬЗОВАТЕЛИ ───────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-brand-gray text-sm">{users.length} пользователей · {users.filter(u => u.status === 'ACTIVE').length} активных</p>
            <button
              onClick={() => setUserModal({ open: true })}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
            >
              <Plus size={15} /> Добавить пользователя
            </button>
          </div>

          {/* Role legend */}
          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <Shield size={15} className="text-brand-red" /> Иерархия ролей
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {ROLE_ORDER.map((role, i) => {
                const info = ROLES[role];
                return (
                  <div key={role} className="flex items-center gap-2">
                    {i > 0 && <span className="text-brand-silver text-sm">›</span>}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${info.color}`}>
                      <ShieldCheck size={12} /> {info.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {ROLE_ORDER.map(role => {
                const info = ROLES[role];
                return (
                  <div key={role} className="p-3 rounded-lg bg-brand-cream/50 border border-brand-silver/40">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.badge}`}>{info.label}</span>
                    <ul className="mt-2 space-y-1">
                      {info.access.map(a => (
                        <li key={a} className="text-xs text-brand-gray flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-brand-gray/60 shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${roleFilter === 'ALL' ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-brand-silver hover:border-brand-dark'}`}>
              Все ({users.length})
            </button>
            {ROLE_ORDER.map(role => {
              const count = users.filter(u => u.role === role).length;
              if (!count) return null;
              return (
                <button key={role} onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${roleFilter === role ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-brand-silver hover:border-brand-dark'}`}>
                  {ROLES[role].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users size={40} className="mx-auto mb-3 text-brand-silver" />
                <p className="text-brand-dark font-medium">Нет пользователей</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-silver/40 bg-brand-cream/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Пользователь</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Роль</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Статус</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Последний вход</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const roleInfo = ROLES[user.role];
                    return (
                      <tr key={user.id} className="border-b border-brand-silver/30 hover:bg-brand-cream/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {user.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-brand-dark text-sm">{user.name}</p>
                              <p className="text-brand-gray text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleInfo.badge}`}>{roleInfo.label}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {user.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-brand-gray text-sm">{user.lastLogin ?? 'Не входил'}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setUserModal({ open: true, editing: user })}
                              className="p-1.5 text-brand-gray hover:text-brand-dark hover:bg-brand-cream rounded">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDeleteUser(user)}
                              className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {userModal.open && (
            <UserModal initial={userModal.editing} onSave={handleSaveUser} onClose={() => setUserModal({ open: false })} />
          )}
        </div>
      )}

      {/* ── АУДИТ ──────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* Calendar sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-brand-cream rounded-lg text-brand-gray hover:text-brand-dark">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-brand-dark">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-brand-cream rounded-lg text-brand-gray hover:text-brand-dark">
                  <ChevronRight size={16} />
                </button>
              </div>
              <Calendar year={calYear} month={calMonth} activeDay={selectedDay} onSelect={setSelectedDay} />
            </div>

            {/* User filter */}
            <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-4 space-y-2">
              <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide mb-2">Фильтр по сотруднику</p>
              <button
                onClick={() => setAuditUserFilter('ALL')}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${auditUserFilter === 'ALL' ? 'bg-brand-dark text-white' : 'text-brand-gray hover:bg-brand-cream'}`}
              >
                Все сотрудники
              </button>
              {users.map(u => (
                <button key={u.id}
                  onClick={() => setAuditUserFilter(u.id)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${auditUserFilter === u.id ? 'bg-brand-dark text-white' : 'text-brand-gray hover:bg-brand-cream'}`}
                >
                  <span className="w-5 h-5 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name[0]}</span>
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          {/* Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-brand-gray">{filteredAudit.length} записей</p>
              <button onClick={() => setSelectedDay(today.getDate())}
                className="flex items-center gap-1.5 text-xs text-brand-red hover:underline">
                <CalendarIcon size={13} /> Сегодня
              </button>
            </div>

            {filteredAudit.length === 0 ? (
              <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-12 text-center">
                <Activity size={36} className="mx-auto mb-3 text-brand-silver" />
                <p className="text-brand-gray text-sm">Нет записей за выбранный период</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-silver/40 bg-brand-cream/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Время</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Действие</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Сотрудник</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Детали</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudit.map(entry => {
                      const { label, color } = actionLabel(entry.action);
                      return (
                        <tr key={entry.id} className="border-b border-brand-silver/30 hover:bg-brand-cream/20 transition-colors">
                          <td className="px-5 py-3 text-xs text-brand-gray whitespace-nowrap">{entry.timestamp}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {entry.userName[0]}
                              </span>
                              <div>
                                <p className="text-xs font-medium text-brand-dark">{entry.userName}</p>
                                <p className="text-xs text-brand-gray">{ROLES[entry.userRole].label}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-brand-dark max-w-xs">
                            <p className="truncate">{entry.details}</p>
                            <p className="text-xs text-brand-gray mt-0.5">{entry.entity} #{entry.entityId}</p>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1.5 justify-end">
                              {entry.canRollback && (
                                <button
                                  onClick={() => window.confirm('Откатить это изменение?') && setAuditEntries(p => p.filter(e => e.id !== entry.id))}
                                  title="Откатить изменение"
                                  className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded text-xs"
                                >
                                  <RefreshCw size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => window.confirm('Удалить запись из журнала?') && setAuditEntries(p => p.filter(e => e.id !== entry.id))}
                                title="Удалить запись"
                                className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ИНТЕГРАЦИИ ─────────────────────────────────────────────────── */}
      {activeTab === 'integrations' && (
        <div className="space-y-8">
          {/* Analytics */}
          <div>
            <h2 className="font-semibold text-brand-dark mb-1 flex items-center gap-2">
              <BarChart3 size={16} className="text-brand-red" /> Аналитика и реклама
            </h2>
            <p className="text-sm text-brand-gray mb-4">Подключите счётчики для отслеживания посещаемости сайта</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IntegrationCard
                logo={<Globe size={18} />}
                name="Google Analytics 4"
                description="Трафик, аудитория, события, конверсии"
                keyLabel="Measurement ID (G-XXXXXXXXXX)"
                keyValue={analyticsKeys.googleAnalytics}
                onKeyChange={v => setAnalyticsKeys(p => ({ ...p, googleAnalytics: v }))}
                status={analyticsKeys.googleAnalytics ? 'connected' : 'not_configured'}
                onConnect={() => {}}
              />
              <IntegrationCard
                logo={<Globe size={18} />}
                name="Google Search Console"
                description="Поисковые запросы, индексация, ошибки"
                keyLabel="Verification code (meta tag content)"
                keyValue={analyticsKeys.searchConsole}
                onKeyChange={v => setAnalyticsKeys(p => ({ ...p, searchConsole: v }))}
                status={analyticsKeys.searchConsole ? 'connected' : 'not_configured'}
                onConnect={() => {}}
              />
              <IntegrationCard
                logo={<Globe size={18} />}
                name="Google Ads"
                description="Ремаркетинг, отслеживание конверсий"
                keyLabel="Conversion ID (AW-XXXXXXXXXX)"
                keyValue={analyticsKeys.googleAds}
                onKeyChange={v => setAnalyticsKeys(p => ({ ...p, googleAds: v }))}
                status={analyticsKeys.googleAds ? 'connected' : 'not_configured'}
                onConnect={() => {}}
              />
              <IntegrationCard
                logo={<Globe size={18} />}
                name="Яндекс.Метрика"
                description="Вебвизор, тепловые карты, цели"
                keyLabel="Номер счётчика"
                keyValue={analyticsKeys.yandexMetrica}
                onKeyChange={v => setAnalyticsKeys(p => ({ ...p, yandexMetrica: v }))}
                status={analyticsKeys.yandexMetrica ? 'connected' : 'not_configured'}
                onConnect={() => {}}
              />
              <IntegrationCard
                logo={<Globe size={18} />}
                name="Facebook / Meta Pixel"
                description="Ретаргетинг, аудитории, конверсии"
                keyLabel="Pixel ID"
                keyValue={analyticsKeys.facebookPixel}
                onKeyChange={v => setAnalyticsKeys(p => ({ ...p, facebookPixel: v }))}
                status={analyticsKeys.facebookPixel ? 'connected' : 'not_configured'}
                onConnect={() => {}}
              />
            </div>
          </div>

          {/* UTM */}
          <UtmBuilder />

          {/* AI */}
          <div>
            <h2 className="font-semibold text-brand-dark mb-1 flex items-center gap-2">
              <Bot size={16} className="text-brand-red" /> Искусственный интеллект
            </h2>
            <p className="text-sm text-brand-gray mb-1">Настройте AI-ассистента для пресс-секретаря — генерация переводов и контента прямо в редакторе новостей.</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 mb-4">
              <AlertCircle size={13} /> Включите одного провайдера и назначьте роли, у которых будет доступ к кнопке «Генерировать» в редакторе.
            </div>

            <div className="space-y-4">
              <AiProviderCard
                icon={<Cpu size={18} />}
                name="OpenAI / ChatGPT"
                description="GPT-4o, GPT-4o mini — лучшее качество перевода"
                keyValue={aiProviders.openai.key}
                onKeyChange={v => setAiKey('openai', v)}
                model={aiProviders.openai.model}
                onModelChange={v => setAiModel('openai', v)}
                models={[
                  { value: 'gpt-4o', label: 'GPT-4o' },
                  { value: 'gpt-4o-mini', label: 'GPT-4o mini (дешевле)' },
                  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                ]}
                enabledRoles={aiProviders.openai.roles}
                onToggleRole={r => toggleAiRole('openai', r)}
                enabled={aiProviders.openai.enabled}
                onToggle={() => toggleAiProvider('openai')}
              />
              <AiProviderCard
                icon={<Bot size={18} />}
                name="Anthropic Claude"
                description="Claude Sonnet 4 — быстро, качественно, понимает контекст"
                keyValue={aiProviders.claude.key}
                onKeyChange={v => setAiKey('claude', v)}
                model={aiProviders.claude.model}
                onModelChange={v => setAiModel('claude', v)}
                models={[
                  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
                  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (быстрее)' },
                  { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 (максимум)' },
                ]}
                enabledRoles={aiProviders.claude.roles}
                onToggleRole={r => toggleAiRole('claude', r)}
                enabled={aiProviders.claude.enabled}
                onToggle={() => toggleAiProvider('claude')}
              />
              <AiProviderCard
                icon={<Cpu size={18} />}
                name="Google Gemini"
                description="Gemini 2.0 Flash — быстро и бесплатно для тестирования"
                keyValue={aiProviders.gemini.key}
                onKeyChange={v => setAiKey('gemini', v)}
                model={aiProviders.gemini.model}
                onModelChange={v => setAiModel('gemini', v)}
                models={[
                  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
                  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                ]}
                enabledRoles={aiProviders.gemini.roles}
                onToggleRole={r => toggleAiRole('gemini', r)}
                enabled={aiProviders.gemini.enabled}
                onToggle={() => toggleAiProvider('gemini')}
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => { saveIntegrations(); alert('AI-настройки сохранены'); }}
                className="flex items-center gap-2 px-5 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
              >
                <Key size={15} /> Сохранить AI-ключи
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── САЙТ ───────────────────────────────────────────────────────── */}
      {activeTab === 'site' && (
        <div className="space-y-5 max-w-2xl">
          <div className="flex justify-end">
            <button
              onClick={() => { setSiteSaved(true); setTimeout(() => setSiteSaved(false), 2000); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                siteSaved ? 'bg-green-600 text-white' : 'bg-brand-red text-white hover:bg-brand-red/90'
              }`}
            >
              {siteSaved ? <><Check size={16} /> Сохранено</> : <><Save size={16} /> Сохранить</>}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-brand-dark">Компания</h2>
            <Field label="Название (рус)">
              <input value={siteForm.companyNameRu} onChange={e => setSiteForm(p => ({ ...p, companyNameRu: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Атауы (қаз)">
              <input value={siteForm.companyNameKz} onChange={e => setSiteForm(p => ({ ...p, companyNameKz: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Телефон">
              <input value={siteForm.phone} onChange={e => setSiteForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} />
            </Field>
          </div>

          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-brand-dark">Уведомления</h2>
            <Field label="Email для уведомлений">
              <p className="text-xs text-brand-gray mb-1">Куда приходят заявки поставщиков и резюме</p>
              <input value={siteForm.emailNotifications} onChange={e => setSiteForm(p => ({ ...p, emailNotifications: e.target.value }))} className={inputCls} />
            </Field>
          </div>

          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-brand-dark">Контент</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Новостей на странице">
                <select value={siteForm.newsPerPage} onChange={e => setSiteForm(p => ({ ...p, newsPerPage: e.target.value }))}
                  className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red">
                  <option value="6">6</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </Field>
              <Field label="Язык по умолчанию">
                <select value={siteForm.defaultLang} onChange={e => setSiteForm(p => ({ ...p, defaultLang: e.target.value }))}
                  className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red">
                  <option value="ru">Русский</option>
                  <option value="kz">Қазақша</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-brand-dark">Режим обслуживания</h2>
                <p className="text-brand-gray text-sm mt-0.5">Сайт покажет заглушку вместо контента</p>
              </div>
              <button
                type="button"
                onClick={() => setSiteForm(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${siteForm.maintenanceMode ? 'bg-brand-red' : 'bg-brand-silver'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${siteForm.maintenanceMode ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
