import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsLang = 'ru' | 'kz';
export type NewsFormat = 'news' | 'party_release' | 'article' | 'analytics' | 'interview';
export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface NewsTranslation {
  id: string;
  newsId: string;
  lang: NewsLang;
  title: string;
  excerpt: string | null;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsAuthor {
  id: string;
  name: string;
}

export interface NewsListItem {
  id: string;
  slug: string;
  format: NewsFormat;
  status: NewsStatus;
  imageUrl: string | null;
  isFeatured: boolean;
  readingTime: number | null;
  tags: string[];
  tgPosted: boolean;
  tgSkip: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  authorId: string;
  author: NewsAuthor;
  createdAt: string;
  updatedAt: string;
  translations: Array<{ lang: string; title: string; excerpt: string | null }>;
}

export interface NewsDetail extends Omit<NewsListItem, 'translations'> {
  translations: NewsTranslation[];
}

export interface NewsListResponse {
  data: NewsListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsFilters {
  status?: string;
  format?: string;
  q?: string;
}

export interface TranslationInput {
  lang: NewsLang;
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;
}

export interface CreateNewsInput {
  format: NewsFormat;
  imageUrl?: string;
  tags?: string[];
  tgSkip?: boolean;
  isFeatured?: boolean;
  slug?: string;
  translations: TranslationInput[];
}

export interface UpdateNewsInput {
  format: NewsFormat;
  imageUrl?: string | null;
  tags?: string[];
  tgSkip?: boolean;
  isFeatured?: boolean;
  slug?: string;
  translations: TranslationInput[];
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useNews(filters: NewsFilters, page = 1, limit = 10) {
  const { accessToken } = useAuthStore();
  return useQuery<NewsListResponse>({
    queryKey: ['news', filters, page, limit],
    queryFn: async () => {
      const { data } = await api.get<NewsListResponse>('/cms/api/v1/news', {
        params: { ...filters, page, limit },
      });
      return data;
    },
    enabled: !!accessToken,
  });
}

export function useNewsItem(id?: string) {
  const { accessToken } = useAuthStore();
  return useQuery<NewsDetail>({
    queryKey: ['news', 'item', id],
    queryFn: async () => {
      const { data } = await api.get<NewsDetail>(`/cms/api/v1/news/${id}`);
      return data;
    },
    enabled: !!accessToken && !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNewsInput) =>
      api.post<NewsDetail>('/cms/api/v1/news', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateNewsInput & { id: string }) =>
      api.put<NewsDetail>(`/cms/api/v1/news/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function usePublishNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt?: string }) =>
      api.post<NewsDetail>(`/cms/api/v1/news/${id}/publish`, { scheduledAt }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useArchiveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/cms/api/v1/news/${id}/archive`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useDraftNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/cms/api/v1/news/${id}/draft`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/cms/api/v1/news/${id}/toggle-featured`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/news/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}
