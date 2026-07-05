import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TeamTranslation {
  id: string;
  memberId: string;
  lang: string;
  name: string;
  position: string;
  bio: string | null;
}

export interface TeamMember {
  id: string;
  photoUrl: string | null;
  sortOrder: number;
  translations: TeamTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberInput {
  photoUrl?: string | null;
  sortOrder?: number;
  translations: Array<{
    lang: string;
    name: string;
    position: string;
    bio?: string | null;
  }>;
}

const QK = 'team';

export function useTeam() {
  const { accessToken } = useAuthStore();
  return useQuery<TeamMember[]>({
    queryKey: [QK],
    queryFn: async () => {
      const res = await api.get('/cms/api/v1/team');
      return res.data;
    },
  });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamMemberInput) =>
      api.post('/cms/api/v1/team', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useUpdateTeamMember(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeamMemberInput>) =>
      api.put(`/cms/api/v1/team/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/team/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}

export function useReorderTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.patch('/cms/api/v1/team/reorder', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
}
