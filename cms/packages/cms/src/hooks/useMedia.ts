import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  thumbnailUrl: string | null;
  type: 'image' | 'video' | 'pdf' | 'document';
  mimeType: string;
  size: number;
  folderId: string | null;
  createdAt: string;
  uploadedBy: { id: string; name: string };
}

export interface MediaListResponse {
  items: MediaFile[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GalleryFolder {
  id: string;
  name: string;
  parentId: string | null;
  children: GalleryFolder[];
  createdAt: string;
}

export interface MediaFilters {
  folderId?: string;
  type?: 'image' | 'video' | 'pdf' | 'document';
  q?: string;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export function useMediaFiles(filters: MediaFilters) {
  return useInfiniteQuery<MediaListResponse>({
    queryKey: ['media', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<MediaListResponse>('/cms/api/v1/media', {
        params: { ...filters, page: pageParam, limit: 50 },
      });
      return data;
    },
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialPageParam: 1,
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, folderId }: { file: File; folderId?: string }) => {
      const form = new FormData();
      form.append('file', file);
      if (folderId) form.append('folderId', folderId);
      const { data } = await api.post<MediaFile>('/cms/api/v1/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useDeleteFiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => api.delete(`/cms/api/v1/media/${id}`))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useRenameFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, originalName }: { id: string; originalName: string }) =>
      api.patch(`/cms/api/v1/media/${id}`, { originalName }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

// ─── Folders ─────────────────────────────────────────────────────────────────

export function useMediaFolders() {
  const { accessToken } = useAuthStore();
  return useQuery<GalleryFolder[]>({
    queryKey: ['media-folders'],
    queryFn: async () => {
      const { data } = await api.get<GalleryFolder[]>('/cms/api/v1/media/folders');
      return data;
    },
    enabled: !!accessToken,
    staleTime: 60 * 1000,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      api.post('/cms/api/v1/media/folders', { name, parentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media-folders'] }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/media/folders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media-folders'] });
      qc.invalidateQueries({ queryKey: ['media'] });
    },
  });
}
