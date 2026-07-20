import { useEffect, useState } from 'react';
import {
  Activity,
  Bot,
  CalendarDays,
  CheckCircle2,
  Database,
  KeyRound,
  Loader2,
  Mail,
  MessageSquareText,
  Save,
  Settings2,
  Users,
  XCircle,
} from 'lucide-react';
import UsersPage from '@/pages/UsersPage';
import {
  useAuditLog,
  useCmsSettings,
  useIntegrationStatus,
  useSaveCmsSettings,
  type IntegrationStatus,
} from '@/hooks/useSettings';

type Tab = 'users' | 'audit' | 'integrations' | 'site';

const TABS: Array<{ id: Tab; label: string; icon: typeof Users }> = [
  { id: 'users', label: 'Пользователи', icon: Users },
  { id: 'audit', label: 'Аудит', icon: Activity },
  { id: 'integrations', label: 'Интеграции', icon: KeyRound },
  { id: 'site', label: 'Данные сайта', icon: Settings2 },
];

const SITE_FIELDS = [
  { key: 'member_number_start', label: 'Стартовый номер партийного билета', placeholder: '00000001', type: 'number' },
  { key: 'notify_email', label: 'Email для уведомлений CMS', placeholder: 'office@halykparty.kz', type: 'email' },
  { key: 'tg_delay_minutes', label: 'Задержка публикации в Telegram, минут', placeholder: '0', type: 'number' },
  { key: 'social_telegram', label: 'Telegram', placeholder: 'https://t.me/halykparty', type: 'url' },
  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/halyk_partiyasy', type: 'url' },
  { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/...', type: 'url' },
  { key: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@halyk_partiyasy', type: 'url' },
  { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/halykpartiyasy', type: 'url' },
  { key: 'reception_avg_response_time', label: 'Среднее время ответа приёмной', placeholder: '5 дней', type: 'text' },
  { key: 'reception_branches_accepting', label: 'Филиалов ведут приём', placeholder: '20', type: 'number' },
  { key: 'video_preview_image', label: 'Кадр видеоприёма', placeholder: 'https://...', type: 'url' },
] as const;

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Создание',
  UPDATE: 'Изменение',
  BLOCK: 'Деактивация',
  UNBLOCK: 'Активация',
  VISIBILITY: 'Видимость',
};

function AuditTab() {
  const { data: entries = [], isLoading } = useAuditLog();

  if (isLoading) {
    return <Loader2 className="mx-auto mt-16 animate-spin text-brand-red" />;
  }

  return (
    <div className="bg-white border border-brand-silver/50 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-silver/40">
        <h2 className="font-semibold text-brand-dark">Журнал действий CMS</h2>
        <p className="text-sm text-brand-gray mt-1">Изменения пользователей, настроек и видимости страниц НПК.</p>
      </div>
      {entries.length === 0 ? (
        <div className="py-16 text-center text-brand-gray">
          <Activity className="mx-auto mb-3 text-brand-silver" size={36} />
          Журнал пока пуст. Новые административные действия появятся здесь автоматически.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-brand-cream/50 border-b border-brand-silver/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase text-brand-gray">Дата</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-brand-gray">Пользователь</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-brand-gray">Действие</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-brand-gray">Объект</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-brand-gray">Описание</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-brand-silver/30">
                  <td className="px-5 py-3 text-sm text-brand-gray whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-brand-dark">{entry.userName}</p>
                    <p className="text-xs text-brand-gray">{entry.userRole}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-brand-dark">{ACTION_LABELS[entry.action] ?? entry.action}</td>
                  <td className="px-5 py-3 text-sm text-brand-dark">{entry.entity}</td>
                  <td className="px-5 py-3 text-sm text-brand-gray">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const INTEGRATIONS: Array<{
  key: keyof IntegrationStatus;
  name: string;
  description: string;
  icon: typeof Mail;
}> = [
  { key: 'smtp', name: 'Email (SMTP)', description: 'Уведомления по заявкам, обращениям и видеоприёму', icon: Mail },
  { key: 'sms', name: 'SMS', description: 'Подтверждение телефона и напоминания гражданам', icon: MessageSquareText },
  { key: 'twoGis', name: '2ГИС Suggest', description: 'Подсказки адреса в форме вступления', icon: Database },
  { key: 'googleMeet', name: 'Google Meet', description: 'Видеоприём и календарные приглашения', icon: CalendarDays },
  { key: 'telegram', name: 'Telegram', description: 'Автопубликация новостей партии', icon: MessageSquareText },
  { key: 'claude', name: 'Claude', description: 'AI-помощник и база знаний сайта', icon: Bot },
];

function IntegrationsTab() {
  const { data, isLoading, refetch, isFetching } = useIntegrationStatus();

  if (isLoading) {
    return <Loader2 className="mx-auto mt-16 animate-spin text-brand-red" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-brand-dark">Интеграции НПК</h2>
          <p className="text-sm text-brand-gray mt-1">Здесь показывается только наличие конфигурации. Секреты хранятся на сервере в `cms/.env`.</p>
        </div>
        <button onClick={() => refetch()} className="px-4 py-2 border border-brand-silver text-sm text-brand-dark">
          {isFetching ? 'Проверяем…' : 'Обновить статус'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(({ key, name, description, icon: Icon }) => {
          const configured = Boolean(data?.[key]);
          return (
            <div key={key} className="bg-white border border-brand-silver/50 shadow-sm p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-cream flex items-center justify-center text-brand-red shrink-0">
                <Icon size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-brand-dark">{name}</h3>
                  <span className={`text-xs flex items-center gap-1 ${configured ? 'text-green-700' : 'text-brand-gray'}`}>
                    {configured ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {configured ? 'Настроено' : 'Не настроено'}
                  </span>
                </div>
                <p className="text-sm text-brand-gray mt-1">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SiteDataTab() {
  const { data, isLoading } = useCmsSettings();
  const save = useSaveCmsSettings();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  if (isLoading) {
    return <Loader2 className="mx-auto mt-16 animate-spin text-brand-red" />;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="font-semibold text-brand-dark">Данные сайта НПК</h2>
        <p className="text-sm text-brand-gray mt-1">Публичные контакты, соцсети и служебные параметры сайта.</p>
      </div>
      <div className="bg-white border border-brand-silver/50 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {SITE_FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="block text-sm font-medium text-brand-dark mb-1.5">{field.label}</span>
            <input
              type={field.type}
              value={values[field.key] ?? ''}
              placeholder={field.placeholder}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              className="w-full border border-brand-silver px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
            />
          </label>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        {save.isSuccess && <span className="text-sm text-green-700">Сохранено</span>}
        {save.isError && <span className="text-sm text-red-700">Не удалось сохранить</span>}
        <button
          onClick={() => save.mutate(Object.fromEntries(SITE_FIELDS.map(({ key }) => [key, values[key] ?? ''])))}
          disabled={save.isPending}
          className="flex items-center gap-2 px-5 py-2 bg-brand-red text-white text-sm disabled:opacity-50"
        >
          {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Сохранить данные сайта
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Настройки</h1>
        <p className="text-brand-gray text-sm mt-0.5">Пользователи, аудит, интеграции и данные сайта НПК</p>
      </div>

      <div className="flex gap-1 bg-brand-cream/60 p-1.5 border border-brand-silver/40 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === id ? 'bg-white text-brand-dark shadow-sm border border-brand-silver/50' : 'text-brand-gray hover:text-brand-dark'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UsersPage />}
      {activeTab === 'audit' && <AuditTab />}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'site' && <SiteDataTab />}
    </div>
  );
}
