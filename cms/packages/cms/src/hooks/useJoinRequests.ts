import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type JoinRequestStatus = 'NEW' | 'PROCESSING' | 'ACCEPTED' | 'REJECTED';
export type JoinRequestRole = 'member' | 'volunteer' | 'observer';

export interface JoinRequestItem {
  id: string;
  role: JoinRequestRole;
  fullName: string;
  birthDate: string | null;
  gender: 'male' | 'female' | null;
  phone: string;
  email: string | null;
  city: string | null;
  branchId: string | null;
  status: JoinRequestStatus;
  phoneVerified: boolean;
  merchAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JoinRequestListResponse {
  data: JoinRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JoinRequestFilters {
  status?: JoinRequestStatus | '';
  role?: JoinRequestRole | '';
  q?: string;
}

export function useJoinRequests(filters: JoinRequestFilters, page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery<JoinRequestListResponse>({
    queryKey: ['join-requests', filters, page],
    queryFn: async () => {
      const { data } = await api.get<JoinRequestListResponse>('/cms/api/v1/join-requests', {
        params: {
          ...(filters.status && { status: filters.status }),
          ...(filters.role && { role: filters.role }),
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

// Счётчик новых заявок для бейджа в сайдбаре.
export function useNewJoinRequestsCount() {
  const { accessToken } = useAuthStore();
  return useQuery<number>({
    queryKey: ['join-requests', 'new-count'],
    queryFn: async () => {
      const { data } = await api.get<JoinRequestListResponse>('/cms/api/v1/join-requests', {
        params: { status: 'NEW', page: 1, limit: 1 },
      });
      return data.total;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useUpdateJoinRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JoinRequestStatus }) => {
      const { data } = await api.put<JoinRequestItem>(`/cms/api/v1/join-requests/${id}/status`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['join-requests'] }),
  });
}

// Экспорт защищён JWT (Bearer-заголовком), поэтому обычная ссылка <a href>
// не сработает — скачиваем через api-клиент (несёт токен) и открываем blob сами.
export async function downloadJoinRequestsExport(filters: JoinRequestFilters): Promise<void> {
  const { data } = await api.get<Blob>('/cms/api/v1/join-requests/export', {
    params: {
      ...(filters.status && { status: filters.status }),
      ...(filters.role && { role: filters.role }),
      ...(filters.q && { q: filters.q }),
    },
    responseType: 'blob',
  });

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'zayavki.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}
