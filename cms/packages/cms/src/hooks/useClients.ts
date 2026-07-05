import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Client {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInput {
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  sortOrder?: number;
}

const QK = 'clients';

export function useClients() {
  return useQuery<Client[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/clients');
      return res.data;
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientInput) => api.post('/cms/api/v1/clients', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ClientInput>) =>
      api.put(`/cms/api/v1/clients/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useReorderClients() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.patch('/cms/api/v1/clients/reorder', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
