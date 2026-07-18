// Базовый клиент для публичного API CMS (cms/packages/api).
// Реальные ключи hCaptcha и виджет на фронтенде подключаются в Этапе 8 —
// пока передаём заглушку токена, бэкенд пропускает проверку, если
// HCAPTCHA_SECRET не задан на сервере.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? 'Ошибка запроса к серверу', data?.details);
  }

  return data as T;
}

function withQuery(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(withQuery(path, params)),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};

// Заглушка hCaptcha-токена до подключения виджета на фронтенде (Этап 8).
export const DEV_HCAPTCHA_TOKEN = 'dev-bypass';

// ─── Заявки на вступление (/vstupit) ───────────────────────────────────────────

export interface JoinRequestPayload {
  role?: 'member' | 'volunteer' | 'observer';
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
}

export function submitJoinRequest(payload: JoinRequestPayload) {
  return api.post<{ message: string; id: string }>('/api/v1/join-requests', {
    ...payload,
    hCaptchaToken: DEV_HCAPTCHA_TOKEN,
  });
}

// ─── Обращения в приёмную (/priemnaya) ─────────────────────────────────────────

export interface AppealTopic {
  id: string;
  nameRu: string;
  nameKz: string;
}

export function fetchAppealTopics() {
  return api.get<AppealTopic[]>('/api/v1/appeal-topics');
}

export interface AppealAttachment {
  url: string;
  fileName: string;
  fileSize: number;
  kind: 'statement' | 'additional';
}

export interface AppealPayload {
  fullName: string;
  phone: string;
  email?: string;
  topicId: string;
  message: string;
  attachments?: AppealAttachment[];
}

export function submitAppeal(payload: AppealPayload) {
  return api.post<{ message: string; appealNumber: string; id: string }>('/api/v1/appeals', {
    ...payload,
    hCaptchaToken: DEV_HCAPTCHA_TOKEN,
  });
}

