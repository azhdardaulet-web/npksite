import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import {
  useJoinRequests,
  useUpdateJoinRequestStatus,
  downloadJoinRequestsExport,
  JoinRequestStatus,
  JoinRequestRole,
  JoinRequestItem,
} from '@/hooks/useJoinRequests';

const STATUS_LABEL: Record<JoinRequestStatus, string> = {
  NEW: 'Новая',
  PROCESSING: 'В обработке',
  ACCEPTED: 'Принята',
  REJECTED: 'Отклонена',
};

const STATUS_COLOR: Record<JoinRequestStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-gray-200 text-gray-600',
};

const ROLE_LABEL: Record<JoinRequestRole, string> = {
  member: 'Член партии',
  volunteer: 'Волонтёр',
  observer: 'Наблюдатель',
};

function JoinRequestModal({ item, onClose }: { item: JoinRequestItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Заявка на вступление</h2>
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
              <p className="text-gray-500 mb-1">Роль</p>
              <p className="font-medium text-gray-900">{ROLE_LABEL[item.role]}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Дата рождения</p>
              <p className="font-medium text-gray-900">
                {item.birthDate ? new Date(item.birthDate).toLocaleDateString('ru-RU') : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Пол</p>
              <p className="font-medium text-gray-900">
                {item.gender === 'male' ? 'Мужской' : item.gender === 'female' ? 'Женский' : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Телефон</p>
              <p className="font-medium text-gray-900">
                {item.phone} {item.phoneVerified && <span className="text-green-600 text-xs">(подтверждён)</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{item.email || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Город</p>
              <p className="font-medium text-gray-900">{item.city || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Адрес доставки мерча</p>
              <p className="font-medium text-gray-900">{item.merchAddress || '—'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
            <span className="text-gray-500">Дата заявки:</span>
            <span className="font-medium text-gray-900">
              {new Date(item.createdAt).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JoinRequestStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState<JoinRequestRole | ''>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<JoinRequestItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const filters = { status: statusFilter, role: roleFilter, q: search };
  const { data, isLoading, isError } = useJoinRequests(filters, page);
  const updateStatusMut = useUpdateJoinRequestStatus();

  const handleStatusChange = (id: string, newStatus: JoinRequestStatus) => {
    updateStatusMut.mutate({ id, status: newStatus });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadJoinRequestsExport(filters);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Заявки</h1>
          <p className="text-brand-gray text-sm mt-0.5">
            {data?.total !== undefined ? `${data.total} заявок на вступление` : 'Заявки на вступление в партию'}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 text-sm font-medium text-white bg-brand-red rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Экспорт...' : 'Экспорт в Excel'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/60 p-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as JoinRequestStatus | ''); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
        >
          <option value="">Все статусы</option>
          <option value="NEW">{STATUS_LABEL.NEW}</option>
          <option value="PROCESSING">{STATUS_LABEL.PROCESSING}</option>
          <option value="ACCEPTED">{STATUS_LABEL.ACCEPTED}</option>
          <option value="REJECTED">{STATUS_LABEL.REJECTED}</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as JoinRequestRole | ''); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
        >
          <option value="">Все роли</option>
          <option value="member">{ROLE_LABEL.member}</option>
          <option value="volunteer">{ROLE_LABEL.volunteer}</option>
          <option value="observer">{ROLE_LABEL.observer}</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Поиск по ФИО или телефону..."
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
                  <th className="font-medium text-gray-500 px-4 py-3 w-44">Дата</th>
                  <th className="font-medium text-gray-500 px-4 py-3 min-w-[180px]">ФИО</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-36">Роль</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-40">Телефон</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-32">Город</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-40">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-12">Заявок не найдено</td>
                  </tr>
                )}
                {data?.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 cursor-pointer" onClick={() => setSelected(item)}>
                      {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium cursor-pointer" onClick={() => setSelected(item)}>
                      {item.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => setSelected(item)}>
                      {ROLE_LABEL[item.role]}
                    </td>
                    <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => setSelected(item)}>
                      {item.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => setSelected(item)}>
                      {item.city || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as JoinRequestStatus)}
                        className={`text-xs border-0 rounded-full px-2.5 py-1 font-medium focus:ring-2 focus:ring-brand-red focus:outline-none appearance-none cursor-pointer ${STATUS_COLOR[item.status]}`}
                      >
                        <option value="NEW">{STATUS_LABEL.NEW}</option>
                        <option value="PROCESSING">{STATUS_LABEL.PROCESSING}</option>
                        <option value="ACCEPTED">{STATUS_LABEL.ACCEPTED}</option>
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

      {selected && <JoinRequestModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
