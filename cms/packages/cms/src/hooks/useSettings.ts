import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuditEntry {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string;
  createdAt: string;
}

export interface IntegrationStatus {
  smtp: boolean;
  sms: boolean;
  twoGis: boolean;
  googleMeet: boolean;
  telegram: boolean;
  claude: boolean;
}

export function useCmsSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ['cms-settings'],
    queryFn: () => api.get('/cms/api/v1/settings').then((response) => response.data),
  });
}

export function useSaveCmsSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, string>) => {
      await Promise.all(
        Object.entries(values).map(([key, value]) =>
          api.put(`/cms/api/v1/settings/${encodeURIComponent(key)}`, { value }),
        ),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cms-settings'] }),
  });
}

export function useAuditLog() {
  return useQuery<AuditEntry[]>({
    queryKey: ['audit-log'],
    queryFn: () => api.get('/cms/api/v1/settings/audit').then((response) => response.data),
  });
}

export function useIntegrationStatus() {
  return useQuery<IntegrationStatus>({
    queryKey: ['integration-status'],
    queryFn: () => api.get('/cms/api/v1/settings/integrations/status').then((response) => response.data),
  });
}
