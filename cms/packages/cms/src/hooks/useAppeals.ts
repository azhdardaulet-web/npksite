import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AppealStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface AppealTopic {
  id: string;
  nameRu: string;
  nameKz: string;
}

export type AppealFormat = 'WRITTEN' | 'VIDEO';
export type MeetingStatus = 'PENDING' | 'SCHEDULED' | 'CANCELLED';

export interface AppealAttachment {
  url: string;
  fileName: string;
  fileSize: number;
  kind: 'statement' | 'additional';
}

export interface DeputyTranslation {
  lang: string;
  name: string;
  position: string;
}

export interface AppealMeeting {
  id: string;
  appealId: string;
  deputyId: string;
  deputy: { id: string; photoUrl: string | null; translations: DeputyTranslation[] };
  scheduledAt: string;
  durationMinutes: number;
  status: MeetingStatus;
  meetLink: string | null;
  calendarEventId: string | null;
  lastError: string | null;
  reminderSentAt: string | null;
}

export interface Deputy {
  id: string;
  name: string;
  position: string;
  email: string | null;
  photoUrl: string | null;
}

export interface AppealItem {
  id: string;
  appealNumber: string;
  fullName: string;
  phone: string;
  email: string | null;
  topicId: string;
  topic: AppealTopic;
  message: string;
  fileUrl: string | null;
  attachments: AppealAttachment[] | null;
  format: AppealFormat;
  status: AppealStatus;
  internalNotes: string | null;
  meeting: AppealMeeting | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppealListResponse {
  data: AppealItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppealFilters {
  status?: AppealStatus | '';
  q?: string;
}

export function useAppeals(filters: AppealFilters, page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery<AppealListResponse>({
    queryKey: ['appeals', filters, page],
    queryFn: async () => {
      const { data } = await api.get<AppealListResponse>('/cms/api/v1/appeals', {
        params: {
          ...(filters.status && { status: filters.status }),
          ...(filters.q && { q: filters.q }),
          page,
          limit: 20,
        },
      });
      return data;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

// Счётчик новых обращений для бейджа в сайдбаре.
export function useNewAppealsCount() {
  const { accessToken } = useAuthStore();
  return useQuery<number>({
    queryKey: ['appeals', 'new-count'],
    queryFn: async () => {
      const { data } = await api.get<AppealListResponse>('/cms/api/v1/appeals', {
        params: { status: 'NEW', page: 1, limit: 1 },
      });
      return data.total;
    },
    enabled: !!accessToken,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// Депутаты (TeamMember, group=FACTION) — для выбора при назначении видеозвонка.
export function useDeputies() {
  const { accessToken } = useAuthStore();
  return useQuery<Deputy[]>({
    queryKey: ['appeals', 'deputies'],
    queryFn: async () => {
      const { data } = await api.get<Deputy[]>('/cms/api/v1/appeals/deputies');
      return data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });
}

// Назначить/перенести видеозвонок. Пока Google Calendar API не подключён
// (см. cms/packages/api/src/lib/googleCalendar.ts) — ответ содержит warning,
// а meeting.status остаётся 'PENDING' вместо 'SCHEDULED'.
export function useScheduleAppealMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appealId, deputyId, scheduledAt, durationMinutes,
    }: {
      appealId: string; deputyId: string; scheduledAt: string; durationMinutes?: number;
    }) => {
      const { data } = await api.put<{ meeting: AppealMeeting; warning?: string }>(
        `/cms/api/v1/appeals/${appealId}/meeting`,
        { deputyId, scheduledAt, durationMinutes }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appeals'] }),
  });
}

export function useCancelAppealMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appealId: string) => {
      const { data } = await api.delete<{ meeting: AppealMeeting }>(`/cms/api/v1/appeals/${appealId}/meeting`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appeals'] }),
  });
}

export function useUpdateAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      internalNotes,
    }: {
      id: string;
      status?: AppealStatus;
      internalNotes?: string;
    }) => {
      const { data } = await api.put<AppealItem>(`/cms/api/v1/appeals/${id}`, {
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appeals'] }),
  });
}
