import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ShopSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export function useShopSubscribers() {
  const { accessToken } = useAuthStore();
  return useQuery<ShopSubscriber[]>({
    queryKey: ['shop-subscribers'],
    queryFn: async () => {
      const { data } = await api.get<ShopSubscriber[]>('/cms/api/v1/shop-subscribers');
      return data;
    },
    enabled: !!accessToken,
  });
}
