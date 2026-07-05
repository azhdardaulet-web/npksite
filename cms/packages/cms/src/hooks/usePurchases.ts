import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PurchaseItem {
  id: string;
  number: number;
  name: string;
  description: string | null;
  procurementType: string;
  deliveryPlace: string | null;
  unit: string | null;
  quantity: string | null;
  estimatedAmount: number | null;
  totalAmount: number | null;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItemInput {
  number: number;
  name: string;
  description?: string | null;
  procurementType: string;
  deliveryPlace?: string | null;
  unit?: string | null;
  quantity?: string | null;
  estimatedAmount?: number | null;
  year: number;
}

export interface PurchaseListResponse {
  data: PurchaseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseFilters {
  year?: number;
  type?: string;
  q?: string;
}

export function usePurchases(filters: PurchaseFilters, page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery<PurchaseListResponse>({
    queryKey: ['purchases', filters, page],
    queryFn: async () => {
      const { data } = await api.get<PurchaseListResponse>('/cms/api/v1/purchases', {
        params: { ...filters, page, limit: 20 },
      });
      return data;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PurchaseItemInput) => {
      const { data } = await api.post<PurchaseItem>('/cms/api/v1/purchases', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}

export function useUpdatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<PurchaseItemInput>) => {
      const { data } = await api.put<PurchaseItem>(`/cms/api/v1/purchases/${id}`, input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}

export function useDeletePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cms/api/v1/purchases/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}

export function useImportExcel() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ valid: PurchaseItemInput[]; errors: { row: number; error: string }[] }>(
        '/cms/api/v1/purchases/import',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
  });
}

export function useConfirmImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: PurchaseItemInput[]) => {
      const { data } = await api.post<{ message: string; count: number }>(
        '/cms/api/v1/purchases/import/confirm',
        { items }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}
