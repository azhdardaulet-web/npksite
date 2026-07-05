import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerInput {
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  sortOrder?: number;
}

const QK = 'partners';

export function usePartners() {
  const { accessToken } = useAuthStore();
  return useQuery<Partner[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/partners');
      return res.data;
    },
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PartnerInput) => api.post('/cms/api/v1/partners', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useUpdatePartner(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PartnerInput>) =>
      api.put(`/cms/api/v1/partners/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/partners/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useReorderPartners() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.patch('/cms/api/v1/partners/reorder', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
