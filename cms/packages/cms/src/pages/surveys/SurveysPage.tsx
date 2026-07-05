import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ChevronLeft, ChevronRight, Star, ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type SurveyType = 'transportation' | 'forwarding';

interface SurveySubmission {
  id: string;
  surveyType: SurveyType;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  answers: Record<string, string | number>;
  createdAt: string;
}

interface SurveysResponse {
  data: SurveySubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TYPE_LABEL: Record<SurveyType, string> = {
  transportation: 'Перевозки',
  forwarding: 'Экспедирование',
};

const TYPE_COLOR: Record<SurveyType, string> = {
  transportation: 'bg-blue-100 text-blue-700',
  forwarding: 'bg-purple-100 text-purple-700',
};

const QUESTION_LABELS: Record<string, string> = {
  q_overall: 'Общая удовлетворённость',
  q_timing: 'Соблюдение сроков',
  q_communication: 'Качество взаимодействия',
  q_safety: 'Безопасность груза',
  q_flexibility: 'Гибкость условий',
  q_professionalism: 'Профессионализм',
  q_docs: 'Качество документов',
  q_responsiveness: 'Оперативность',
  q_tracking: 'Информирование о грузе',
  q_tariff: 'Тарифная гибкость',
  q_nps: 'NPS (0–10)',
  q_comment: 'Комментарий',
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useSurveys(page: number, type?: SurveyType) {
  return useQuery<SurveysResponse>({
    queryKey: ['surveys', page, type],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (type) params.set('type', type);
      const { data } = await api.get(`/cms/api/v1/surveys?${params}`);
      return data as SurveysResponse;
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avgRating(answers: Record<string, string | number>): number | null {
  const ratingKeys = ['q_overall', 'q_timing', 'q_communication', 'q_safety', 'q_flexibility', 'q_professionalism', 'q_docs', 'q_responsiveness', 'q_tracking', 'q_tariff'];
  const vals = ratingKeys.map((k) => Number(answers[k])).filter((v) => v > 0);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-3 h-3" fill={value >= s ? '#D64338' : 'none'} stroke={value >= s ? '#D64338' : '#D4CFCA'} />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600">{value}</span>
    </div>
  );
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────

function SurveyModal({ item, onClose }: { item: SurveySubmission; onClose: () => void }) {
  const avg = avgRating(item.answers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[item.surveyType]}`}>
              {TYPE_LABEL[item.surveyType]}
            </span>
            <p className="text-lg font-semibold text-gray-900 mt-1">{item.company}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Контактное лицо</p>
              <p className="font-medium text-gray-900">{item.contactName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <a href={`mailto:${item.email}`} className="font-medium text-blue-600 hover:underline">{item.email}</a>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Телефон</p>
              <p className="font-medium text-gray-900">{item.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Дата</p>
              <p className="font-medium text-gray-900">{new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {avg !== null && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Средняя оценка</span>
              <div className="flex items-center gap-2">
                <StarDisplay value={avg} />
              </div>
            </div>
          )}

          {/* Answers */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ответы на вопросы</p>
            <div className="space-y-3">
              {Object.entries(item.answers).map(([key, val]) => {
                const label = QUESTION_LABELS[key] ?? key;
                const isRating = key !== 'q_nps' && key !== 'q_comment' && typeof val === 'number';
                const isNps = key === 'q_nps';
                const isText = key === 'q_comment';

                return (
                  <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600 shrink-0">{label}</span>
                    {isRating && <StarDisplay value={Number(val)} />}
                    {isNps && (
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{val}/10</span>
                    )}
                    {isText && (
                      <span className="text-sm text-gray-700 text-right max-w-[60%]">{val || '—'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SurveysPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<SurveyType | undefined>(undefined);
  const [selected, setSelected] = useState<SurveySubmission | null>(null);

  const { data, isLoading } = useSurveys(page, filter);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Анкеты удовлетворённости</h1>
          <p className="text-sm text-gray-500 mt-1">Ответы клиентов по перевозкам и экспедированию</p>
        </div>
        {data && (
          <div className="text-sm text-gray-500">Всего: <span className="font-semibold text-gray-800">{data.total}</span></div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {([undefined, 'transportation', 'forwarding'] as (SurveyType | undefined)[]).map((t) => (
          <button
            key={t ?? 'all'}
            onClick={() => { setFilter(t); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === t ? 'bg-[#383233] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t ? TYPE_LABEL[t] : 'Все типы'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-48 flex-1" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Анкет пока нет</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Дата</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Тип</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Компания</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Контакт</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ср. оценка</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">NPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.data.map((item) => {
                const avg = avgRating(item.answers);
                const nps = item.answers.q_nps;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[item.surveyType]}`}>
                        {TYPE_LABEL[item.surveyType]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.company}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{item.contactName}</p>
                      <p className="text-xs text-gray-400">{item.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {avg !== null ? <StarDisplay value={avg} /> : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {nps !== undefined ? (
                        <span className={`text-sm font-bold ${Number(nps) >= 9 ? 'text-green-600' : Number(nps) >= 7 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {nps}/10
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Назад
          </button>
          <span className="text-sm text-gray-500">{page} / {data.totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Вперёд <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selected && <SurveyModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
