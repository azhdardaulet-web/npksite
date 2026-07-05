import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useSupplierForms,
  useUpdateSupplierFormStatus,
  SupplierFormStatus,
  SupplierFormItem,
} from '@/hooks/useSupplierForms';

const STATUS_LABEL: Record<SupplierFormStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В обработке',
  DONE: 'Обработана',
};

const STATUS_COLOR: Record<SupplierFormStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

function SupplierFormModal({ form, onClose }: { form: SupplierFormItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Заявка поставщика</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Компания</p>
              <p className="font-medium text-gray-900">{form.companyName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">БИН</p>
              <p className="font-medium text-gray-900">{form.bin}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Контактное лицо</p>
              <p className="font-medium text-gray-900">{form.contactPerson}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Должность</p>
              <p className="font-medium text-gray-900">{form.position || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Телефон</p>
              <p className="font-medium text-gray-900">{form.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{form.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 mb-1">Категория поставок</p>
              <p className="font-medium text-gray-900">{form.supplyCategory}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-1 text-sm">Описание деятельности</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap border border-gray-100">
              {form.description}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
            <span className="text-gray-500">Дата заявки:</span>
            <span className="font-medium text-gray-900">
              {new Date(form.createdAt).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupplierForms() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SupplierFormStatus | ''>('');
  const [selectedForm, setSelectedForm] = useState<SupplierFormItem | null>(null);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError } = useSupplierForms(filters, page);
  const updateStatusMut = useUpdateSupplierFormStatus();

  const handleStatusChange = (id: string, newStatus: SupplierFormStatus) => {
    updateStatusMut.mutate({ id, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← DAR Rail CMS
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-semibold text-gray-900">Заявки поставщиков</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name ?? user?.email}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 font-medium">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Анкеты потенциальных поставщиков</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.total !== undefined ? `${data.total} заявок` : ''}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as SupplierFormStatus | '');
              setPage(1);
            }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="NEW">Новые</option>
            <option value="IN_PROGRESS">В обработке</option>
            <option value="DONE">Обработаны</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Загрузка...
            </div>
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
                    <th className="font-medium text-gray-500 px-4 py-3 w-48">Дата</th>
                    <th className="font-medium text-gray-500 px-4 py-3 min-w-[200px]">Компания</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-32">БИН</th>
                    <th className="font-medium text-gray-500 px-4 py-3 min-w-[150px]">Контакты</th>
                    <th className="font-medium text-gray-500 px-4 py-3 min-w-[150px]">Сфера</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-40">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-12">
                        Заявок не найдено
                      </td>
                    </tr>
                  )}
                  {data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td 
                        className="px-4 py-3 text-gray-500 cursor-pointer"
                        onClick={() => setSelectedForm(item)}
                      >
                        {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td 
                        className="px-4 py-3 text-gray-900 font-medium cursor-pointer"
                        onClick={() => setSelectedForm(item)}
                      >
                        {item.companyName}
                      </td>
                      <td 
                        className="px-4 py-3 text-gray-500 cursor-pointer"
                        onClick={() => setSelectedForm(item)}
                      >
                        {item.bin}
                      </td>
                      <td 
                        className="px-4 py-3 text-gray-600 cursor-pointer"
                        onClick={() => setSelectedForm(item)}
                      >
                        <div className="line-clamp-1" title={item.contactPerson}>{item.contactPerson}</div>
                        <div className="text-xs text-gray-400">{item.phone}</div>
                      </td>
                      <td 
                        className="px-4 py-3 text-gray-600 cursor-pointer"
                        onClick={() => setSelectedForm(item)}
                      >
                        <div className="line-clamp-2" title={item.supplyCategory}>{item.supplyCategory}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as SupplierFormStatus)}
                          className={`text-xs border-0 rounded-full px-2.5 py-1 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer ${STATUS_COLOR[item.status]}`}
                        >
                          <option value="NEW">{STATUS_LABEL['NEW']}</option>
                          <option value="IN_PROGRESS">{STATUS_LABEL['IN_PROGRESS']}</option>
                          <option value="DONE">{STATUS_LABEL['DONE']}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-500">
                    Страница {data.page} из {data.totalPages}
                  </span>
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
      </main>

      {selectedForm && (
        <SupplierFormModal form={selectedForm} onClose={() => setSelectedForm(null)} />
      )}
    </div>
  );
}
