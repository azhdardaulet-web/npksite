import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export interface DocItem {
  name: string;
  url: string;
  fileType: 'pdf' | 'word' | 'other';
}

export interface PageContentData {
  fields: Record<string, Record<string, string>>;
  galleries: Record<string, string[]>;
  documents: Record<string, DocItem[]>;
}

const EMPTY: PageContentData = { fields: {}, galleries: {}, documents: {} };

export function usePageContent(slug: string) {
  const { accessToken } = useAuthStore();
  return useQuery<PageContentData>({
    queryKey: ['page-content', slug],
    queryFn: async () => {
      const res = await api.get<PageContentData>(`/cms/api/v1/pages/${slug}/content`);
      return res.data ?? EMPTY;
    },
    enabled: !!accessToken && !!slug,
    staleTime: 30_000,
  });
}

export function useSavePageContent(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PageContentData) =>
      api.put(`/cms/api/v1/pages/${slug}/content`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['page-content', slug] });
    },
  });
}
