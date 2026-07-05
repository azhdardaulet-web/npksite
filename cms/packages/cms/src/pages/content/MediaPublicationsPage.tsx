import { ContentCrudPage, CrudTextField, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface MediaPublication {
  id: string;
  date: string;
  sourceType: string;
  mediaName: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  url: string | null;
  sortOrder: number;
}

interface PublicationFormShape {
  date: string;
  sourceType: string;
  mediaName: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  url: string;
}

const emptyForm: PublicationFormShape = { date: '', sourceType: '', mediaName: '', title: '', excerpt: '', imageUrl: '', url: '' };

const SOURCE_TYPES = ['Телевидение', 'Интернет-СМИ', 'Газеты', 'Информагентства', 'Радио'];

function PublicationFormFields({ form, setForm, openImagePicker }: {
  form: PublicationFormShape;
  setForm: (updater: (prev: PublicationFormShape) => PublicationFormShape) => void;
  openImagePicker: (cb: (url: string) => void, accept?: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <CrudTextField label="Дата (ГГГГ-ММ-ДД)" value={form.date} onChange={(v) => setForm((p) => ({ ...p, date: v }))} placeholder="2026-06-29" />
        <div>
          <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Тип источника</label>
          <select value={form.sourceType} onChange={(e) => setForm((p) => ({ ...p, sourceType: e.target.value }))} className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Выберите...</option>
            {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <CrudTextField label="Название СМИ" value={form.mediaName} onChange={(v) => setForm((p) => ({ ...p, mediaName: v }))} placeholder="Хабар 24" />
      <CrudTextField label="Заголовок публикации" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} />
      <CrudTextField label="Краткое описание" value={form.excerpt} onChange={(v) => setForm((p) => ({ ...p, excerpt: v }))} textarea />
      <CrudTextField label="Ссылка на публикацию" value={form.url} onChange={(v) => setForm((p) => ({ ...p, url: v }))} placeholder="https://..." />
      <div>
        <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Изображение</label>
        <div className="flex items-center gap-2">
          {form.imageUrl ? <img src={form.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-brand-silver" /> : null}
          <button type="button" onClick={() => openImagePicker((url) => setForm((p) => ({ ...p, imageUrl: url })), 'image/*')} className="px-3 py-2 text-xs bg-brand-cream rounded-lg hover:bg-brand-silver/40">
            Выбрать изображение
          </button>
        </div>
      </div>
    </>
  );
}

const config: ContentCrudConfig<MediaPublication, PublicationFormShape> = {
  title: 'СМИ о нас',
  description: 'Публикации в СМИ о партии — страница /smi-o-nas',
  basePath: 'media-publications',
  hasSortOrder: true,
  emptyForm,
  parseItem: (p) => ({
    date: p.date.slice(0, 10),
    sourceType: p.sourceType,
    mediaName: p.mediaName,
    title: p.title,
    excerpt: p.excerpt ?? '',
    imageUrl: p.imageUrl ?? '',
    url: p.url ?? '',
  }),
  buildPayload: (f) => ({
    date: f.date,
    sourceType: f.sourceType,
    mediaName: f.mediaName,
    title: f.title,
    excerpt: f.excerpt || undefined,
    imageUrl: f.imageUrl || undefined,
    url: f.url || undefined,
  }),
  getRowTitle: (p) => p.title,
  getRowSubtitle: (p) => `${p.mediaName} · ${new Date(p.date).toLocaleDateString('ru-RU')}`,
  renderForm: ({ form, setForm, openImagePicker }) => <PublicationFormFields form={form} setForm={setForm} openImagePicker={openImagePicker} />,
  isValid: (f) => !!f.date && !!f.sourceType && !!f.mediaName && !!f.title,
};

export default function MediaPublicationsPage() {
  return <ContentCrudPage config={config} />;
}
