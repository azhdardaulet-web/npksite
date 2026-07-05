import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsLang = 'ru' | 'kz' | 'en' | 'zh';
export type NewsType = 'press' | 'article' | 'media_mention';
export type NewsCategory = 'corporate' | 'industry' | 'safety' | 'hr' | 'esg' | 'financial';
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
  type: NewsType;
  category: NewsCategory;
  status: NewsStatus;
  imageUrl: string | null;
  isFeatured: boolean;
  readingTime: number | null;
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
  type?: string;
  category?: string;
  q?: string;
}

export interface TranslationInput {
  lang: NewsLang;
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
}

export interface CreateNewsInput {
  type: NewsType;
  category: NewsCategory;
  imageUrl?: string;
  translations: TranslationInput[];
}

export interface UpdateNewsInput {
  type: NewsType;
  category: NewsCategory;
  imageUrl?: string | null;
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
    staleTime: 30_000,
  });
}

export function useNewsItem(id: string | undefined) {
  const { accessToken } = useAuthStore();
  return useQuery<NewsDetail>({
    queryKey: ['news-item', id],
    queryFn: async () => {
      const { data } = await api.get<NewsDetail>(`/cms/api/v1/news/${id}`);
      return data;
    },
    enabled: !!accessToken && !!id,
    staleTime: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateNewsInput) => {
      const { data } = await api.post<NewsDetail>('/cms/api/v1/news', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & UpdateNewsInput) => {
      const { data } = await api.put<NewsDetail>(`/cms/api/v1/news/${id}`, input);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news-item', vars.id] });
    },
  });
}

export function usePublishNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt?: string }) => {
      const { data } = await api.post<NewsDetail>(`/cms/api/v1/news/${id}/publish`, {
        scheduledAt,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useArchiveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<NewsDetail>(`/cms/api/v1/news/${id}/archive`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useDraftNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<NewsDetail>(`/cms/api/v1/news/${id}/draft`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cms/api/v1/news/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<NewsDetail>(`/cms/api/v1/news/${id}/toggle-featured`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}
