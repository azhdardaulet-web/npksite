import { useState } from 'react';
import { Plus, Pencil, Trash2, Shield, ShieldCheck, Users, Eye, EyeOff } from 'lucide-react';

// ─── Role definitions ─────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'SYSADMIN' | 'PRESS_SECRETARY' | 'HR_MANAGER' | 'PROCUREMENT_MANAGER';

interface RoleInfo {
  label: string;
  labelKz: string;
  description: string;
  color: string;
  badge: string;
  access: string[];
}

export const ROLES: Record<Role, RoleInfo> = {
  ADMIN: {
    label: 'Администратор',
    labelKz: 'Әкімші',
    description: 'Полный доступ ко всем разделам. Управление пользователями, настройками системы.',
    color: 'bg-red-50 text-red-700 border-red-200',
    badge: 'bg-red-100 text-red-700',
    access: ['Все разделы', 'Пользователи', 'Настройки', 'Удаление данных'],
  },
  SYSADMIN: {
    label: 'Сисадмин',
    labelKz: 'Жүйелік әкімші',
    description: 'Технические настройки, редактор страниц, партнёры, медиабиблиотека. Без управления пользователями.',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    access: ['Редактор страниц', 'Медиабиблиотека', 'Партнёры', 'Офисы', 'Настройки'],
  },
  PRESS_SECRETARY: {
    label: 'Пресс-секретарь',
    labelKz: 'Баспасөз хатшысы',
    description: 'Создание и публикация новостей, загрузка медиафайлов, редактирование контента.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    access: ['Новости', 'Медиабиблиотека', 'Документы'],
  },
  HR_MANAGER: {
    label: 'HR-менеджер',
    labelKz: 'HR-менеджер',
    description: 'Управление вакансиями, обработка входящих резюме, редактирование команды сайта.',
    color: 'bg-green-50 text-green-700 border-green-200',
    badge: 'bg-green-100 text-green-700',
    access: ['Вакансии', 'Резюме', 'Команда сайта'],
  },
  PROCUREMENT_MANAGER: {
    label: 'Закупщик',
    labelKz: 'Сатып алу маманы',
    description: 'Управление планом закупок, обработка заявок поставщиков, загрузка документов.',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    access: ['План закупок', 'Заявки поставщиков', 'Документы'],
  },
};

const ROLE_ORDER: Role[] = ['ADMIN', 'SYSADMIN', 'PRESS_SECRETARY', 'HR_MANAGER', 'PROCUREMENT_MANAGER'];

// ─── Types ────────────────────────────────────────────────────────────────────

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
  {
    id: '1', name: 'Admin', email: 'admin@darrail.com',
    role: 'ADMIN', status: 'ACTIVE',
    lastLogin: 'Сегодня', createdAt: '01.01.2025',
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

function UserModal({
  initial,
  onSave,
  onClose,
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-brand-silver/40 flex items-center justify-between">
          <h2 className="font-semibold text-brand-dark">
            {isEdit ? 'Редактировать пользователя' : 'Новый пользователь'}
          </h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-dark text-xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Имя <span className="text-brand-red">*</span></label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
                placeholder="Даулет Ажар"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Email <span className="text-brand-red">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
                placeholder="user@darrail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">Роль <span className="text-brand-red">*</span></label>
            <div className="space-y-2">
              {ROLE_ORDER.map(role => {
                const info = ROLES[role];
                return (
                  <label key={role} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.role === role ? info.color : 'border-brand-silver hover:border-brand-gray/40'}`}>
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={() => setForm(p => ({ ...p, role }))}
                      className="mt-0.5 accent-[#D64238]"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-dark">{info.label}</p>
                      <p className="text-xs text-brand-gray mt-0.5 leading-relaxed">{info.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Пароль {!isEdit && <span className="text-brand-red">*</span>}
              {isEdit && <span className="text-brand-gray text-xs font-normal"> — оставьте пустым, чтобы не менять</span>}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-brand-silver rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-brand-red"
                placeholder={isEdit ? 'Новый пароль (минимум 8 символов)' : 'Минимум 8 символов'}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between p-3 bg-brand-cream rounded-lg">
              <div>
                <p className="text-sm font-medium text-brand-dark">Статус аккаунта</p>
                <p className="text-xs text-brand-gray">{form.status === 'ACTIVE' ? 'Пользователь активен' : 'Доступ заблокирован'}</p>
              </div>
              <button
                onClick={() => setForm(p => ({ ...p, status: p.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.status === 'ACTIVE' ? 'bg-green-500' : 'bg-brand-gray'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.status === 'ACTIVE' ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-brand-silver/40 flex justify-end gap-3">
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [modal, setModal] = useState<{ open: boolean; editing?: User }>({ open: false });
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const filtered = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

  function handleSave(data: Omit<User, 'id' | 'lastLogin' | 'createdAt'> & { password?: string }) {
    if (modal.editing) {
      setUsers(prev => prev.map(u => u.id === modal.editing!.id ? { ...u, ...data } : u));
    } else {
      setUsers(prev => [...prev, {
        id: Date.now().toString(),
        name: data.name, email: data.email,
        role: data.role, status: data.status,
        lastLogin: null,
        createdAt: new Date().toLocaleDateString('ru-RU'),
      }]);
    }
    setModal({ open: false });
  }

  function handleDelete(user: User) {
    if (user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1) {
      alert('Нельзя удалить единственного администратора');
      return;
    }
    if (window.confirm(`Удалить пользователя «${user.name}»?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Пользователи CMS</h1>
          <p className="text-brand-gray text-sm mt-0.5">{users.length} пользователей · {users.filter(u => u.status === 'ACTIVE').length} активных</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
        >
          <Plus size={16} /> Добавить пользователя
        </button>
      </div>

      {/* Role legend */}
      <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
          <Shield size={16} className="text-brand-red" /> Иерархия ролей
        </h2>
        <div className="flex flex-wrap gap-2">
          {ROLE_ORDER.map((role, i) => {
            const info = ROLES[role];
            return (
              <div key={role} className="flex items-center gap-2">
                {i > 0 && <span className="text-brand-silver text-sm">›</span>}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${info.color}`}>
                  <ShieldCheck size={13} />
                  <span>{info.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
        <button onClick={() => setRoleFilter('ALL')} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${roleFilter === 'ALL' ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-brand-silver hover:border-brand-dark'}`}>
          Все ({users.length})
        </button>
        {ROLE_ORDER.map(role => {
          const count = users.filter(u => u.role === role).length;
          if (count === 0) return null;
          return (
            <button key={role} onClick={() => setRoleFilter(role)} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${roleFilter === role ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-brand-silver hover:border-brand-dark'}`}>
              {ROLES[role].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
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
              {filtered.map(user => {
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
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleInfo.badge}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-gray text-sm">{user.lastLogin ?? 'Не входил'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setModal({ open: true, editing: user })} className="p-1.5 text-brand-gray hover:text-brand-dark hover:bg-brand-cream rounded">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(user)} className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded">
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

      {modal.open && (
        <UserModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
