import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Paperclip } from 'lucide-react';
import {
  useAppeals,
  useUpdateAppeal,
  AppealStatus,
  AppealItem,
} from '@/hooks/useAppeals';

const STATUS_LABEL: Record<AppealStatus, string> = {
  NEW: 'Новое',
  IN_PROGRESS: 'В обработке',
  RESOLVED: 'Решено',
  REJECTED: 'Отклонено',
};

const STATUS_COLOR: Record<AppealStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-gray-200 text-gray-600',
};

function AppealModal({ item, onClose }: { item: AppealItem; onClose: () => void }) {
  const [notes, setNotes] = useState(item.internalNotes ?? '');
  const updateMut = useUpdateAppeal();

  const handleSaveNotes = () => {
    updateMut.mutate({ id: item.id, internalNotes: notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Обращение {item.appealNumber}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">ФИО</p>
              <p className="font-medium text-gray-900">{item.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Тема</p>
              <p className="font-medium text-gray-900">{item.topic.nameRu}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Телефон</p>
              <p className="font-medium text-gray-900">{item.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{item.email || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-sm">Текст обращения</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap border border-gray-100">
              {item.message}
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-sm">Прикреплённый файл</p>
            {item.fileUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <Paperclip size={14} />
                Открыть файл
              </a>
            ) : (
              <p className="text-sm text-gray-400">Файл не прикреплён</p>
            )}
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-sm">Внутренние заметки (видно только сотрудникам)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Заметки по обращению..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updateMut.isPending}
              className="mt-2 text-sm font-medium text-white bg-brand-red rounded-lg px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {updateMut.isPending ? 'Сохранение...' : 'Сохранить заметку'}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
            <span className="text-gray-500">Дата обращения:</span>
            <span className="font-medium text-gray-900">
              {new Date(item.createdAt).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppealsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppealStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AppealItem | null>(null);

  const filters = { status: statusFilter, q: search };
  const { data, isLoading, isError } = useAppeals(filters, page);
  const updateMut = useUpdateAppeal();

  const handleStatusChange = (id: string, newStatus: AppealStatus) => {
    updateMut.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Обращения</h1>
        <p className="text-brand-gray text-sm mt-0.5">
          {data?.total !== undefined ? `${data.total} обращений граждан` : 'Обращения граждан из общественной приёмной'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/60 p-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as AppealStatus | ''); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
        >
          <option value="">Все статусы</option>
          <option value="NEW">{STATUS_LABEL.NEW}</option>
          <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
          <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
          <option value="REJECTED">{STATUS_LABEL.REJECTED}</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Поиск по ФИО или номеру обращения..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/60 overflow-x-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Загрузка...</div>
        )}
        {isError && (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm">
            Ошибка загрузки. Попробуйте обновить страницу.
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="font-medium text-gray-500 px-4 py-3 w-40">Номер</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-44">Дата</th>
                  <th className="font-medium text-gray-500 px-4 py-3 min-w-[180px]">ФИО</th>
                  <th className="font-medium text-gray-500 px-4 py-3 min-w-[160px]">Тема</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-40">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-12">Обращений не найдено</td>
                  </tr>
                )}
                {data?.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium cursor-pointer" onClick={() => setSelected(item)}>
                      {item.appealNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-500 cursor-pointer" onClick={() => setSelected(item)}>
                      {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 cursor-pointer" onClick={() => setSelected(item)}>
                      {item.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => setSelected(item)}>
                      <div className="line-clamp-1" title={item.topic.nameRu}>{item.topic.nameRu}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as AppealStatus)}
                        className={`text-xs border-0 rounded-full px-2.5 py-1 font-medium focus:ring-2 focus:ring-brand-red focus:outline-none appearance-none cursor-pointer ${STATUS_COLOR[item.status]}`}
                      >
                        <option value="NEW">{STATUS_LABEL.NEW}</option>
                        <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
                        <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
                        <option value="REJECTED">{STATUS_LABEL.REJECTED}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">Страница {data.page} из {data.totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <AppealModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
