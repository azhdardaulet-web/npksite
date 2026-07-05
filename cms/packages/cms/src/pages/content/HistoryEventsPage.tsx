import { useState } from 'react';
import { ContentCrudPage, CrudTextField, CrudLangTabs, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface HistoryEvent {
  id: string;
  year: number;
  imageUrl: string | null;
  sortOrder: number;
  translations: Array<{ lang: 'ru' | 'kz'; title: string; text: string }>;
}

interface HistoryFormShape {
  year: string;
  imageUrl: string;
  titleRu: string;
  titleKz: string;
  textRu: string;
  textKz: string;
}

const emptyForm: HistoryFormShape = { year: '', imageUrl: '', titleRu: '', titleKz: '', textRu: '', textKz: '' };

function HistoryFormFields({ form, setForm, openImagePicker }: {
  form: HistoryFormShape;
  setForm: (updater: (prev: HistoryFormShape) => HistoryFormShape) => void;
  openImagePicker: (cb: (url: string) => void, accept?: string) => void;
}) {
  const [lang, setLang] = useState<'ru' | 'kz'>('ru');
  return (
    <>
      <CrudTextField label="Год" value={form.year} onChange={(v) => setForm((p) => ({ ...p, year: v }))} placeholder="2026" />
      <div>
        <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Изображение</label>
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
          <CrudTextField label="Заголовок (RU)" value={form.titleRu} onChange={(v) => setForm((p) => ({ ...p, titleRu: v }))} />
          <CrudTextField label="Текст (RU)" value={form.textRu} onChange={(v) => setForm((p) => ({ ...p, textRu: v }))} textarea />
        </>
      ) : (
        <>
          <CrudTextField label="Заголовок (KZ)" value={form.titleKz} onChange={(v) => setForm((p) => ({ ...p, titleKz: v }))} />
          <CrudTextField label="Текст (KZ)" value={form.textKz} onChange={(v) => setForm((p) => ({ ...p, textKz: v }))} textarea />
        </>
      )}
    </>
  );
}

const config: ContentCrudConfig<HistoryEvent, HistoryFormShape> = {
  title: 'История партии',
  description: 'Хронология ключевых событий — страница /o-partii/istoriya',
  basePath: 'history-events',
  hasSortOrder: true,
  emptyForm,
  parseItem: (e) => ({
    year: String(e.year),
    imageUrl: e.imageUrl ?? '',
    titleRu: e.translations.find((t) => t.lang === 'ru')?.title ?? '',
    titleKz: e.translations.find((t) => t.lang === 'kz')?.title ?? '',
    textRu: e.translations.find((t) => t.lang === 'ru')?.text ?? '',
    textKz: e.translations.find((t) => t.lang === 'kz')?.text ?? '',
  }),
  buildPayload: (f) => ({
    year: Number(f.year),
    imageUrl: f.imageUrl || undefined,
    translations: [
      { lang: 'ru', title: f.titleRu, text: f.textRu },
      { lang: 'kz', title: f.titleKz || f.titleRu, text: f.textKz || f.textRu },
    ],
  }),
  getRowTitle: (e) => `${e.year} — ${e.translations.find((t) => t.lang === 'ru')?.title ?? ''}`,
  renderForm: ({ form, setForm, openImagePicker }) => <HistoryFormFields form={form} setForm={setForm} openImagePicker={openImagePicker} />,
  isValid: (f) => !!f.year && !!f.titleRu && !!f.textRu,
};

export default function HistoryEventsPage() {
  return <ContentCrudPage config={config} />;
}
