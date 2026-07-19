import { useState } from 'react';
import { Plus, Pencil, Ban, CheckCircle2, Shield, ShieldCheck, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Role } from '@/store/authStore';
import { useUsers, useCreateUser, useUpdateUser, useBlockUser, type CmsUser } from '@/hooks/useUsers';

// ─── Role definitions (роли НПК, см. docs/PLAN.md) ────────────────────────────

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
    access: ['Все разделы', 'Пользователи', 'Настройки'],
  },
  CHIEF_EDITOR: {
    label: 'Главный редактор',
    labelKz: 'Бас редактор',
    description: 'Все новости и контент сайта — без ограничений по разделу или филиалу.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    access: ['Новости', 'Контент', 'Медиабиблиотека'],
  },
  SECTION_EDITOR: {
    label: 'Редактор раздела',
    labelKz: 'Бөлім редакторы',
    description: 'Новости и контент в рамках назначенного раздела сайта.',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    access: ['Новости своего раздела', 'Контент своего раздела'],
  },
  DEPUTY: {
    label: 'Депутат',
    labelKz: 'Депутат',
    description: 'Работа с материалами фракции и депутатскими запросами.',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    access: ['Раздел «Фракция»'],
  },
  RECEPTION_MANAGER: {
    label: 'Менеджер приёмной',
    labelKz: 'Қабылдау менеджері',
    description: 'Обращения граждан — статусы, внутренние заметки.',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    access: ['Обращения'],
  },
};

export const ROLE_ORDER: Role[] = [
  'ADMIN',
  'CHIEF_EDITOR',
  'SECTION_EDITOR',
  'RECEPTION_MANAGER',
  'DEPUTY',
];

// ─── Modal ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'BLOCKED';
  password: string;
  section: string;
}

function UserModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: CmsUser;
  onSave: (data: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: initial?.role ?? 'SECTION_EDITOR',
    status: initial?.status ?? 'ACTIVE',
    password: '',
    section: initial?.section ?? '',
  });
  const [showPw, setShowPw] = useState(false);

  const isEdit = !!initial;
  const isValid =
    form.name &&
    form.email &&
    (isEdit || form.password.length >= 8);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-brand-silver/40 flex items-center justify-between sticky top-0 bg-white">
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
                placeholder="Айгуль Нурланова"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Email <span className="text-brand-red">*</span></label>
              <input
                type="email"
                value={form.email}
                disabled={isEdit}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red disabled:bg-brand-cream disabled:text-brand-gray"
                placeholder="user@npk.kz"
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

          {form.role === 'SECTION_EDITOR' && (
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Раздел сайта</label>
              <input
                value={form.section}
                onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                placeholder="Например: Программа, История партии"
                className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
              />
            </div>
          )}

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Пароль <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full border border-brand-silver rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Минимум 8 символов"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

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
            disabled={!isValid || saving}
            className="px-4 py-2 text-sm bg-brand-red text-white rounded-lg hover:bg-brand-red/90 disabled:opacity-40 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Сохранить' : 'Создать пользователя'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const [modal, setModal] = useState<{ open: boolean; editing?: CmsUser }>({ open: false });
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const createMut = useCreateUser();
  const updateMut = useUpdateUser(modal.editing?.id ?? '');
  const blockMut = useBlockUser();

  const filtered = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

  async function handleSave(data: FormState) {
    if (modal.editing) {
      await updateMut.mutateAsync({
        name: data.name,
        role: data.role,
        status: data.status,
        branchId: null,
        section: data.role === 'SECTION_EDITOR' ? data.section : null,
      });
    } else {
      await createMut.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        section: data.role === 'SECTION_EDITOR' ? data.section : undefined,
      });
    }
    setModal({ open: false });
  }

  function handleToggleBlock(user: CmsUser) {
    if (user.status === 'ACTIVE') {
      if (window.confirm(`Заблокировать пользователя «${user.name}»?`)) {
        blockMut.mutate(user.id);
      }
    } else {
      updateMut.mutate({ status: 'ACTIVE' });
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
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 size={28} className="mx-auto mb-3 animate-spin text-brand-silver" />
          </div>
        ) : filtered.length === 0 ? (
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Филиал / раздел</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Статус</th>
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
                    <td className="px-5 py-3 text-brand-gray text-sm">
                      {user.role === 'SECTION_EDITOR' ? (user.section ?? '—') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setModal({ open: true, editing: user })} className="p-1.5 text-brand-gray hover:text-brand-dark hover:bg-brand-cream rounded">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user)}
                          title={user.status === 'ACTIVE' ? 'Заблокировать' : 'Разблокировать'}
                          className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded"
                        >
                          {user.status === 'ACTIVE' ? <Ban size={15} /> : <CheckCircle2 size={15} />}
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
          saving={createMut.isPending || updateMut.isPending}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
