import { useState } from 'react';
import { ContentCrudPage, CrudTextField, CrudLangTabs, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface Candidate {
  id: string;
  name: string;
  region: string;
  district: string | null;
  photoUrl: string | null;
  sortOrder: number;
  translations: Array<{ lang: 'ru' | 'kz'; promise: string }>;
}

interface CandidateFormShape {
  name: string;
  region: string;
  district: string;
  photoUrl: string;
  promiseRu: string;
  promiseKz: string;
}

const emptyForm: CandidateFormShape = { name: '', region: '', district: '', photoUrl: '', promiseRu: '', promiseKz: '' };

function CandidateFormFields({ form, setForm, openImagePicker }: {
  form: CandidateFormShape;
  setForm: (updater: (prev: CandidateFormShape) => CandidateFormShape) => void;
  openImagePicker: (cb: (url: string) => void, accept?: string) => void;
}) {
  const [lang, setLang] = useState<'ru' | 'kz'>('ru');
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <CrudTextField label="ФИО" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Ерлан Смагулов" />
        <CrudTextField label="Регион" value={form.region} onChange={(v) => setForm((p) => ({ ...p, region: v }))} placeholder="Алматы" />
      </div>
      <CrudTextField label="Округ" value={form.district} onChange={(v) => setForm((p) => ({ ...p, district: v }))} placeholder="Округ №4" />
      <div>
        <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Фото</label>
        <div className="flex items-center gap-2">
          {form.photoUrl ? <img src={form.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-brand-silver" /> : null}
          <button type="button" onClick={() => openImagePicker((url) => setForm((p) => ({ ...p, photoUrl: url })), 'image/*')} className="px-3 py-2 text-xs bg-brand-cream rounded-lg hover:bg-brand-silver/40">
            Выбрать изображение
          </button>
        </div>
      </div>
      <CrudLangTabs activeLang={lang} onChange={setLang} />
      {lang === 'ru' ? (
        <CrudTextField label="Предвыборное обещание (RU)" value={form.promiseRu} onChange={(v) => setForm((p) => ({ ...p, promiseRu: v }))} textarea />
      ) : (
        <CrudTextField label="Предвыборное обещание (KZ)" value={form.promiseKz} onChange={(v) => setForm((p) => ({ ...p, promiseKz: v }))} textarea />
      )}
    </>
  );
}

const config: ContentCrudConfig<Candidate, CandidateFormShape> = {
  title: 'Кандидаты',
  description: 'Кандидаты партии по округам — страница /kandidaty',
  basePath: 'candidates',
  hasSortOrder: true,
  emptyForm,
  parseItem: (c) => ({
    name: c.name,
    region: c.region,
    district: c.district ?? '',
    photoUrl: c.photoUrl ?? '',
    promiseRu: c.translations.find((t) => t.lang === 'ru')?.promise ?? '',
    promiseKz: c.translations.find((t) => t.lang === 'kz')?.promise ?? '',
  }),
  buildPayload: (f) => ({
    name: f.name,
    region: f.region,
    district: f.district || undefined,
    photoUrl: f.photoUrl || undefined,
    translations: [
      { lang: 'ru', promise: f.promiseRu },
      { lang: 'kz', promise: f.promiseKz || f.promiseRu },
    ],
  }),
  getRowTitle: (c) => c.name,
  getRowSubtitle: (c) => `${c.region}${c.district ? ' · ' + c.district : ''}`,
  renderForm: ({ form, setForm, openImagePicker }) => <CandidateFormFields form={form} setForm={setForm} openImagePicker={openImagePicker} />,
  isValid: (f) => !!f.name && !!f.region && !!f.promiseRu,
};

export default function CandidatesPage() {
  return <ContentCrudPage config={config} />;
}
