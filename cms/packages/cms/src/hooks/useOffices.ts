import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Office {
  id: string;
  cityRu: string;
  cityKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  email: string;
  department: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeInput {
  cityRu: string;
  cityKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  email: string;
  department?: string | null;
  sortOrder?: number;
}

const QK = 'offices';

export function useOffices() {
  const { accessToken } = useAuthStore();
  return useQuery<Office[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/offices');
      return res.data;
    },
  });
}

export function useCreateOffice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OfficeInput) =>
      api.post('/cms/api/v1/offices', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useUpdateOffice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OfficeInput>) =>
      api.put(`/cms/api/v1/offices/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useDeleteOffice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/offices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
