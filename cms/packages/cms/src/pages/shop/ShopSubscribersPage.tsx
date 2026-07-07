import { Loader2, Mail } from 'lucide-react';
import { useShopSubscribers } from '@/hooks/useShopSubscribers';

// Магазин НПК ещё не открыт (заглушка «скоро» на сайте, /magazin) — пока
// здесь список email-подписчиков, ожидающих открытия. Раздел «Покупки» на
// дашборде появится вместе с реальным магазином.
export default function ShopSubscribersPage() {
  const { data: subscribers = [], isLoading } = useShopSubscribers();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-dark">Интернет-магазин</h1>
        <p className="text-sm text-brand-gray mt-0.5">
          Магазин мерча ещё не запущен — здесь список подписавшихся на уведомление об открытии (форма на /magazin)
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-silver" size={24} />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-16 text-brand-gray text-sm">Подписчиков пока нет</div>
        ) : (
          <div className="divide-y divide-brand-silver/30">
            {subscribers.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <Mail size={16} className="text-brand-gray shrink-0" />
                <span className="flex-1 text-sm text-brand-dark">{s.email}</span>
                <span className="text-xs text-brand-gray shrink-0">
                  {new Date(s.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
