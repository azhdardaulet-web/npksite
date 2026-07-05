// Базовый клиент для публичного API CMS (cms/packages/api).
// Реальные ключи hCaptcha и виджет на фронтенде подключаются в Этапе 8 —
// пока передаём заглушку токена, бэкенд пропускает проверку, если
// HCAPTCHA_SECRET не задан на сервере.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? 'Ошибка запроса к серверу', data?.details);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};

// Заглушка hCaptcha-токена до подключения виджета на фронтенде (Этап 8).
export const DEV_HCAPTCHA_TOKEN = 'dev-bypass';

// ─── Заявки на вступление (/vstupit) ───────────────────────────────────────────

export interface JoinRequestPayload {
  role?: 'member' | 'volunteer' | 'observer';
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
}

export function submitJoinRequest(payload: JoinRequestPayload) {
  return api.post<{ message: string; id: string }>('/api/v1/join-requests', {
    ...payload,
    hCaptchaToken: DEV_HCAPTCHA_TOKEN,
  });
}

// ─── Обращения в приёмную (/priemnaya) ─────────────────────────────────────────

export interface AppealTopic {
  id: string;
  nameRu: string;
  nameKz: string;
}

export function fetchAppealTopics() {
  return api.get<AppealTopic[]>('/api/v1/appeal-topics');
}

export interface AppealPayload {
  fullName: string;
  phone: string;
  email?: string;
  topicId: string;
  message: string;
}

export function submitAppeal(payload: AppealPayload) {
  return api.post<{ message: string; appealNumber: string; id: string }>('/api/v1/appeals', {
    ...payload,
    hCaptchaToken: DEV_HCAPTCHA_TOKEN,
  });
}

// ─── Подписка на открытие магазина (/magazin) ──────────────────────────────────

export function subscribeShop(email: string) {
  return api.post<{ message: string; id: string }>('/api/v1/shop-subscribers', {
    email,
    hCaptchaToken: DEV_HCAPTCHA_TOKEN,
  });
}
