import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Briefcase, Eye, EyeOff, X, Users } from 'lucide-react';
import { api } from '@/lib/api';

type VacancyStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

interface Translation {
  lang: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
}

interface Vacancy {
  id: string;
  department: string;
  employment: string;
  location: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  status: VacancyStatus;
  sortOrder: number;
  translations: Translation[];
  _count?: { applications: number };
}

const STATUS_LABELS: Record<VacancyStatus, string> = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликована',
  CLOSED: 'Закрыта',
};

const STATUS_COLORS: Record<VacancyStatus, string> = {
  DRAFT: 'bg-amber-50 text-amber-700 border border-amber-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CLOSED: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const DEPARTMENTS = [
  'Локомотивные бригады',
  'Диспетчерская служба',
  'Технический персонал',
  'Административный персонал',
  'Финансы и бухгалтерия',
  'HR и кадры',
  'IT',
  'Прочее',
];

const EMPTY_FORM = {
  department: '',
  employment: 'Полная занятость',
  location: 'Казахстан',
  salaryFrom: '',
  salaryTo: '',
  status: 'DRAFT' as VacancyStatus,
  sortOrder: '0',
  ru_title: '',
  ru_description: '',
  ru_requirements: '',
  ru_responsibilities: '',
};

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-brand-dark bg-white placeholder:text-gray-400 focus:outline-none focus:border-brand-red transition-colors';
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

export default function VacanciesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Vacancy | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['cms-vacancies', statusFilter],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/vacancies', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      return res.data as { data: Vacancy[]; total: number };
    },
  });

  const vacancies = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: object) => api.post('/cms/api/v1/vacancies', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-vacancies'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: object }) =>
      api.put(`/cms/api/v1/vacancies/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-vacancies'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/vacancies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cms-vacancies'] }),
  });

  const toggleStatus = (v: Vacancy) => {
    const next: VacancyStatus = v.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    updateMutation.mutate({
      id: v.id,
      payload: {
        department: v.department, employment: v.employment, location: v.location,
        salaryFrom: v.salaryFrom ?? undefined, salaryTo: v.salaryTo ?? undefined,
        status: next, sortOrder: v.sortOrder, translations: v.translations,
      },
    });
  };

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditing(null); setModal('create'); };

  const openEdit = (v: Vacancy) => {
    const ru = v.translations.find((t) => t.lang === 'ru') ?? { title: '', description: '', requirements: '', responsibilities: '' };
    setForm({
      department: v.department, employment: v.employment, location: v.location,
      salaryFrom: v.salaryFrom?.toString() ?? '', salaryTo: v.salaryTo?.toString() ?? '',
      status: v.status, sortOrder: v.sortOrder.toString(),
      ru_title: ru.title, ru_description: ru.description,
      ru_requirements: ru.requirements, ru_responsibilities: ru.responsibilities,
    });
    setEditing(v); setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditing(null); };

  const buildPayload = () => ({
    department: form.department, employment: form.employment, location: form.location,
    salaryFrom: form.salaryFrom ? parseInt(form.salaryFrom) : null,
    salaryTo: form.salaryTo ? parseInt(form.salaryTo) : null,
    status: form.status, sortOrder: parseInt(form.sortOrder) || 0,
    translations: [{ lang: 'ru', title: form.ru_title, description: form.ru_description, requirements: form.ru_requirements, responsibilities: form.ru_responsibilities }],
  });

  const handleSave = () => {
    const payload = buildPayload();
    if (modal === 'edit' && editing) updateMutation.mutate({ id: editing.id, payload });
    else createMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить вакансию? Это действие нельзя отменить.')) return;
    deleteMutation.mutate(id);
  };

  const f = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const FILTERS = [
    { value: '', label: 'Все' },
    { value: 'PUBLISHED', label: 'Опубликованы' },
    { value: 'DRAFT', label: 'Черновики' },
    { value: 'CLOSED', label: 'Закрыты' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Вакансии</h1>
          <p className="text-sm text-brand-gray mt-1">Управление открытыми вакансиями</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-red text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-red/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Добавить вакансию
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              statusFilter === value
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white text-brand-dark border-gray-300 hover:border-brand-dark'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-brand-gray text-sm">Загрузка...</div>
        ) : vacancies.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-brand-dark font-semibold mb-1">Вакансий нет</p>
            <p className="text-sm text-brand-gray mb-4">Создайте первую вакансию, чтобы она появилась на сайте</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Создать вакансию
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Подразделение</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Зарплата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Отклики</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vacancies.map((v) => {
                const ru = v.translations.find((t) => t.lang === 'ru');
                const salary = v.salaryFrom
                  ? v.salaryTo
                    ? `${v.salaryFrom.toLocaleString('ru-RU')} – ${v.salaryTo.toLocaleString('ru-RU')} тг`
                    : `от ${v.salaryFrom.toLocaleString('ru-RU')} тг`
                  : 'По договорённости';
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-brand-dark">{ru?.title ?? '—'}</td>
                    <td className="px-4 py-3.5 text-brand-gray text-xs">{v.department}</td>
                    <td className="px-4 py-3.5 text-brand-dark text-xs font-medium">{salary}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-brand-gray text-xs">
                        <Users className="w-3.5 h-3.5" />
                        {v._count?.applications ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[v.status]}`}>
                        {STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          title={v.status === 'PUBLISHED' ? 'Снять с публикации' : 'Опубликовать'}
                          onClick={() => toggleStatus(v)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors"
                        >
                          {v.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-brand-dark text-lg">
                {modal === 'create' ? 'Новая вакансия' : 'Редактировать вакансию'}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Подразделение *</label>
                <select value={form.department} onChange={f('department')} className={inputCls}>
                  <option value="">Выберите...</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Название (RU) *</label>
                <input type="text" value={form.ru_title} onChange={f('ru_title')} placeholder="Машинист электровоза" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Место работы</label>
                  <input type="text" value={form.location} onChange={f('location')} placeholder="Экибастуз" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Тип занятости</label>
                  <input type="text" value={form.employment} onChange={f('employment')} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Зарплата от (тг)</label>
                  <input type="number" value={form.salaryFrom} onChange={f('salaryFrom')} placeholder="300 000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Зарплата до (тг)</label>
                  <input type="number" value={form.salaryTo} onChange={f('salaryTo')} placeholder="500 000" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Описание</label>
                <textarea value={form.ru_description} onChange={f('ru_description')} rows={2} placeholder="Краткое описание позиции..." className={inputCls} style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label className={labelCls}>Обязанности</label>
                <textarea value={form.ru_responsibilities} onChange={f('ru_responsibilities')} rows={4}
                  placeholder={'Управление локомотивом...\nТехническое обслуживание...'} className={inputCls} style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label className={labelCls}>Требования</label>
                <textarea value={form.ru_requirements} onChange={f('ru_requirements')} rows={4}
                  placeholder={'Наличие прав машиниста...\nОпыт от 2 лет...'} className={inputCls} style={{ resize: 'vertical' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Статус</label>
                  <select value={form.status} onChange={f('status')} className={inputCls}>
                    <option value="DRAFT">Черновик</option>
                    <option value="PUBLISHED">Опубликована</option>
                    <option value="CLOSED">Закрыта</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Порядок сортировки</label>
                  <input type="number" value={form.sortOrder} onChange={f('sortOrder')} className={inputCls} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-brand-gray border border-gray-200 rounded-lg hover:text-brand-dark hover:border-gray-300 transition-colors">
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending || !form.department || !form.ru_title}
                className="px-5 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
