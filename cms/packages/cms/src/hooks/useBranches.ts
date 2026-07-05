import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Branch {
  id: string;
  cityRu: string;
  cityKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  email: string;
  department: string | null;
  chairman: string | null;
  lng: number | null;
  lat: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BranchInput {
  cityRu: string;
  cityKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  email: string;
  department?: string | null;
  chairman?: string | null;
  lng?: number | null;
  lat?: number | null;
  sortOrder?: number;
}

const QK = 'branches';

export function useBranches() {
  const { accessToken } = useAuthStore();
  return useQuery<Branch[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/branches');
      return res.data;
    },
    enabled: !!accessToken,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchInput) =>
      api.post('/cms/api/v1/branches', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useUpdateBranch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BranchInput>) =>
      api.put(`/cms/api/v1/branches/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/branches/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
