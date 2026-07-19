import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Link2 } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface DeputyRequestItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  publishedAt: string | null;
  translations: Array<{ lang: 'ru' | 'kz'; title: string; content: string }>;
}

interface DeputyRequestTranslation {
  title: string;
  content: string;
}

interface DeputyRequestForm {
  ru: DeputyRequestTranslation;
  kz: DeputyRequestTranslation;
  fileUrl: string;
  publishedAt: string;
}

const emptyForm: DeputyRequestForm = {
  ru: { title: '', content: '' },
  kz: { title: '', content: '' },
  fileUrl: '',
  publishedAt: '',
};

const LANGS = ['ru', 'kz'] as const;
type Lang = typeof LANGS[number];
const LANG_LABELS: Record<Lang, string> = { ru: 'РУ', kz: 'ҚЗ' };

export default function DeputyRequestEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Lang>('ru');
  const [form, setForm] = useState<DeputyRequestForm>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api.get<DeputyRequestItem>(`/cms/api/v1/deputy-requests/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const translation = (lang: Lang) => data.translations.find((item) => item.lang === lang);
        setForm({
          ru: { title: translation('ru')?.title ?? data.title, content: translation('ru')?.content ?? data.description ?? '' },
          kz: { title: translation('kz')?.title ?? '', content: translation('kz')?.content ?? '' },
          fileUrl: data.fileUrl,
          publishedAt: data.publishedAt ? data.publishedAt.slice(0, 16) : '',
        });
      })
      .catch(() => { if (!cancelled) setError('Не удалось загрузить депутатский запрос'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const save = async () => {
    if (!form.ru.title.trim() || !form.fileUrl.trim()) {
      setError('Заполните русский заголовок и ссылку на полный текст');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      translations: LANGS
        .filter((lang) => form[lang].title.trim())
        .map((lang) => ({ lang, title: form[lang].title.trim(), content: form[lang].content || undefined })),
      fileUrl: form.fileUrl.trim(),
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    };
    try {
      if (id) await api.put(`/cms/api/v1/deputy-requests/${id}`, payload);
      else await api.post('/cms/api/v1/deputy-requests', payload);
      navigate('/frakciya/zaprosy');
    } catch (requestError) {
      const responseError = requestError as { response?: { data?: { error?: string } } };
      setError(responseError.response?.data?.error ?? 'Не удалось сохранить депутатский запрос');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={28} /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/frakciya/zaprosy')} className="text-sm text-gray-500 hover:text-gray-700">
              ← Депутатские запросы
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-semibold text-gray-900">{isEdit ? 'Редактирование' : 'Новый депутатский запрос'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name ?? user?.email}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 font-medium">Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === lang ? 'border-b-2 border-red-600 text-red-600 bg-red-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {LANG_LABELS[lang]}
                  {form[lang].title.trim() && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                </button>
              ))}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Заголовок {activeTab === 'ru' ? '(обязательно)' : '(необязательно)'}
                </label>
                <input
                  value={form[activeTab].title}
                  onChange={(event) => setForm((current) => ({ ...current, [activeTab]: { ...current[activeTab], title: event.target.value } }))}
                  placeholder={`Заголовок депутатского запроса (${LANG_LABELS[activeTab]})...`}
                  className="w-full text-base font-medium border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Текст и краткое описание запроса ({LANG_LABELS[activeTab]})</label>
                <RichTextEditor
                  key={`${activeTab}-editor`}
                  value={form[activeTab].content}
                  onChange={(content) => setForm((current) => ({ ...current, [activeTab]: { ...current[activeTab], content } }))}
                  placeholder={`Введите содержание депутатского запроса (${LANG_LABELS[activeTab]})...`}
                  minHeight={320}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Публикация</h3>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Дата публикации</label>
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="w-full text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Сохранить изменения' : 'Опубликовать'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Полный текст запроса</h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ссылка (обязательно)</label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(event) => setForm((current) => ({ ...current, fileUrl: event.target.value }))}
                placeholder="https://..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
