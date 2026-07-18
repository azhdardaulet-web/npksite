import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PageBlock {
  id: string;
  type: 'hero' | 'home_hero' | 'text_image' | 'kpi' | 'quote' | 'pdf_list' | 'contacts_block' | 'ticker' | 'stats' | 'video' | 'about_hero' | 'about_community' | 'about_methods' | 'about_structure' | 'about_goal' | 'press_hero' | 'press_studio' | 'press_cta' | 'reception' | 'candidates_intro' | 'program_intro' | 'join' | 'reception_header' | 'reception_steps';
  sortOrder: number;
  content: Record<string, unknown>;
}

export interface PageTranslation {
  id: string;
  lang: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
}

export interface Page {
  id: string;
  slug: string;
  isPublished: boolean;
  blocks: PageBlock[];
  translations: PageTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePageInput {
  blocks?: Array<{
    type: PageBlock['type'];
    sortOrder: number;
    content: Record<string, unknown>;
  }>;
  translations?: Array<{
    lang: string;
    title: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImageUrl?: string | null;
  }>;
  isPublished?: boolean;
}

const QK = 'pages';

export function usePages() {
  const { accessToken } = useAuthStore();
  return useQuery<Page[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/pages');
      return res.data;
    },
    enabled: !!accessToken,
  });
}

export function usePage(slug: string) {
  const { accessToken } = useAuthStore();
  return useQuery<Page>({
    queryKey: [QK, slug],
    queryFn: async () => {
      const res = await api.get(`/cms/api/v1/pages/${slug}`);
      return res.data;
    },
    enabled: !!accessToken && !!slug,
  });
}

export function useUpdatePage(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePageInput) =>
      api.put(`/cms/api/v1/pages/${slug}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, slug] });
    },
  });
}
