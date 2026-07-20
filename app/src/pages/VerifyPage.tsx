import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { fetchVerifyJoinRequest, type JoinRequestVerifyResult } from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'зарегистрировано, в очереди на рассмотрение',
  PROCESSING: 'на рассмотрении',
  ACCEPTED: 'принято — заявитель является членом партии',
  REJECTED: 'отклонено',
};

// Публичная проверка онлайн-партбилета показывает только разрешённые данные:
// имя, номер билета и дату вступления.
export function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<JoinRequestVerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchVerifyJoinRequest(id)
      .then(setResult)
      .catch(() => setResult({ found: false }))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="pb-16 min-h-[60vh] flex items-center justify-center">
      <div className="max-w-[480px] mx-auto px-4 text-center">
        {loading ? (
          <p className="text-body text-text-muted">Проверяем…</p>
        ) : result?.found ? (
          <>
            {result.status === 'ACCEPTED' ? (
              <CheckCircle size={56} className="text-red mx-auto mb-4" />
            ) : result.status === 'REJECTED' ? (
              <XCircle size={56} className="text-text-muted mx-auto mb-4" />
            ) : (
              <Clock size={56} className="text-text-muted mx-auto mb-4" />
            )}
            <h1 className="text-heading-sm font-bold text-text-base mb-4">Подлинность подтверждена</h1>
            <div className="space-y-2 text-body text-text-muted">
              <p><span className="text-text-base font-medium">ФИО:</span> {result.fullName ?? '—'}</p>
              <p><span className="text-text-base font-medium">Номер билета:</span> {result.memberNumber ?? '—'}</p>
              <p><span className="text-text-base font-medium">Дата вступления:</span> {result.joinDate ? new Date(result.joinDate).toLocaleDateString('ru-RU') : '—'}</p>
              <p>Статус: {STATUS_LABEL[result.status ?? ''] ?? result.status}</p>
            </div>
          </>
        ) : (
          <>
            <XCircle size={56} className="text-text-muted mx-auto mb-4" />
            <h1 className="text-heading-sm font-bold text-text-base mb-2">Партийный билет не найден</h1>
            <p className="text-body text-text-muted">Проверьте ссылку из партбилета — возможно, она устарела.</p>
          </>
        )}
      </div>
    </div>
  );
}
