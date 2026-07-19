import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Paperclip, Video, Copy, Check } from 'lucide-react';
import {
  useAppeals,
  useUpdateAppeal,
  useDeputies,
  useScheduleAppealMeeting,
  useCancelAppealMeeting,
  AppealStatus,
  AppealItem,
} from '@/hooks/useAppeals';

const STATUS_LABEL: Record<AppealStatus, string> = {
  NEW: 'Новое',
  IN_PROGRESS: 'В обработке',
  RESOLVED: 'Решено',
  REJECTED: 'Отклонено',
};

const STATUS_COLOR: Record<AppealStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-gray-200 text-gray-600',
};

// Локальное «datetime-local» значение (без таймзоны, как отдаёт сам input)
// → ISO-строка для отправки на бэкенд.
function localDateTimeToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function isoToLocalDateTimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Блок «Видеоприём» — назначение звонка через Google Meet ──────────────────
// Показывается только для обращений format=VIDEO. Пока Calendar API не
// подключён (см. cms/packages/api/src/lib/googleCalendar.ts), meeting.status
// остаётся PENDING — это ожидаемо, не ошибка.

function VideoMeetingSection({ item }: { item: AppealItem }) {
  const { data: deputies } = useDeputies();
  const scheduleMut = useScheduleAppealMeeting();
  const cancelMut = useCancelAppealMeeting();
  const [editing, setEditing] = useState(!item.meeting || item.meeting.status === 'CANCELLED');
  const [deputyId, setDeputyId] = useState(item.meeting?.deputyId ?? '');
  const [when, setWhen] = useState(item.meeting ? isoToLocalDateTimeInput(item.meeting.scheduledAt) : '');
  const [duration, setDuration] = useState(item.meeting?.durationMinutes ?? 30);
  const [copied, setCopied] = useState(false);

  const meeting = item.meeting;

  const handleSchedule = () => {
    const iso = localDateTimeToIso(when);
    if (!deputyId || !iso) return;
    scheduleMut.mutate(
      { appealId: item.id, deputyId, scheduledAt: iso, durationMinutes: duration },
      { onSuccess: () => setEditing(false) }
    );
  };

  const copyForWhatsapp = () => {
    if (!meeting?.meetLink) return;
    const deputyName = meeting.deputy.translations.find(t => t.lang === 'ru')?.name ?? meeting.deputy.translations[0]?.name ?? '';
    const when = new Date(meeting.scheduledAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
    const text = `Здравствуйте, ${item.fullName}! Ваш видеоприём с ${deputyName} назначен на ${when}. Ссылка на встречу: ${meeting.meetLink}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div>
      <p className="text-gray-500 mb-2 text-sm flex items-center gap-1.5">
        <Video size={14} /> Видеоприём
      </p>

      {meeting && !editing && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
              meeting.status === 'SCHEDULED' ? 'bg-green-100 text-green-700'
              : meeting.status === 'PENDING' ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-200 text-gray-600'
            }`}>
              {meeting.status === 'SCHEDULED' ? 'Запланировано' : meeting.status === 'PENDING' ? 'Ожидает подключения Calendar API' : 'Отменено'}
            </span>
          </div>
          <p className="text-gray-700">
            Депутат: <b>{meeting.deputy.translations.find(t => t.lang === 'ru')?.name ?? meeting.deputy.translations[0]?.name}</b>
          </p>
          <p className="text-gray-700">
            Время: <b>{new Date(meeting.scheduledAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</b> ({meeting.durationMinutes} мин)
          </p>
          {meeting.status === 'SCHEDULED' && meeting.meetLink && (
            <div className="flex items-center gap-2">
              <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{meeting.meetLink}</a>
              <button onClick={copyForWhatsapp} className="shrink-0 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800">
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Скопировано' : 'Для WhatsApp'}
              </button>
            </div>
          )}
          {meeting.status === 'PENDING' && meeting.lastError && (
            <p className="text-xs text-gray-400">{meeting.lastError}</p>
          )}
          <div className="flex gap-2 pt-1">
            {meeting.status === 'PENDING' && (
              <button onClick={handleSchedule} disabled={scheduleMut.isPending} className="text-xs font-medium text-white bg-brand-red rounded-lg px-3 py-1.5 hover:opacity-90 disabled:opacity-50">
                {scheduleMut.isPending ? 'Повтор…' : 'Повторить попытку'}
              </button>
            )}
            {meeting.status !== 'CANCELLED' && (
              <button onClick={() => setEditing(true)} className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100">
                Перенести
              </button>
            )}
            {meeting.status !== 'CANCELLED' && (
              <button
                onClick={() => cancelMut.mutate(item.id)}
                disabled={cancelMut.isPending}
                className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
              >
                Отменить
              </button>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
          <select
            value={deputyId}
            onChange={(e) => setDeputyId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="">Выберите депутата</option>
            {deputies?.map(d => (
              <option key={d.id} value={d.id}>{d.name}{d.position ? ` — ${d.position}` : ''}{!d.email ? ' (нет email)' : ''}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value={15}>15 мин</option>
              <option value={30}>30 мин</option>
              <option value={45}>45 мин</option>
              <option value={60}>60 мин</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSchedule}
              disabled={!deputyId || !when || scheduleMut.isPending}
              className="text-sm font-medium text-white bg-brand-red rounded-lg px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {scheduleMut.isPending ? 'Сохранение…' : 'Назначить видеозвонок'}
            </button>
            {meeting && (
              <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-800 px-2">Отмена</button>
            )}
          </div>
          {scheduleMut.data?.warning && (
            <p className="text-xs text-amber-600">{scheduleMut.data.warning}</p>
          )}
        </div>
      )}
    </div>
  );
}

function AppealModal({ item, onClose }: { item: AppealItem; onClose: () => void }) {
  const [notes, setNotes] = useState(item.internalNotes ?? '');
  const updateMut = useUpdateAppeal();

  const handleSaveNotes = () => {
    updateMut.mutate({ id: item.id, internalNotes: notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Обращение {item.appealNumber}
            {item.format === 'VIDEO' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                <Video size={11} /> Видео
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">ФИО</p>
              <p className="font-medium text-gray-900">{item.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Тема</p>
              <p className="font-medium text-gray-900">{item.topic.nameRu}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Телефон</p>
              <p className="font-medium text-gray-900">{item.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{item.email || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-sm">Текст обращения</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap border border-gray-100">
              {item.message}
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-1 text-sm">Приложенные материалы</p>
            {item.attachments && item.attachments.length > 0 ? (
              <div className="space-y-1.5">
                {item.attachments.map((a, i) => (
                  <a
                    key={a.url + i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <Paperclip size={14} className="shrink-0" />
                    <span className="truncate">{a.fileName}</span>
                    <span className="text-gray-400 shrink-0">
                      ({a.kind === 'statement' ? 'заявление' : 'доп. файл'}, {(a.fileSize / 1024).toFixed(0)} КБ)
                    </span>
                  </a>
                ))}
              </div>
            ) : item.fileUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <Paperclip size={14} />
                Открыть файл
              </a>
            ) : (
              <p className="text-sm text-gray-400">Файлы не прикреплены</p>
            )}
          </div>

          {item.format === 'VIDEO' && <VideoMeetingSection item={item} />}

          <div>
            <p className="text-gray-500 mb-1 text-sm">Внутренние заметки (видно только сотрудникам)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Заметки по обращению..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updateMut.isPending}
              className="mt-2 text-sm font-medium text-white bg-brand-red rounded-lg px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {updateMut.isPending ? 'Сохранение...' : 'Сохранить заметку'}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
            <span className="text-gray-500">Дата обращения:</span>
            <span className="font-medium text-gray-900">
              {new Date(item.createdAt).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppealsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppealStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AppealItem | null>(null);

  const filters = { status: statusFilter, q: search };
  const { data, isLoading, isError } = useAppeals(filters, page);
  const updateMut = useUpdateAppeal();

  const handleStatusChange = (id: string, newStatus: AppealStatus) => {
    updateMut.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Обращения</h1>
        <p className="text-brand-gray text-sm mt-0.5">
          {data?.total !== undefined ? `${data.total} обращений граждан` : 'Обращения граждан из общественной приёмной'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/60 p-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as AppealStatus | ''); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red"
        >
          <option value="">Все статусы</option>
          <option value="NEW">{STATUS_LABEL.NEW}</option>
          <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
          <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
          <option value="REJECTED">{STATUS_LABEL.REJECTED}</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Поиск по ФИО или номеру обращения..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/60 overflow-x-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Загрузка...</div>
        )}
        {isError && (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm">
            Ошибка загрузки. Попробуйте обновить страницу.
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="font-medium text-gray-500 px-4 py-3 w-40">Номер</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-44">Дата</th>
                  <th className="font-medium text-gray-500 px-4 py-3 min-w-[180px]">ФИО</th>
                  <th className="font-medium text-gray-500 px-4 py-3 min-w-[160px]">Тема</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-28">Формат</th>
                  <th className="font-medium text-gray-500 px-4 py-3 w-40">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-12">Обращений не найдено</td>
                  </tr>
                )}
                {data?.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium cursor-pointer" onClick={() => setSelected(item)}>
                      <span className="flex items-center gap-1.5">
                        {item.appealNumber}
                        {item.format === 'VIDEO' && <Video size={13} className="text-purple-600 shrink-0" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 cursor-pointer" onClick={() => setSelected(item)}>
                      {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 cursor-pointer" onClick={() => setSelected(item)}>
                      {item.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => setSelected(item)}>
                      <div className="line-clamp-1" title={item.topic.nameRu}>{item.topic.nameRu}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 cursor-pointer" onClick={() => setSelected(item)}>
                      {item.format === 'VIDEO' ? 'Видео' : 'Письменное'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as AppealStatus)}
                        className={`text-xs border-0 rounded-full px-2.5 py-1 font-medium focus:ring-2 focus:ring-brand-red focus:outline-none appearance-none cursor-pointer ${STATUS_COLOR[item.status]}`}
                      >
                        <option value="NEW">{STATUS_LABEL.NEW}</option>
                        <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
                        <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
                        <option value="REJECTED">{STATUS_LABEL.REJECTED}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">Страница {data.page} из {data.totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <AppealModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
