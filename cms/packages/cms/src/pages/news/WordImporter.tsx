import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle2, XCircle,
  ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, RefreshCw, HardDrive, LogIn,
} from 'lucide-react';
import JSZip from 'jszip';
import { useCreateNews, usePublishNews, type NewsType, type NewsCategory } from '@/hooks/useNews';
import { useAuthStore } from '@/store/authStore';

// ─── Local storage helpers ────────────────────────────────────────────────────

const LOCAL_NEWS_KEY = 'darrail_local_news';

export interface LocalNewsItem {
  id: string;
  orderNum: number;
  slug: string;
  type: NewsType;
  category: NewsCategory;
  imageUrl: string;
  publishedAt: string;
  status: 'LOCAL';
  createdAt: string;
  translations: {
    lang: string;
    title: string;
    content: string;
    excerpt: string;
    seoTitle: string;
    seoDescription: string;
  }[];
}

export function getLocalNews(): LocalNewsItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_NEWS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveLocalNews(items: LocalNewsItem[]) {
  localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(items));
}

function addLocalNews(items: LocalNewsItem[]) {
  const existing = getLocalNews();
  const bySlug = new Map(existing.map(i => [i.slug, i]));
  for (const item of items) bySlug.set(item.slug, item);
  saveLocalNews(Array.from(bySlug.values()));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LangData {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

interface ParsedArticle {
  orderNum: number;
  ru: LangData;
  kz: LangData;
  publishedAt: string;
  selected: boolean;
  type: NewsType;
  category: NewsCategory;
  imageUrl: string;
}

type ImportStatus = 'idle' | 'uploading' | 'parsed' | 'importing' | 'done';

interface ImportResult {
  orderNum: number;
  title: string;
  success: boolean;
  error?: string;
}

// ─── Docx parser ──────────────────────────────────────────────────────────────

async function extractTextFromDocx(file: File): Promise<string[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);
  const docXml = await loaded.file('word/document.xml')!.async('string');

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXml, 'application/xml');

  const paragraphs: string[] = [];
  const pNodes = doc.getElementsByTagNameNS('*', 'p');

  for (let i = 0; i < pNodes.length; i++) {
    const tNodes = pNodes[i].getElementsByTagNameNS('*', 't');
    let line = '';
    for (let j = 0; j < tNodes.length; j++) {
      line += tNodes[j].textContent ?? '';
    }
    const trimmed = line.trim();
    if (trimmed) paragraphs.push(trimmed);
  }

  return paragraphs;
}

// Label-only markers (value on the next line)
const LABEL_MARKERS: [RegExp, 'slug' | 'seoTitle' | 'seoDescription' | 'skip'][] = [
  [/^URL:\s*$/, 'slug'],
  [/^SEO Заголовок:\s*$/, 'seoTitle'],
  [/^Meta Описание:\s*$/, 'seoDescription'],
  [/^Meta Сипаттама:\s*$/, 'seoDescription'],
  [/^Meta Description:\s*$/, 'seoDescription'],
  [/^Порядковый номер:\s*$/, 'skip'],
  [/^Meta Ключевые слова:\s*$/, 'skip'],
  [/^Meta Кілт сөздер:\s*$/, 'skip'],
  [/^Meta Keywords:\s*$/, 'skip'],
];

// Inline label+value (value on same line after colon)
const INLINE_MARKERS: [RegExp, 'slug' | 'seoTitle' | 'seoDescription'][] = [
  [/^URL:\s+(.+)/, 'slug'],
  [/^SEO Заголовок:\s+(.+)/, 'seoTitle'],
  [/^Meta Описание:\s+(.+)/i, 'seoDescription'],
  [/^Meta Сипаттама:\s+(.+)/i, 'seoDescription'],
  [/^Meta Description:\s+(.+)/i, 'seoDescription'],
];

// Lines that are purely metadata and should never appear in body
const META_LINE = /^(URL|SEO Заголовок|Meta Описание|Meta Сипаттама|Meta Description|Порядковый номер|Meta Ключевые|Meta Кілт|Meta Keywords)/i;

