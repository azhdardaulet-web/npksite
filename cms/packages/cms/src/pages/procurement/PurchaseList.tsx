import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePurchases, useDeletePurchase } from '@/hooks/usePurchases';
import ExcelImportModal from './ExcelImportModal';

export default function PurchaseList() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [yearFilter, typeFilter]);

  const filters = {
    ...(yearFilter && { year: Number(yearFilter) }),
    ...(typeFilter && { type: typeFilter }),
    ...(search && { q: search }),
  };

  const { data, isLoading, isError } = usePurchases(filters, page);
  const deleteMut = useDeletePurchase();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Удалить закупку «${name}»? Это действие необратимо.`)) {
      deleteMut.mutate(id);
    }
  };

  const handleExport = () => {
    const baseUrl = import.meta.env.VITE_API_URL ?? '';
    const params = new URLSearchParams();
    if (yearFilter) params.append('year', String(yearFilter));
    if (typeFilter) params.append('type', typeFilter);
    if (search) params.append('q', search);
    
    // Uses window.open to trigger the file download from the browser.
    window.open(`${baseUrl}/cms/api/v1/purchases/export?${params.toString()}`, '_blank');
  };

  const SelectField = ({
    value,
    onChange,
    children,
  }: {
    value: string | number;
    onChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
            <h1 className="text-base font-semibold text-gray-900">План закупок</h1>
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
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Управление планом закупок</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.total !== undefined ? `${data.total} записей` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Экспорт
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Upload size={16} />
              Импорт из Excel
            </button>
            {/* Inline add button (can be implemented later or ignored if Excel import is primary) */}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Поиск по наименованию..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SelectField value={yearFilter} onChange={(v) => setYearFilter(v ? Number(v) : '')}>
            <option value="">Все годы</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </SelectField>
          <SelectField value={typeFilter} onChange={setTypeFilter}>
            <option value="">Все способы</option>
            <option value="Тендер">Тендер</option>
            <option value="Запрос ценовых предложений">Запрос ценовых предложений</option>
            <option value="Из одного источника">Из одного источника</option>
            <option value="Открытый конкурс">Открытый конкурс</option>
          </SelectField>
          {(yearFilter || typeFilter || search) && (
            <button
              onClick={() => {
                setYearFilter('');
                setTypeFilter('');
                setSearchInput('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Table */}
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
                    <th className="font-medium text-gray-500 px-4 py-3 w-16">№</th>
                    <th className="font-medium text-gray-500 px-4 py-3 min-w-[200px]">Наименование</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-40">Способ закупки</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-40">Место поставки</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-24 text-right">Кол-во</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-32 text-right">Сумма</th>
                    <th className="font-medium text-gray-500 px-4 py-3 w-20">Год</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-400 py-12">
                        Записей не найдено
                      </td>
                    </tr>
                  )}
                  {data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{item.number}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {item.name}
                        {item.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1" title={item.description}>{item.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.procurementType}</td>
                      <td className="px-4 py-3 text-gray-600">{item.deliveryPlace || '—'}</td>
                      <td className="px-4 py-3 text-gray-900 text-right">
                        {item.quantity || '—'} {item.unit || ''}
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-right">
                        {item.estimatedAmount ? item.estimatedAmount.toLocaleString('ru-RU') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.year}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          title="Удалить"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
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

      {isImportModalOpen && (
        <ExcelImportModal onClose={() => setIsImportModalOpen(false)} />
      )}
    </div>
  );
}
