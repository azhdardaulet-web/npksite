import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type SupplierFormStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

export interface SupplierFormItem {
  id: string;
  bin: string;
  companyName: string;
  contactPerson: string;
  position: string | null;
  phone: string;
  email: string;
  supplyCategory: string;
  description: string;
  status: SupplierFormStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormListResponse {
  data: SupplierFormItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierFormFilters {
  status?: SupplierFormStatus | '';
}

export function useSupplierForms(filters: SupplierFormFilters, page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery<SupplierFormListResponse>({
    queryKey: ['supplier-forms', filters, page],
    queryFn: async () => {
      const { data } = await api.get<SupplierFormListResponse>('/cms/api/v1/supplier-forms', {
        params: { ...filters, page, limit: 20 },
      });
      return data;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useUpdateSupplierFormStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SupplierFormStatus }) => {
      const { data } = await api.put<SupplierFormItem>(`/cms/api/v1/supplier-forms/${id}`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplier-forms'] }),
  });
}
