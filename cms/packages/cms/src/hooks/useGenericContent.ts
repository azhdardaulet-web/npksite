import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// Универсальные CRUD-хуки для простых справочных сущностей CMS
// (Candidate, HistoryEvent, ProgramBlock, MediaProject, MediaPublication,
// Testimonial, MenuItem) — все имеют одинаковый REST-контракт
// GET /cms/api/v1/<basePath>, DELETE /cms/api/v1/<basePath>/:id.
// Create/update идут напрямую через api в ContentCrudPage (payload собирается
// конфигом сущности через buildPayload и не совпадает 1:1 с формой).

export function useEntityList<T>(basePath: string) {
  const { accessToken } = useAuthStore();
  return useQuery<T[]>({
    queryKey: [basePath],
    queryFn: async () => {
      const res = await api.get(`/cms/api/v1/${basePath}`);
      return res.data;
    },
    enabled: !!accessToken,
  });
}

export function useDeleteEntity(basePath: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/${basePath}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [basePath] }),
  });
}
