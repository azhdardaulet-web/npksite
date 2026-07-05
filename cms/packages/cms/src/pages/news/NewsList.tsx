import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Archive, RotateCcw, ChevronLeft, ChevronRight, FileUp, HardDrive, RefreshCw, ImageOff, Link2, Star, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useNews,
  usePublishNews,
  useArchiveNews,
  useDraftNews,
  useDeleteNews,
  useCreateNews,
  useToggleFeatured,
  NewsListItem,
  NewsStatus,
} from '@/hooks/useNews';
import { getLocalNews, type LocalNewsItem } from './WordImporter';

// ─── Labels / colours ─────────────────────────────────────────────────────────

const FORMAT_LABELS: Record<string, string> = {
  news: 'Новости',
  party_release: 'Релизы партии',
  article: 'Статьи',
  analytics: 'Аналитика',
  interview: 'Интервью',
};

const STATUS_LABEL: Record<NewsStatus, string> = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликовано',
  ARCHIVED: 'Архив',
  SCHEDULED: 'Запланировано',
};

const STATUS_COLOR: Record<NewsStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-600',
  SCHEDULED: 'bg-blue-100 text-blue-700',
};

const LANG_DISPLAY: Record<string, string> = { ru: 'РУ', kz: 'ҚЗ' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewsList() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter change
  useEffect(() => { setPage(1); setSelectedIds(new Set()); }, [statusFilter, formatFilter, langFilter, pageSize]);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(formatFilter && { format: formatFilter }),
    ...(search && { q: search }),
  };

  const { data, isLoading, isError } = useNews(filters, page, pageSize);
  const publishMut = usePublishNews();
  const archiveMut = useArchiveNews();
  const draftMut = useDraftNews();
  const deleteMut = useDeleteNews();
  const createMut = useCreateNews();
  const featuredMut = useToggleFeatured();

  const [localNews, setLocalNews] = useState<LocalNewsItem[]>(() => getLocalNews());
  const [syncingLocal, setSyncingLocal] = useState(false);

  const refreshLocalNews = () => setLocalNews(getLocalNews());

  const handleSyncLocal = async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) { navigate('/login'); return; }
    setSyncingLocal(true);
    const remaining: LocalNewsItem[] = [];
    for (const item of localNews) {
      try {
        const created = await createMut.mutateAsync({
          format: item.format,
          imageUrl: item.imageUrl,
          translations: item.translations.map(t => ({
            lang: t.lang as 'ru' | 'kz',
            title: t.title,
            content: t.content,
            excerpt: t.excerpt,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
          })),
        });
        await publishMut.mutateAsync({ id: created.id, scheduledAt: item.publishedAt || undefined });
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem('npk_local_news', JSON.stringify(remaining));
    setLocalNews(remaining);
    setSyncingLocal(false);
  };

  const handleDelete = (item: NewsListItem) => {
    const title = item.translations[0]?.title ?? item.id;
    if (window.confirm(`Удалить новость «${title}»? Это действие необратимо.`)) {
      deleteMut.mutate(item.id);
    }
  };

  const handleStatusAction = (item: NewsListItem) => {
    if (item.status === 'DRAFT' || item.status === 'SCHEDULED') {
      publishMut.mutate({ id: item.id });
    } else if (item.status === 'PUBLISHED') {
      const title = item.translations[0]?.title ?? item.id;
      if (window.confirm(`Архивировать новость «${title}»?`)) {
        archiveMut.mutate(item.id);
      }
    } else if (item.status === 'ARCHIVED') {
      draftMut.mutate(item.id);
    }
  };

  const statusActionLabel = (status: NewsStatus) => {
    if (status === 'DRAFT' || status === 'SCHEDULED') return 'Опубликовать';
    if (status === 'PUBLISHED') return 'В архив';
    return 'В черновик';
  };

  const StatusActionIcon = ({ status }: { status: NewsStatus }) => {
    if (status === 'DRAFT' || status === 'SCHEDULED') return <Eye size={14} />;
    if (status === 'PUBLISHED') return <Archive size={14} />;
    return <RotateCcw size={14} />;
  };

  const SelectField = ({
    value,
    onChange,
    children,
  }: {
    value: string;
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
              ← НПК CMS
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-semibold text-gray-900">Новости</h1>
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
            <h2 className="text-xl font-bold text-gray-900">Управление новостями</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.total !== undefined ? `${data.total} материалов` : ''}
              {selectedIds.size > 0 && (
                <span className="ml-2 text-red-600 font-medium">· выбрано {selectedIds.size}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Per-page selector */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="hidden sm:inline">Показывать:</span>
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setPageSize(n)}
                  className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pageSize === n
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/news/import')}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FileUp size={16} />
              Импорт из Word
            </button>
            <button
              onClick={() => navigate('/news/new')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Новая статья
            </button>
          </div>
        </div>

        {/* Local news banner */}
        {localNews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-800">
                {localNews.length} статей сохранено локально (из Word-импорта)
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Войдите в систему и нажмите «Синхронизировать», чтобы загрузить их на сервер.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSyncLocal}
                disabled={syncingLocal}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {syncingLocal
                  ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Синхронизация…</>
                  : <><RefreshCw className="w-3.5 h-3.5" />Синхронизировать</>}
              </button>
              <button
                onClick={refreshLocalNews}
                className="px-3 py-2 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Список
              </button>
            </div>
          </div>
        )}

        {/* Language tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4 flex items-center overflow-hidden">
          {[
            { value: '', label: 'Все языки' },
            { value: 'ru', label: 'РУ' },
            { value: 'kz', label: 'ҚЗ' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setLangFilter(tab.value)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                langFilter === tab.value
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Поиск по заголовку..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SelectField value={statusFilter} onChange={setStatusFilter}>
            <option value="">Все статусы</option>
            <option value="DRAFT">Черновик</option>
            <option value="PUBLISHED">Опубликовано</option>
            <option value="SCHEDULED">Запланировано</option>
            <option value="ARCHIVED">Архив</option>
          </SelectField>
          <SelectField value={formatFilter} onChange={setFormatFilter}>
            <option value="">Все форматы</option>
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          {(statusFilter || formatFilter || langFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setFormatFilter('');
                setLangFilter('');
                setSearchInput('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={
                          (data?.data.length ?? 0) > 0 &&
                          (data?.data ?? [])
                            .filter(i => !langFilter || i.translations.some(t => t.lang === langFilter))
                            .every(i => selectedIds.has(i.id))
                        }
                        onChange={(e) => {
                          const visible = (data?.data ?? []).filter(
                            i => !langFilter || i.translations.some(t => t.lang === langFilter)
                          );
                          setSelectedIds(
                            e.target.checked ? new Set(visible.map(i => i.id)) : new Set()
                          );
                        }}
                      />
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3 w-12">Фото</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">Заголовок / URL</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3 w-28">Формат</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3 w-24">Статус</th>
                    <th className="text-center font-medium text-gray-500 px-3 py-3 w-24">На главной</th>
                    <th className="text-center font-medium text-gray-500 px-3 py-3 w-20">Telegram</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3 w-24">Дата</th>
                    <th className="px-4 py-3 w-28">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-12">
                        Новостей не найдено
                      </td>
                    </tr>
                  )}
                  {data?.data
                    .filter((item) =>
                      langFilter
                        ? item.translations.some((t) => t.lang === langFilter)
                        : true
                    )
                    .map((item) => {
                    const ruTitle =
                      item.translations.find((t) => t.lang === 'ru')?.title ??
                      item.translations[0]?.title ??
                      '—';
                    const langs = item.translations.map((t) => t.lang);
                    const dateStr = item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString('ru-RU')
                      : new Date(item.createdAt).toLocaleDateString('ru-RU');
                    const isSelected = selectedIds.has(item.id);

                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={isSelected}
                            onChange={(e) => {
                              setSelectedIds(prev => {
                                const next = new Set(prev);
                                e.target.checked ? next.add(item.id) : next.delete(item.id);
                                return next;
                              });
                            }}
                          />
                        </td>
                        {/* Image thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageOff size={14} className="text-gray-300" />
                            )}
                          </div>
                        </td>
                        {/* Title + slug */}
                        <td className="px-4 py-3 min-w-0">
                          <div className="font-medium text-gray-900 line-clamp-1">{ruTitle}</div>
                          {item.slug && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Link2 size={11} className="text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
                                {item.slug}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {(['ru', 'kz'] as const).map((lang) => (
                              <span
                                key={lang}
                                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                  langs.includes(lang)
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {LANG_DISPLAY[lang]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {FORMAT_LABELS[item.format] ?? item.format}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.status]}`}
                          >
                            {STATUS_LABEL[item.status]}
                          </span>
                        </td>
                        {/* На главной toggle */}
                        <td className="px-3 py-3 text-center">
                          <button
                            title={item.isFeatured ? 'Убрать с главной' : 'Показать на главной'}
                            onClick={() => featuredMut.mutate(item.id)}
                            disabled={featuredMut.isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              item.isFeatured
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Star size={11} className={item.isFeatured ? 'fill-amber-500' : ''} />
                            {item.isFeatured ? 'Вкл' : 'Выкл'}
                          </button>
                        </td>
                        {/* Telegram status */}
                        <td className="px-3 py-3 text-center">
                          {item.tgSkip ? (
                            <span className="text-xs text-gray-400">Отключено</span>
                          ) : item.tgPosted ? (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600" title="Опубликовано в Telegram">
                              <Send size={11} /> ✓
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{dateStr}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Редактировать"
                              onClick={() => navigate(`/news/${item.id}/edit`)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              title={statusActionLabel(item.status)}
                              onClick={() => handleStatusAction(item)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <StatusActionIcon status={item.status} />
                            </button>
                            <button
                              title="Удалить"
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
    </div>
  );
}