function parseLangSection(lines: string[]): LangData {
  let title = '';
  let slug = '';
  let seoTitle = '';
  let seoDescription = '';
  const bodyLines: string[] = [];
  let titleSet = false;

  // State machine: what the NEXT line's value should be assigned to
  type NextField = 'slug' | 'seoTitle' | 'seoDescription' | 'skip' | null;
  let nextField: NextField = null;

  for (const line of lines) {
    // If previous line was a label-only marker, this line is the value
    if (nextField !== null) {
      if (nextField === 'slug') slug = line;
      else if (nextField === 'seoTitle') seoTitle = line;
      else if (nextField === 'seoDescription') seoDescription = line;
      // 'skip' → discard
      nextField = null;
      continue;
    }

    // Check label-only markers (e.g. "URL:\n" "dar-rail-...\n")
    let foundLabel = false;
    for (const [regex, field] of LABEL_MARKERS) {
      if (regex.test(line)) { nextField = field; foundLabel = true; break; }
    }
    if (foundLabel) continue;

    // Check inline markers (e.g. "URL: dar-rail-...")
    let foundInline = false;
    for (const [regex, field] of INLINE_MARKERS) {
      const m = line.match(regex);
      if (m) {
        if (field === 'slug') slug = m[1].trim();
        else if (field === 'seoTitle') seoTitle = m[1].trim();
        else if (field === 'seoDescription') seoDescription = m[1].trim();
        foundInline = true;
        break;
      }
    }
    if (foundInline) continue;

    // Skip meta lines (keywords, order numbers, bare number after "Порядковый номер:")
    if (META_LINE.test(line)) continue;

    // Body / title
    if (!titleSet) {
      title = line;
      titleSet = true;
    } else {
      bodyLines.push(line);
    }
  }

  const content = bodyLines.join('\n\n');
  return { title, content, seoTitle, seoDescription, slug };
}