// Загрузка заявления/доп. документов к письменному обращению — без авторизации,
// файл сразу уходит в MinIO, ссылка прикладывается к submitAppeal.
export async function uploadAppealAttachment(file: File): Promise<{ url: string; fileName: string; fileSize: number }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/v1/appeals/attachments`, { method: 'POST', body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? 'Не удалось загрузить файл', data?.details);
  return data;
}

// Счётчик «обращений решено» на /priemnaya — считается на бэкенде из БД
// (статусы «Принята»/«Решено»), кэш на 1 час.
export function fetchAppealsResolvedCount() {
  return api.get<{ count: number }>('/api/v1/appeals/resolved-count');
}

// ─── Подписка на открытие магазина (/magazin) ──────────────────────────────────

export function subscribeShop(email: string) {
  return api.post<{ message: string; id: string }>('/api/v1/shop-subscribers', {
    email,
    hCaptchaToken: DEV_HCAPTCHA_TOKEN,
  });
}

// ─── Новости (/novosti) ────────────────────────────────────────────────────────

export type NewsFormat = 'news' | 'party_release' | 'article' | 'analytics' | 'interview';

export const NEWS_FORMAT_LABELS: Record<NewsFormat, string> = {
  news: 'Новости',
  party_release: 'Релизы партии',
  article: 'Статьи',
  analytics: 'Аналитика',
  interview: 'Интервью',
};

export interface PublicNewsItem {
  id: string;
  slug: string;
  format: NewsFormat;
  imageUrl: string | null;
  isFeatured: boolean;
  readingTime: number | null;
  tags: string[];
  publishedAt: string | null;
  title: string;
  excerpt: string | null;
}

// GET /api/v1/news/:slug возвращает полную запись News (все языки в translations[])
// плюс activeTranslation — перевод для запрошенного lang (или ru, если такого нет).
export interface PublicNewsDetail {
  id: string;
  slug: string;
  format: NewsFormat;
  imageUrl: string | null;
  readingTime: number | null;
  tags: string[];
  publishedAt: string | null;
  author: { id: string; name: string };
  activeTranslation?: {
    title: string;
    content: string;
    excerpt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  };
}

export interface PublicNewsListResponse {
  data: PublicNewsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function fetchNews(params: { format?: NewsFormat; isFeatured?: boolean; q?: string; page?: number; limit?: number; lang?: string } = {}) {
  return api.get<PublicNewsListResponse>('/api/v1/news', params);
}

export function fetchNewsBySlug(slug: string, lang = 'ru') {
  return api.get<PublicNewsDetail>(`/api/v1/news/${slug}`, { lang });
}

// ─── Кандидаты (/kandidaty, поиск по сайту) ────────────────────────────────────

export interface PublicCandidate {
  id: string;
  name: string;
  region: string;
  district: string | null;
  photoUrl: string | null;
  promise: string;
}

export function fetchCandidates(lang = 'ru') {
  return api.get<PublicCandidate[]>('/api/v1/candidates', { lang });
}

// ─── Команда (/rukovodstvo, /narodnoe-media) ───────────────────────────────────

export type TeamGroup = 'LEADERSHIP' | 'MEDIA_TEAM';

export interface PublicTeamMember {
  id: string;
  photoUrl: string | null;
  group: TeamGroup;
  sortOrder: number;
  name: string;
  position: string;
  bio: string | null;
}

export function fetchTeam(group?: TeamGroup, lang = 'ru') {
  return api.get<PublicTeamMember[]>('/api/v1/team', { group, lang });
}

// ─── История партии (/o-partii/istoriya) ───────────────────────────────────────

export interface PublicHistoryEvent {
  id: string;
  year: number;
  imageUrl: string | null;
  sortOrder: number;
  title: string;
  text: string;
}

export function fetchHistoryEvents(lang = 'ru') {
  return api.get<PublicHistoryEvent[]>('/api/v1/history-events', { lang });
}

// ─── Программа партии (/programma) ─────────────────────────────────────────────

export interface PublicProgramBlock {
  id: string;
  n: number;
  keyword: string;
  imageUrl: string | null;
  sortOrder: number;
  title: string;
  lead1: string | null;
  lead2: string | null;
  points: string[];
}

export function fetchProgramBlocks(lang = 'ru') {
  return api.get<PublicProgramBlock[]>('/api/v1/program-blocks', { lang });
}

// ─── Медиапроекты (/media) ──────────────────────────────────────────────────────

export interface PublicMediaProject {
  id: string;
  tag: string;
  url: string | null;
  imageUrl: string | null;
  sortOrder: number;
  title: string;
  description: string;
}

export function fetchMediaProjects(lang = 'ru') {
  return api.get<PublicMediaProject[]>('/api/v1/media-projects', { lang });
}

// ─── СМИ о нас (/smi-o-nas) ─────────────────────────────────────────────────────

export interface PublicMediaPublication {
  id: string;
  date: string;
  sourceType: string;
  mediaName: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  url: string | null;
  sortOrder: number;
}

export function fetchMediaPublications() {
  return api.get<PublicMediaPublication[]>('/api/v1/media-publications');
}

// ─── Документы (/mediakits — пресс-кит) ────────────────────────────────────────

export type DocumentType = 'ustav' | 'deputy_request' | 'press_kit' | 'appeal_sample' | 'other';

export interface PublicDocument {
  id: string;
  title: string;
  description: string | null;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  year: number | null;
  publishedAt: string | null;
}

export function fetchDocuments(type?: DocumentType) {
  return api.get<PublicDocument[]>('/api/v1/documents', { type });
}

// ─── Отзывы граждан (главная, /priemnaya) ──────────────────────────────────────

export interface PublicTestimonial {
  id: string;
  quote: string;
  author: string;
}

export function fetchTestimonials() {
  return api.get<PublicTestimonial[]>('/api/v1/testimonials');
}

// ─── Филиалы (/filialy, /priemnaya — выбор филиала) ────────────────────────────

export interface PublicBranch {
  id: string;
  cityRu: string;
  cityKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  email: string;
  chairman: string | null;
  lng: number | null;
  lat: number | null;
  sortOrder: number;
}

export function fetchBranches() {
  return api.get<PublicBranch[]>('/api/v1/branches');
}

// ─── Страницы (блоки для CMS-редактируемых секций, /pages/:slug) ───────────────

export interface PublicPageBlock {
  type: string;
  sortOrder: number;
  content: Record<string, unknown>;
}

export interface PublicPage {
  slug: string;
  isPublished: boolean;
  blocks: PublicPageBlock[];
}

export function fetchPage(slug: string, lang = 'ru') {
  return api.get<PublicPage>(`/api/v1/pages/${slug}`, { lang });
}

// ─── Настройки сайта (публично разрешённые ключи, /priemnaya и т.д.) ───────────

export function fetchSettings() {
  return api.get<Record<string, string>>('/api/v1/settings');
}
