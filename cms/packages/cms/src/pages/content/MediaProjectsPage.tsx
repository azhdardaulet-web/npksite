import { useState } from 'react';
import { ContentCrudPage, CrudTextField, CrudLangTabs, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface MediaProject {
  id: string;
  tag: string;
  url: string | null;
  imageUrl: string | null;
  sortOrder: number;
  translations: Array<{ lang: 'ru' | 'kz'; title: string; description: string }>;
}

interface MediaProjectFormShape {
  tag: string;
  url: string;
  imageUrl: string;
  titleRu: string; titleKz: string;
  descriptionRu: string; descriptionKz: string;
}

const emptyForm: MediaProjectFormShape = { tag: '', url: '', imageUrl: '', titleRu: '', titleKz: '', descriptionRu: '', descriptionKz: '' };

function MediaProjectFormFields({ form, setForm, openImagePicker }: {
  form: MediaProjectFormShape;
  setForm: (updater: (prev: MediaProjectFormShape) => MediaProjectFormShape) => void;
  openImagePicker: (cb: (url: string) => void, accept?: string) => void;
}) {
  const [lang, setLang] = useState<'ru' | 'kz'>('ru');
  return (
    <>
      <CrudTextField label="Тег/рубрика" value={form.tag} onChange={(v) => setForm((p) => ({ ...p, tag: v }))} placeholder="Информационная программа" />
      <CrudTextField label="Ссылка (YouTube и т.п.)" value={form.url} onChange={(v) => setForm((p) => ({ ...p, url: v }))} placeholder="https://www.youtube.com/..." />
      <div>
        <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Обложка</label>
        <div className="flex items-center gap-2">
          {form.imageUrl ? <img src={form.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-brand-silver" /> : null}
          <button type="button" onClick={() => openImagePicker((url) => setForm((p) => ({ ...p, imageUrl: url })), 'image/*')} className="px-3 py-2 text-xs bg-brand-cream rounded-lg hover:bg-brand-silver/40">
            Выбрать изображение
          </button>
        </div>
      </div>
      <CrudLangTabs activeLang={lang} onChange={setLang} />
      {lang === 'ru' ? (
        <>
          <CrudTextField label="Название (RU)" value={form.titleRu} onChange={(v) => setForm((p) => ({ ...p, titleRu: v }))} placeholder="«Ақпар»" />
          <CrudTextField label="Описание (RU)" value={form.descriptionRu} onChange={(v) => setForm((p) => ({ ...p, descriptionRu: v }))} textarea />
        </>
      ) : (
        <>
          <CrudTextField label="Название (KZ)" value={form.titleKz} onChange={(v) => setForm((p) => ({ ...p, titleKz: v }))} />
          <CrudTextField label="Описание (KZ)" value={form.descriptionKz} onChange={(v) => setForm((p) => ({ ...p, descriptionKz: v }))} textarea />
        </>
      )}
    </>
  );
}

const config: ContentCrudConfig<MediaProject, MediaProjectFormShape> = {
  title: 'Медиапроекты',
  description: 'Карточки медиапроектов партии — страница /media',
  basePath: 'media-projects',
  hasSortOrder: true,
  emptyForm,
  parseItem: (m) => ({
    tag: m.tag,
    url: m.url ?? '',
    imageUrl: m.imageUrl ?? '',
    titleRu: m.translations.find((t) => t.lang === 'ru')?.title ?? '',
    titleKz: m.translations.find((t) => t.lang === 'kz')?.title ?? '',
    descriptionRu: m.translations.find((t) => t.lang === 'ru')?.description ?? '',
    descriptionKz: m.translations.find((t) => t.lang === 'kz')?.description ?? '',
  }),
  buildPayload: (f) => ({
    tag: f.tag,
    url: f.url || undefined,
    imageUrl: f.imageUrl || undefined,
    translations: [
      { lang: 'ru', title: f.titleRu, description: f.descriptionRu },
      { lang: 'kz', title: f.titleKz || f.titleRu, description: f.descriptionKz || f.descriptionRu },
    ],
  }),
  getRowTitle: (m) => m.translations.find((t) => t.lang === 'ru')?.title ?? m.tag,
  getRowSubtitle: (m) => m.tag,
  renderForm: ({ form, setForm, openImagePicker }) => <MediaProjectFormFields form={form} setForm={setForm} openImagePicker={openImagePicker} />,
  isValid: (f) => !!f.tag && !!f.titleRu && !!f.descriptionRu,
};

export default function MediaProjectsPage() {
  return <ContentCrudPage config={config} />;
}
