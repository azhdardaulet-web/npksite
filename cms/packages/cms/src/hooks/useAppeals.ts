import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AppealStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface AppealTopic {
  id: string;
  nameRu: string;
  nameKz: string;
}

export interface AppealItem {
  id: string;
  appealNumber: string;
  fullName: string;
  phone: string;
  email: string | null;
  topicId: string;
  topic: AppealTopic;
  message: string;
  fileUrl: string | null;
  status: AppealStatus;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppealListResponse {
  data: AppealItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppealFilters {
  status?: AppealStatus | '';
  q?: string;
}

export function useAppeals(filters: AppealFilters, page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery<AppealListResponse>({
    queryKey: ['appeals', filters, page],
    queryFn: async () => {
      const { data } = await api.get<AppealListResponse>('/cms/api/v1/appeals', {
        params: {
          ...(filters.status && { status: filters.status }),
          ...(filters.q && { q: filters.q }),
          page,
          limit: 20,
        },
      });
      return data;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

// Счётчик новых обращений для бейджа в сайдбаре.
export function useNewAppealsCount() {
  const { accessToken } = useAuthStore();
  return useQuery<number>({
    queryKey: ['appeals', 'new-count'],
    queryFn: async () => {
      const { data } = await api.get<AppealListResponse>('/cms/api/v1/appeals', {
        params: { status: 'NEW', page: 1, limit: 1 },
      });
      return data.total;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useUpdateAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      internalNotes,
    }: {
      id: string;
      status?: AppealStatus;
      internalNotes?: string;
    }) => {
      const { data } = await api.put<AppealItem>(`/cms/api/v1/appeals/${id}`, {
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appeals'] }),
  });
}
