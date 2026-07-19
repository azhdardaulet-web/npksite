import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Access-token живёт только в памяти (не в localStorage), поэтому после
// перезагрузки страницы его нужно заново получить через httpOnly refresh-cookie —
// без этого accessToken остаётся null и все запросы с enabled: !!accessToken
// молча не выполняются.
export function useAuthBootstrap() {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: refreshData } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { data: meData } = await axios.get<{ user: Parameters<typeof setAuth>[0] }>(
          `${BASE_URL}/api/v1/auth/me`,
          { headers: { Authorization: `Bearer ${refreshData.accessToken}` } }
        );
        if (!cancelled) {
          setAuth(meData.user, refreshData.accessToken);
        }
      } catch {
        // Сессии нет или истекла — остаёмся разлогиненными
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setAuth]);
}
