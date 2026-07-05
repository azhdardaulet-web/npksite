import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/store/authStore';

export interface CmsUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: 'ACTIVE' | 'BLOCKED';
  branchId: string | null;
  section: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: Role;
  branchId?: string | null;
  section?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  status?: 'ACTIVE' | 'BLOCKED';
  branchId?: string | null;
  section?: string | null;
}

const QK = 'users';

export function useUsers() {
  const { accessToken } = useAuthStore();
  return useQuery<CmsUser[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/users');
      return res.data;
    },
    enabled: !!accessToken,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      api.post('/cms/api/v1/users', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      api.put(`/cms/api/v1/users/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/users/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