function parseArticles(lines: string[]): ParsedArticle[] {
  const SEPARATOR = /^─{10,}$/;
  const articles: ParsedArticle[] = [];

  // Split into sections by separator
  const sections: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (SEPARATOR.test(line)) {
      if (current.length) { sections.push(current); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length) sections.push(current);

  for (const section of sections) {
    // Find "Статья #N"
    const articleLine = section.find(l => /^Статья\s*#\d+/.test(l));
    if (!articleLine) continue;

    const orderNum = parseInt(articleLine.match(/(\d+)/)?.[1] ?? '0');
    if (!orderNum) continue;

    // Find language boundaries
    const ruIdx = section.findIndex(l => /🇷🇺|РУССКИЙ/.test(l));
    const kzIdx = section.findIndex(l => /🇰🇿|ҚАЗАҚША|КАЗАХСКИЙ/.test(l));

    let ruLines: string[] = [];
    let kzLines: string[] = [];

    if (ruIdx >= 0 && kzIdx > ruIdx) {
      ruLines = section.slice(ruIdx + 1, kzIdx);
      kzLines = section.slice(kzIdx + 1);
    } else if (ruIdx >= 0) {
      ruLines = section.slice(ruIdx + 1);
    } else if (kzIdx >= 0) {
      kzLines = section.slice(kzIdx + 1);
    }

    const ru = parseLangSection(ruLines);
    const kz = parseLangSection(kzLines);

    if (!ru.title && !kz.title) continue;

    articles.push({
      orderNum,
      ru,
      kz,
      publishedAt: '',
      selected: true,
      type: 'article',
      category: 'corporate',
      imageUrl: '',
    });
  }

  // Sort by order number
  articles.sort((a, b) => a.orderNum - b.orderNum);
  return articles;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: NewsType; label: string }[] = [
  { value: 'press', label: 'Пресс-релиз' },
  { value: 'article', label: 'Статья' },
  { value: 'media_mention', label: 'СМИ о нас' },
];

const CATEGORY_OPTIONS: { value: NewsCategory; label: string }[] = [
  { value: 'corporate', label: 'Корпоративные' },
  { value: 'industry', label: 'Отрасль' },
  { value: 'safety', label: 'Безопасность' },
  { value: 'hr', label: 'Персонал' },
  { value: 'esg', label: 'ESG' },
  { value: 'financial', label: 'Финансы' },
];

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WordImporter() {
  const navigate = useNavigate();
  const createMut = useCreateNews();
  const publishMut = usePublishNews();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuthStore();
  const hasAuth = !!accessToken;

  const [status, setStatus] = useState<ImportStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [useLocalMode, setUseLocalMode] = useState(false);

  // Batch settings
  const [batchDate, setBatchDate] = useState('');
  const [batchType, setBatchType] = useState<NewsType>('article');
  const [batchCategory, setBatchCategory] = useState<NewsCategory>('corporate');
  const [batchImage, setBatchImage] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      setParseError('Поддерживаются только файлы .docx');
      return;
    }
    setFileName(file.name);
    setStatus('uploading');
    setParseError('');
    try {
      const lines = await extractTextFromDocx(file);
      const parsed = parseArticles(lines);
      if (parsed.length === 0) {
        setParseError('Не удалось найти статьи. Проверьте формат документа.');
        setStatus('idle');
        return;
      }
      setArticles(parsed);
      setStatus('parsed');
    } catch (e) {
      setParseError(`Ошибка чтения файла: ${e instanceof Error ? e.message : String(e)}`);
      setStatus('idle');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const applyBatchSettings = () => {
    setArticles(prev => prev.map(a => ({
      ...a,
      type: batchType,
      category: batchCategory,
      imageUrl: batchImage,
      publishedAt: batchDate || a.publishedAt,
    })));
  };

  const toggleRow = (orderNum: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(orderNum) ? next.delete(orderNum) : next.add(orderNum);
      return next;
    });
  };

  const toggleSelect = (orderNum: number) => {
    setArticles(prev => prev.map(a =>
      a.orderNum === orderNum ? { ...a, selected: !a.selected } : a
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = articles.every(a => a.selected);
    setArticles(prev => prev.map(a => ({ ...a, selected: !allSelected })));
  };

  const updateArticle = <K extends keyof ParsedArticle>(
    orderNum: number, key: K, value: ParsedArticle[K]
  ) => {
    setArticles(prev => prev.map(a => a.orderNum === orderNum ? { ...a, [key]: value } : a));
  };

  const handleImport = async () => {
    const toImport = articles.filter(a => a.selected);
    if (!toImport.length) return;

    setStatus('importing');
    const res: ImportResult[] = [];

    if (useLocalMode) {
      // ── Local storage mode (no backend needed) ──────────────────────────────
      const localItems: LocalNewsItem[] = toImport.map(article => {
        const translations = [];
        if (article.ru.title) {
          translations.push({
            lang: 'ru',
            title: article.ru.title,
            content: article.ru.content,
            excerpt: article.ru.content.slice(0, 200) + (article.ru.content.length > 200 ? '…' : ''),
            seoTitle: article.ru.seoTitle || article.ru.title,
            seoDescription: article.ru.seoDescription,
          });
        }
        if (article.kz.title) {
          translations.push({
            lang: 'kz',
            title: article.kz.title,
            content: article.kz.content,
            excerpt: article.kz.content.slice(0, 200) + (article.kz.content.length > 200 ? '…' : ''),
            seoTitle: article.kz.seoTitle || article.kz.title,
            seoDescription: article.kz.seoDescription,
          });
        }
        return {
          id: `local_${article.orderNum}_${Date.now()}`,
          orderNum: article.orderNum,
          slug: article.ru.slug || article.kz.slug || `article-${article.orderNum}`,
          type: article.type,
          category: article.category,
          imageUrl: article.imageUrl || batchImage,
          publishedAt: article.publishedAt || new Date().toISOString().split('T')[0],
          status: 'LOCAL' as const,
          createdAt: new Date().toISOString(),
          translations,
        };
      });

      addLocalNews(localItems);
      for (const item of localItems) {
        res.push({
          orderNum: item.orderNum,
          title: item.translations.find(t => t.lang === 'ru')?.title ?? item.translations[0]?.title ?? '',
          success: true,
        });
      }
    } else {
      // ── API mode ────────────────────────────────────────────────────────────
      for (const article of toImport) {
        try {
          const translations = [];
          if (article.ru.title) {
            translations.push({
              lang: 'ru' as const,
              title: article.ru.title,
              content: article.ru.content,
              excerpt: article.ru.content.slice(0, 200) + (article.ru.content.length > 200 ? '…' : ''),
              seoTitle: article.ru.seoTitle || article.ru.title,
              seoDescription: article.ru.seoDescription,
            });
          }
          if (article.kz.title) {
            translations.push({
              lang: 'kz' as const,
              title: article.kz.title,
              content: article.kz.content,
              excerpt: article.kz.content.slice(0, 200) + (article.kz.content.length > 200 ? '…' : ''),
              seoTitle: article.kz.seoTitle || article.kz.title,
              seoDescription: article.kz.seoDescription,
            });
          }

          const imageUrl = article.imageUrl || batchImage;
          const isValidUrl = /^https?:\/\/.+/.test(imageUrl);
          const created = await createMut.mutateAsync({
            type: article.type,
            category: article.category,
            ...(isValidUrl && { imageUrl }),
            translations,
          });

          if (publishImmediately) {
            await publishMut.mutateAsync({
              id: created.id,
              scheduledAt: article.publishedAt || undefined,
            });
          }

          res.push({ orderNum: article.orderNum, title: article.ru.title || article.kz.title, success: true });
        } catch (e: unknown) {
          const axiosErr = e as { response?: { data?: { error?: string }; status?: number }; message?: string };
          const status = axiosErr?.response?.status;
          const serverMsg = axiosErr?.response?.data?.error;
          const errMsg = status === 401
            ? 'Нет авторизации — войдите в систему'
            : serverMsg ?? axiosErr?.message ?? 'Ошибка API';

          res.push({
            orderNum: article.orderNum,
            title: article.ru.title || article.kz.title,
            success: false,
            error: errMsg,
          });
        }
      }
    }

    setResults(res);
    setStatus('done');
  };

  const selectedCount = articles.filter(a => a.selected).length;

  // ── Render: idle/upload ──

  if (status === 'idle' || status === 'uploading') {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <button
          onClick={() => navigate('/news')}
          className="flex items-center gap-1.5 text-sm text-[#89837E] hover:text-[#383233] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к новостям
        </button>

        <div className="bg-white rounded-2xl border border-[#DFDFDF] p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F2EBE3] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#D64338]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#383233]">Импорт из Word</h1>
              <p className="text-xs text-[#89837E]">Массовая загрузка статей из .docx файла</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#D64338] bg-[#FFF5F4]'
                  : 'border-[#DFDFDF] hover:border-[#D64338] hover:bg-[#FAFAFA]'
              }`}
            >
              {status === 'uploading' ? (
                <div className="flex flex-col items-center gap-3 text-[#89837E]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D64338]" />
                  <p className="text-sm font-medium">Парсинг документа…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-[#89837E]" />
                  <div>
                    <p className="text-sm font-semibold text-[#383233]">Перетащите .docx файл сюда</p>
                    <p className="text-xs text-[#89837E] mt-1">или нажмите для выбора</p>
                  </div>
                  <p className="text-[10px] text-[#89837E] bg-[#F2EBE3] px-3 py-1 rounded-full">
                    Формат: DAR Rail — Статьи для сайта
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parseError}
              </div>
            )}

            <div className="bg-[#F9F8F6] rounded-xl p-4 text-xs text-[#89837E] space-y-1">
              <p className="font-semibold text-[#383233] mb-2">Ожидаемый формат документа:</p>
              <p>• Каждая статья начинается с <span className="font-mono text-[#383233]">Статья #N</span></p>
              <p>• Русский блок помечен 🇷🇺 <span className="font-mono">РУССКИЙ</span></p>
              <p>• Казахский блок помечен 🇰🇿 <span className="font-mono">ҚАЗАҚША</span></p>
              <p>• Статьи разделены горизонтальной линией (─────)</p>
              <p>• Поля: URL, SEO Заголовок, Meta Описание</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: done ──

  if (status === 'done') {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl border border-[#DFDFDF] p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="font-bold text-[#383233] text-lg">Импорт завершён</h2>
              <p className="text-xs text-[#89837E]">
                Создано: {successCount} · Ошибок: {failCount}
              </p>
            </div>
          </div>

          {useLocalMode && successCount > 0 && (
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 mb-4">
              <HardDrive className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Статьи сохранены локально</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {successCount} статей в localStorage. После авторизации в системе можно синхронизировать с бэкендом через список новостей.
                </p>
              </div>
            </div>
          )}

          {!useLocalMode && failCount > 0 && results.some(r => !r.success && r.error?.includes('авторизац')) && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4">
              <LogIn className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium">Требуется авторизация</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Войдите в систему или переключитесь в <strong>Локальный режим</strong> и повторите импорт.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
            {results.map(r => (
              <div
                key={r.orderNum}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
                  r.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {r.success
                  ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                  : <XCircle className="w-4 h-4 shrink-0 text-red-500" />}
                <span className="font-mono text-[10px] text-current/60">#{r.orderNum}</span>
                <span className="flex-1 truncate">{r.title}</span>
                {r.error && <span className="text-[10px] text-red-500">{r.error}</span>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/news')}
              className="flex-1 py-2.5 bg-[#D64338] text-white rounded-xl text-sm font-medium hover:bg-[#b8362d] transition-colors"
            >
              Перейти к новостям
            </button>
            <button
              onClick={() => {
                setStatus('idle');
                setArticles([]);
                setResults([]);
                setFileName('');
              }}
              className="px-4 py-2.5 bg-[#F2EBE3] text-[#383233] rounded-xl text-sm font-medium hover:bg-[#DFDFDF] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Новый импорт
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: parsed / importing ──

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-[#DFDFDF] px-6 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/news')}
            className="text-[#89837E] hover:text-[#383233] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-[#383233] text-base leading-tight">
              Импорт из Word
            </h1>
            <p className="text-[#89837E] text-xs mt-0.5">
              {fileName} · Найдено статей: {articles.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode selector */}
          <div className="flex bg-[#F2EBE3] rounded-lg p-0.5 gap-0.5 text-xs font-medium">
            <button
              onClick={() => setUseLocalMode(false)}
              title={!hasAuth ? 'Требуется авторизация (войдите в систему)' : ''}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                !useLocalMode
                  ? 'bg-[#383233] text-white'
                  : 'text-[#383233] hover:bg-white'
              }`}
            >
              {!hasAuth && !useLocalMode && <AlertCircle className="w-3 h-3 text-amber-400" />}
              API
            </button>
            <button
              onClick={() => setUseLocalMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                useLocalMode
                  ? 'bg-[#383233] text-white'
                  : 'text-[#383233] hover:bg-white'
              }`}
            >
              <HardDrive className="w-3 h-3" />
              Локально
            </button>
          </div>

          {!hasAuth && !useLocalMode && (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Войти
            </button>
          )}

          <span className="text-sm text-[#89837E]">
            Выбрано: <span className="font-bold text-[#383233]">{selectedCount}</span>
          </span>
          <button
            onClick={handleImport}
            disabled={selectedCount === 0 || status === 'importing'}
            className="flex items-center gap-2 px-5 py-2 bg-[#D64338] text-white text-sm font-medium rounded-lg hover:bg-[#b8362d] disabled:opacity-40 transition-colors"
          >
            {status === 'importing'
              ? <><Loader2 className="w-4 h-4 animate-spin" />Импортируем…</>
              : <><Upload className="w-4 h-4" />Импортировать {selectedCount > 0 ? selectedCount : ''}</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings panel */}
        <aside className="w-64 shrink-0 bg-white border-r border-[#DFDFDF] overflow-y-auto p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#89837E]">Настройки батча</p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#383233] uppercase tracking-wider block mb-1">
                Дата публикации
              </label>
              <input
                type="date"
                value={batchDate}
                onChange={e => setBatchDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors"
              />
              <p className="text-[10px] text-[#89837E] mt-1">Применится ко всем выбранным статьям</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#383233] uppercase tracking-wider block mb-1">
                Тип
              </label>
              <select
                value={batchType}
                onChange={e => setBatchType(e.target.value as NewsType)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors"
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#383233] uppercase tracking-wider block mb-1">
                Категория
              </label>
              <select
                value={batchCategory}
                onChange={e => setBatchCategory(e.target.value as NewsCategory)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors"
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#383233] uppercase tracking-wider block mb-1">
                Изображение по умолчанию
              </label>
              <input
                type="text"
                value={batchImage}
                onChange={e => setBatchImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] placeholder:text-[#89837E]/40 focus:outline-none focus:border-[#D64338] transition-colors font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPublishImmediately(p => !p)}
                className={`w-9 h-5 rounded-full transition-colors ${publishImmediately ? 'bg-[#D64338]' : 'bg-[#DFDFDF]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${publishImmediately ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-xs text-[#383233]">Опубликовать сразу</span>
            </div>

            <button
              onClick={applyBatchSettings}
              className="w-full py-2 bg-[#383233] text-white text-xs font-medium rounded-lg hover:bg-[#4a4044] transition-colors"
            >
              Применить ко всем
            </button>
          </div>

          <div className="border-t border-[#DFDFDF] pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#89837E] mb-2">Статьи</p>
            <div className="text-xs text-[#89837E] space-y-1">
              <div className="flex justify-between">
                <span>Всего найдено</span>
                <span className="font-bold text-[#383233]">{articles.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Выбрано</span>
                <span className="font-bold text-[#383233]">{selectedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>С датой</span>
                <span className="font-bold text-[#383233]">{articles.filter(a => a.publishedAt).length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Articles table */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#89837E]">
            <input
              type="checkbox"
              checked={articles.every(a => a.selected)}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-[#D64338]"
            />
            <span className="w-8">#</span>
            <span className="flex-1">Заголовок (RU)</span>
            <span className="w-40">Дата</span>
            <span className="w-32">Тип</span>
            <span className="w-8" />
          </div>

          {articles.map(article => {
            const isExpanded = expandedRows.has(article.orderNum);
            return (
              <div
                key={article.orderNum}
                className={`bg-white rounded-xl border transition-colors ${
                  article.selected ? 'border-[#DFDFDF]' : 'border-[#DFDFDF] opacity-50'
                }`}
              >
                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={article.selected}
                    onChange={() => toggleSelect(article.orderNum)}
                    className="w-4 h-4 rounded accent-[#D64338] shrink-0"
                  />
                  <span className="w-8 text-xs font-mono text-[#89837E]">#{article.orderNum}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#383233] truncate">
                      {article.ru.title || <span className="text-[#89837E] italic">Без заголовка</span>}
                    </p>
                    <p className="text-[11px] text-[#89837E] truncate">
                      {article.kz.title}
                    </p>
                  </div>
                  <div className="w-40 shrink-0">
                    <input
                      type="date"
                      value={article.publishedAt}
                      onChange={e => updateArticle(article.orderNum, 'publishedAt', e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-xs text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors"
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <select
                      value={article.category}
                      onChange={e => updateArticle(article.orderNum, 'category', e.target.value as NewsCategory)}
                      className="w-full px-2 py-1.5 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-xs text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors"
                    >
                      {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => toggleRow(article.orderNum)}
                    className="w-8 h-8 flex items-center justify-center text-[#89837E] hover:text-[#383233] transition-colors"
                    title={isExpanded ? 'Свернуть' : 'Развернуть'}
                  >
                    {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-[#DFDFDF] px-4 py-4 grid grid-cols-2 gap-4">
                    {/* RU */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#383233] text-white rounded-full">RU</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Заголовок</p>
                        <p className="text-sm text-[#383233] font-medium">{article.ru.title || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Слаг</p>
                        <p className="text-xs font-mono text-[#89837E]">{article.ru.slug || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">SEO заголовок</p>
                        <p className="text-xs text-[#383233]">{article.ru.seoTitle || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Meta описание</p>
                        <p className="text-xs text-[#89837E]">{article.ru.seoDescription || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Начало текста</p>
                        <p className="text-xs text-[#89837E] line-clamp-3">{article.ru.content.slice(0, 200)}{article.ru.content.length > 200 ? '…' : ''}</p>
                      </div>
                    </div>
                    {/* KZ */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2563eb] text-white rounded-full">ҚЗ</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Заголовок</p>
                        <p className="text-sm text-[#383233] font-medium">{article.kz.title || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Слаг</p>
                        <p className="text-xs font-mono text-[#89837E]">{article.kz.slug || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">SEO заголовок</p>
                        <p className="text-xs text-[#383233]">{article.kz.seoTitle || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Meta описание</p>
                        <p className="text-xs text-[#89837E]">{article.kz.seoDescription || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#89837E] uppercase tracking-wider mb-1">Начало текста</p>
                        <p className="text-xs text-[#89837E] line-clamp-3">{article.kz.content.slice(0, 200)}{article.kz.content.length > 200 ? '…' : ''}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
