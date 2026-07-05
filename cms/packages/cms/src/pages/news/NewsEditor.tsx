import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronUp, ImageIcon, Loader2, Sparkles, Copy, Check, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNewsItem, useCreateNews, useUpdateNews, usePublishNews } from '@/hooks/useNews';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useMediaPicker } from '@/components/MediaLibrary/MediaPicker';

// ─── Form schema ──────────────────────────────────────────────────────────────

const translationSchema = z.object({
  title: z.string().max(500).default(''),
  content: z.string().default(''),
  excerpt: z.string().max(1000).default(''),
  seoTitle: z.string().max(200).default(''),
  seoDescription: z.string().max(500).default(''),
  ogImageUrl: z.string().max(500).default(''),
});

const newsFormSchema = z.object({
  type: z.enum(['press', 'article', 'media_mention']),
  category: z.enum(['corporate', 'industry', 'safety', 'hr', 'esg', 'financial']),
  imageUrl: z.string().default(''),
  ru: translationSchema,
  kz: translationSchema,
  en: translationSchema,
  zh: translationSchema,
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGS = ['ru', 'kz', 'en', 'zh'] as const;
type Lang = typeof LANGS[number];

const LANG_LABELS: Record<Lang, string> = { ru: 'РУ', kz: 'ҚЗ', en: 'ENG', zh: '中文' };

const TYPE_OPTIONS = [
  { value: 'press', label: 'Пресс-релиз' },
  { value: 'article', label: 'Статья' },
  { value: 'media_mention', label: 'СМИ о нас' },
];

const CATEGORY_OPTIONS = [
  { value: 'corporate', label: 'Корпоративные' },
  { value: 'industry', label: 'Отрасль' },
  { value: 'safety', label: 'Безопасность' },
  { value: 'hr', label: 'Персонал' },
  { value: 'esg', label: 'ESG' },
  { value: 'financial', label: 'Финансы' },
];

const emptyTranslation = { title: '', content: '', excerpt: '', seoTitle: '', seoDescription: '', ogImageUrl: '' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewsEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Lang>('ru');
  const [seoOpen, setSeoOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [generatingLang, setGeneratingLang] = useState<Lang | null>(null);
  const [publishDate, setPublishDate] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);
  const slugRef = useRef<HTMLInputElement>(null);

  const { open: openCoverPicker, element: coverPickerEl } = useMediaPicker();

  const { data: existing, isLoading: loadingExisting } = useNewsItem(id);
  const createMut = useCreateNews();
  const updateMut = useUpdateNews();
  const publishMut = usePublishNews();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      type: 'article',
      category: 'corporate',
      imageUrl: '',
      ru: emptyTranslation,
      kz: emptyTranslation,
      en: emptyTranslation,
      zh: emptyTranslation,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (!existing) return;
    const t = (lang: Lang) => {
      const found = existing.translations.find((tr) => tr.lang === lang);
      if (!found) return emptyTranslation;
      return {
        title: found.title,
        content: found.content,
        excerpt: found.excerpt ?? '',
        seoTitle: found.seoTitle ?? '',
        seoDescription: found.seoDescription ?? '',
        ogImageUrl: found.ogImageUrl ?? '',
      };
    };
    reset({
      type: existing.type,
      category: existing.category,
      imageUrl: existing.imageUrl ?? '',
      ru: t('ru'),
      kz: t('kz'),
      en: t('en'),
      zh: t('zh'),
    });
  }, [existing, reset]);

  const buildPayload = (values: NewsFormValues) => {
    const translations = LANGS
      .filter((lang) => values[lang].title.trim())
      .map((lang) => ({
        lang,
        title: values[lang].title,
        content: values[lang].content || '<p></p>',
        excerpt: values[lang].excerpt || undefined,
        seoTitle: values[lang].seoTitle || undefined,
        seoDescription: values[lang].seoDescription || undefined,
        ogImageUrl: values[lang].ogImageUrl || undefined,
      }));

    if (translations.length === 0) {
      throw new Error('Добавьте заголовок хотя бы для одного языка');
    }

    return {
      type: values.type,
      category: values.category,
      imageUrl: values.imageUrl || undefined,
      translations,
    };
  };

  const handleSaveDraft = handleSubmit(async (values) => {
    setSaveError('');
    setIsSaving(true);
    try {
      const payload = buildPayload(values);
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, ...payload });
      } else {
        const news = await createMut.mutateAsync(payload);
        navigate(`/news/${news.id}/edit`, { replace: true });
      }
    } catch (err) {
      const e = err as { message?: string };
      setSaveError(e.message ?? 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  });

  const handlePublish = handleSubmit(async (values) => {
    setSaveError('');
    setIsSaving(true);
    try {
      const payload = buildPayload(values);
      let newsId = id;
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, ...payload });
      } else {
        const news = await createMut.mutateAsync(payload);
        newsId = news.id;
        navigate(`/news/${news.id}/edit`, { replace: true });
      }
      if (newsId) {
        await publishMut.mutateAsync({
          id: newsId,
          scheduledAt: publishDate ? new Date(publishDate).toISOString() : undefined,
        });
      }
    } catch (err) {
      const e = err as { message?: string };
      setSaveError(e.message ?? 'Ошибка публикации');
    } finally {
      setIsSaving(false);
    }
  });

  const isFilled = (lang: Lang) => {
    const v = watch(lang);
    return v.title.trim().length > 0;
  };

  const LANG_NAMES: Record<Lang, string> = { ru: 'русский', kz: 'казахский', en: 'английский', zh: 'китайский' };

  const handleGenerate = async (targetLang: Lang) => {
    const provider = localStorage.getItem('cms_ai_provider');
    const apiKey = localStorage.getItem('cms_ai_key');
    const model = localStorage.getItem('cms_ai_model') ?? 'gpt-4o';

    if (!apiKey) {
      alert('AI-ключ не настроен. Перейдите в Настройки → Интеграции → ИИ и сохраните API-ключ.');
      return;
    }

    const ruValues = watch('ru');
    if (!ruValues.title.trim()) {
      alert('Сначала заполните заголовок на русском языке.');
      return;
    }

    const prompt = `Ты профессиональный переводчик пресс-релизов для железнодорожной компании DAR Rail (Казахстан).
Переведи следующий материал на ${LANG_NAMES[targetLang]} язык. Сохрани HTML-теги если они есть.
Верни JSON строго в формате: {"title":"...","content":"...","excerpt":"..."}
Не добавляй ничего лишнего — только JSON.

ЗАГОЛОВОК: ${ruValues.title}
ТЕКСТ: ${ruValues.content || ''}
КРАТКОЕ ОПИСАНИЕ: ${ruValues.excerpt || ''}`;

    setGeneratingLang(targetLang);
    try {
      let resultJson: { title: string; content: string; excerpt: string } | null = null;

      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          }),
        });
        if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
        const data = await res.json();
        resultJson = JSON.parse(data.choices[0].message.content);
      } else if (provider === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (!res.ok) throw new Error(`Claude error ${res.status}`);
        const data = await res.json();
        resultJson = JSON.parse(data.content[0].text);
      } else if (provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        if (!res.ok) throw new Error(`Gemini error ${res.status}`);
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        resultJson = JSON.parse(text.replace(/```json\n?|```/g, '').trim());
      }

      if (resultJson) {
        if (resultJson.title) setValue(`${targetLang}.title`, resultJson.title, { shouldDirty: true });
        if (resultJson.content) setValue(`${targetLang}.content`, resultJson.content, { shouldDirty: true });
        if (resultJson.excerpt) setValue(`${targetLang}.excerpt`, resultJson.excerpt, { shouldDirty: true });
      }
    } catch (err) {
      const e = err as { message?: string };
      alert(`Ошибка генерации: ${e.message ?? 'Неизвестная ошибка'}`);
    } finally {
      setGeneratingLang(null);
    }
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-medium text-gray-600 mb-1">{children}</label>
  );

  const TextInput = ({
    name,
    placeholder,
    className = '',
  }: {
    name: Parameters<typeof register>[0];
    placeholder?: string;
    className?: string;
  }) => (
    <input
      {...register(name)}
      placeholder={placeholder}
      className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );

  const currentImageUrl = watch('imageUrl');

  if (isEdit && loadingExisting) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Новости
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-semibold text-gray-900">
              {isEdit ? 'Редактирование' : 'Новая статья'}
            </h1>
            {isEdit && existing && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  existing.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-700'
                    : existing.status === 'ARCHIVED'
                    ? 'bg-red-100 text-red-600'
                    : existing.status === 'SCHEDULED'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {existing.status === 'PUBLISHED'
                  ? 'Опубликовано'
                  : existing.status === 'ARCHIVED'
                  ? 'Архив'
                  : existing.status === 'SCHEDULED'
                  ? 'Запланировано'
                  : 'Черновик'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name ?? user?.email}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 font-medium">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <div className="space-y-4">
          {/* Language tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              <div className="flex flex-1">
                {LANGS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === lang
                        ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {LANG_LABELS[lang]}
                    {isFilled(lang) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </button>
                ))}
              </div>
              {activeTab !== 'ru' && (
                <button
                  type="button"
                  onClick={() => handleGenerate(activeTab)}
                  disabled={generatingLang === activeTab}
                  className="flex items-center gap-1.5 mr-3 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-60"
                >
                  {generatingLang === activeTab
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Sparkles size={13} />
                  }
                  {generatingLang === activeTab ? 'Генерирую...' : 'Генерировать из РУ'}
                </button>
              )}
            </div>

            <div className="p-5">
              {LANGS.map((lang) => (
                <div key={lang} className={lang !== activeTab ? 'hidden' : 'space-y-4'}>
                  {/* Title */}
                  <div>
                    <Label>Заголовок {lang === 'ru' ? '(обязательно)' : '(необязательно)'}</Label>
                    <TextInput
                      name={`${lang}.title`}
                      placeholder={`Заголовок на ${LANG_LABELS[lang]}...`}
                      className="text-base font-medium"
                    />
                  </div>

                  {/* Rich text editor */}
                  <div>
                    <Label>Текст статьи</Label>
                    <Controller
                      control={control}
                      name={`${lang}.content`}
                      render={({ field }) => (
                        <RichTextEditor
                          key={`${lang}-editor`}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={`Текст статьи (${LANG_LABELS[lang]})...`}
                          minHeight={320}
                        />
                      )}
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <Label>Краткое описание (необязательно — автоматически из текста)</Label>
                    <textarea
                      {...register(`${lang}.excerpt`)}
                      rows={2}
                      placeholder="Краткое описание для превью..."
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* SEO section (collapsible) */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setSeoOpen((v) => !v)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors"
                    >
                      SEO настройки
                      {seoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {seoOpen && (
                      <div className="p-3 space-y-3 bg-white">
                        <div>
                          <Label>SEO заголовок (до 200 символов)</Label>
                          <TextInput name={`${lang}.seoTitle`} placeholder="SEO Title..." />
                        </div>
                        <div>
                          <Label>SEO описание (до 500 символов)</Label>
                          <textarea
                            {...register(`${lang}.seoDescription`)}
                            rows={2}
                            placeholder="Meta Description..."
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label>OG Image URL</Label>
                          <TextInput name={`${lang}.ogImageUrl`} placeholder="https://..." />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Публикация</h3>

            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
            )}

            {/* Date/time picker */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Дата публикации (необязательно)
              </label>
              <input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              {publishDate && (
                <p className="text-xs text-blue-600 mt-1">
                  Будет опубликовано: {new Date(publishDate).toLocaleString('ru-RU')}
                </p>
              )}
            </div>

            {/* Show on homepage toggle */}
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Home size={14} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Показать на главной</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOnHomepage((v) => !v)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  showOnHomepage ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    showOnHomepage ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="w-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Сохранить черновик
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isSaving}
              className="w-full text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {publishDate ? 'Запланировать' : 'Опубликовать'}
            </button>
          </div>

          {/* Type & Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Классификация</h3>

            <div>
              <Label>Тип материала</Label>
              <select
                {...register('type')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Категория</Label>
              <select
                {...register('category')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Обложка</h3>

            {currentImageUrl ? (
              <div className="space-y-2">
                <img
                  src={currentImageUrl}
                  alt="Обложка"
                  className="w-full h-32 object-cover rounded-lg border border-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openCoverPicker((url) => setValue('imageUrl', url, { shouldDirty: true }), 'image/*')
                    }
                    className="flex-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg py-1.5"
                  >
                    Заменить
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('imageUrl', '', { shouldDirty: true })}
                    className="flex-1 text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-lg py-1.5"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openCoverPicker((url) => setValue('imageUrl', url, { shouldDirty: true }), 'image/*')
                }
                className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-lg py-6 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <ImageIcon size={20} />
                <span className="text-xs">Выбрать из медиабиблиотеки</span>
              </button>
            )}

            {/* Manual URL fallback */}
            <div>
              <Label>Или введите URL</Label>
              <TextInput name="imageUrl" placeholder="https://..." />
            </div>
          </div>

          {/* Info */}
          {isEdit && existing && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Информация</h3>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL-адрес (slug)</label>
                <div className="flex items-center gap-1">
                  <input
                    ref={slugRef}
                    readOnly
                    value={existing.slug}
                    className="flex-1 text-xs font-mono border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    title="Скопировать"
                    onClick={() => {
                      navigator.clipboard.writeText(existing.slug);
                      setSlugCopied(true);
                      setTimeout(() => setSlugCopied(false), 1500);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {slugCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div>Автор: <span className="text-gray-700">{existing.author.name}</span></div>
                {existing.readingTime && <div>Время чтения: {existing.readingTime} мин</div>}
                {existing.publishedAt && (
                  <div>
                    Опубликовано:{' '}
                    <span className="text-gray-700">
                      {new Date(existing.publishedAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                )}
                {existing.scheduledAt && !existing.publishedAt && (
                  <div>
                    Запланировано:{' '}
                    <span className="text-blue-600">
                      {new Date(existing.scheduledAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                )}
                <div className={isDirty ? 'text-amber-600' : 'text-green-600'}>
                  {isDirty ? '● Есть несохранённые изменения' : '✓ Сохранено'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cover image media picker portal */}
      {coverPickerEl}
    </div>
  );
}
