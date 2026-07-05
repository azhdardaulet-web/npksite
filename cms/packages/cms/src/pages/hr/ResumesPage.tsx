import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, X, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';

type ResumeStatus = 'NEW' | 'REVIEWED' | 'INVITED' | 'REJECTED';

interface Application {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: ResumeStatus;
  createdAt: string;
  vacancy: {
    id: string;
    translations: { lang: string; title: string }[];
  } | null;
}

const STATUS_LABELS: Record<ResumeStatus, string> = {
  NEW: 'Новое',
  REVIEWED: 'Просмотрено',
  INVITED: 'Приглашён',
  REJECTED: 'Отказ',
};

const STATUS_COLORS: Record<ResumeStatus, string> = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  REVIEWED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  INVITED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function ResumesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Application | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-resumes', statusFilter],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/vacancies/applications', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      return res.data as { data: Application[]; total: number };
    },
  });

  const applications = data?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResumeStatus }) =>
      api.put(`/cms/api/v1/vacancies/applications/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cms-resumes'] }),
  });

  const handleStatus = (id: string, status: ResumeStatus) => {
    updateMutation.mutate({ id, status });
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Резюме и отклики</h1>
        <p className="text-sm text-brand-silver mt-1">Входящие заявки от кандидатов</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {(['', 'NEW', 'REVIEWED', 'INVITED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'text-brand-silver border-brand-cream hover:border-brand-dark/30'
            }`}
          >
            {s === '' ? 'Все' : STATUS_LABELS[s as ResumeStatus]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-brand-cream overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-brand-silver">Загрузка...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-10 h-10 text-brand-cream mx-auto mb-3" />
            <p className="text-brand-silver font-medium">Заявок пока нет</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40 border-b border-brand-cream">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-silver uppercase tracking-wider">ФИО</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-silver uppercase tracking-wider">Контакты</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-silver uppercase tracking-wider">Вакансия</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-silver uppercase tracking-wider">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-silver uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream">
              {applications.map((a) => {
                const vacancyTitle = a.vacancy?.translations.find((t) => t.lang === 'ru')?.title ?? 'Открытый отклик';
                return (
                  <tr key={a.id} className="hover:bg-brand-cream/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-dark">{a.fullName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-brand-silver text-xs">{a.phone}</span>
                        <span className="text-brand-silver text-xs">{a.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-silver">{vacancyTitle}</td>
                    <td className="px-4 py-3 text-brand-silver text-xs">
                      {new Date(a.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatus(a.id, e.target.value as ResumeStatus)}
                        className={`text-xs font-medium border rounded-full px-2 py-0.5 cursor-pointer focus:outline-none ${STATUS_COLORS[a.status]}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(a)}
                        className="text-brand-red text-xs font-medium hover:underline"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-cream">
              <h2 className="font-bold text-brand-dark">Отклик кандидата</h2>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-silver hover:bg-brand-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-5">
              <div>
                <p className="text-xs text-brand-silver uppercase tracking-wider mb-1">ФИО</p>
                <p className="font-bold text-brand-dark text-lg">{selected.fullName}</p>
              </div>

              <div className="flex flex-col gap-2">
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-brand-dark hover:text-brand-red transition-colors">
                  <Phone className="w-4 h-4 text-brand-red" />
                  <span className="text-sm">{selected.phone}</span>
                </a>
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-brand-dark hover:text-brand-red transition-colors">
                  <Mail className="w-4 h-4 text-brand-red" />
                  <span className="text-sm">{selected.email}</span>
                </a>
              </div>

              {selected.vacancy && (
                <div className="bg-brand-cream/40 rounded-xl p-4">
                  <p className="text-xs text-brand-silver uppercase tracking-wider mb-1">Вакансия</p>
                  <p className="font-medium text-brand-dark">
                    {selected.vacancy.translations.find((t) => t.lang === 'ru')?.title ?? '—'}
                  </p>
                </div>
              )}

              {selected.coverLetter && (
                <div>
                  <p className="text-xs text-brand-silver uppercase tracking-wider mb-2">Сопроводительное письмо</p>
                  <p className="text-sm text-brand-dark leading-relaxed bg-brand-cream/30 rounded-xl p-4 whitespace-pre-line">
                    {selected.coverLetter}
                  </p>
                </div>
              )}

              {selected.resumeUrl && (
                <a href={selected.resumeUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-brand-red text-sm font-medium hover:underline">
                  Скачать резюме
                </a>
              )}
            </div>

            <div className="p-6 border-t border-brand-cream">
              <p className="text-xs text-brand-silver uppercase tracking-wider mb-3">Изменить статус</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(STATUS_LABELS) as [ResumeStatus, string][]).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => handleStatus(selected.id, k)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                      selected.status === k
                        ? STATUS_COLORS[k]
                        : 'text-brand-silver border-brand-cream hover:border-brand-dark/30'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
