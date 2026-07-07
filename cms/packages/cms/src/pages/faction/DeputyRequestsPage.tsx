import { ContentCrudPage, CrudTextField, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface DeputyRequest {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  publishedAt: string | null;
}

interface DeputyRequestFormShape {
  title: string;
  description: string;
  fileUrl: string;
  publishedAt: string;
}

const emptyForm: DeputyRequestFormShape = { title: '', description: '', fileUrl: '', publishedAt: '' };

function DeputyRequestFormFields({ form, setForm }: {
  form: DeputyRequestFormShape;
  setForm: (updater: (prev: DeputyRequestFormShape) => DeputyRequestFormShape) => void;
}) {
  return (
    <>
      <CrudTextField label="Заголовок" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} />
      <CrudTextField label="Краткое описание" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} textarea />
      <CrudTextField label="Ссылка на полный текст" value={form.fileUrl} onChange={(v) => setForm((p) => ({ ...p, fileUrl: v }))} placeholder="https://..." />
      <div>
        <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Дата запроса</label>
        <input
          type="date"
          value={form.publishedAt}
          onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))}
          className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red bg-white"
        />
      </div>
    </>
  );
}

const config: ContentCrudConfig<DeputyRequest, DeputyRequestFormShape> = {
  title: 'Депутатские запросы',
  description: 'Депутатские запросы фракции НПК — страница /frakciya/zaprosy',
  basePath: 'deputy-requests',
  emptyForm,
  parseItem: (d) => ({
    title: d.title,
    description: d.description ?? '',
    fileUrl: d.fileUrl,
    publishedAt: d.publishedAt ? d.publishedAt.slice(0, 10) : '',
  }),
  buildPayload: (f) => ({
    title: f.title,
    description: f.description || undefined,
    fileUrl: f.fileUrl,
    publishedAt: f.publishedAt || undefined,
  }),
  getRowTitle: (d) => d.title,
  getRowSubtitle: (d) => (d.publishedAt ? new Date(d.publishedAt).toLocaleDateString('ru-RU') : undefined),
  renderForm: ({ form, setForm }) => <DeputyRequestFormFields form={form} setForm={setForm} />,
  isValid: (f) => !!f.title && !!f.fileUrl,
};

export default function DeputyRequestsPage() {
  return <ContentCrudPage config={config} />;
}
