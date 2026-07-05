import { useState } from 'react';
import { ContentCrudPage, CrudTextField, CrudLangTabs, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface ProgramBlock {
  id: string;
  n: number;
  keyword: string;
  imageUrl: string | null;
  sortOrder: number;
  translations: Array<{ lang: 'ru' | 'kz'; title: string; lead1: string | null; lead2: string | null; points: string[] }>;
}

interface ProgramFormShape {
  n: string;
  keyword: string;
  imageUrl: string;
  titleRu: string; titleKz: string;
  lead1Ru: string; lead1Kz: string;
  lead2Ru: string; lead2Kz: string;
  pointsRu: string; pointsKz: string; // одна строка = один пункт
}

const emptyForm: ProgramFormShape = {
  n: '', keyword: '', imageUrl: '',
  titleRu: '', titleKz: '', lead1Ru: '', lead1Kz: '', lead2Ru: '', lead2Kz: '', pointsRu: '', pointsKz: '',
};

const toLines = (points: string[]) => points.join('\n');
const fromLines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

function ProgramFormFields({ form, setForm }: {
  form: ProgramFormShape;
  setForm: (updater: (prev: ProgramFormShape) => ProgramFormShape) => void;
}) {
  const [lang, setLang] = useState<'ru' | 'kz'>('ru');
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <CrudTextField label="Номер блока" value={form.n} onChange={(v) => setForm((p) => ({ ...p, n: v }))} placeholder="1" />
        <CrudTextField label="Ключевое слово" value={form.keyword} onChange={(v) => setForm((p) => ({ ...p, keyword: v }))} placeholder="ТРУД" />
      </div>
      <CrudLangTabs activeLang={lang} onChange={setLang} />
      {lang === 'ru' ? (
        <>
          <CrudTextField label="Заголовок (RU)" value={form.titleRu} onChange={(v) => setForm((p) => ({ ...p, titleRu: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <CrudTextField label="Лид, строка 1 (RU)" value={form.lead1Ru} onChange={(v) => setForm((p) => ({ ...p, lead1Ru: v }))} />
            <CrudTextField label="Лид, строка 2 (RU)" value={form.lead2Ru} onChange={(v) => setForm((p) => ({ ...p, lead2Ru: v }))} />
          </div>
          <CrudTextField label="Пункты программы (RU) — каждый пункт с новой строки" value={form.pointsRu} onChange={(v) => setForm((p) => ({ ...p, pointsRu: v }))} textarea />
        </>
      ) : (
        <>
          <CrudTextField label="Заголовок (KZ)" value={form.titleKz} onChange={(v) => setForm((p) => ({ ...p, titleKz: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <CrudTextField label="Лид, строка 1 (KZ)" value={form.lead1Kz} onChange={(v) => setForm((p) => ({ ...p, lead1Kz: v }))} />
            <CrudTextField label="Лид, строка 2 (KZ)" value={form.lead2Kz} onChange={(v) => setForm((p) => ({ ...p, lead2Kz: v }))} />
          </div>
          <CrudTextField label="Пункты программы (KZ) — каждый пункт с новой строки" value={form.pointsKz} onChange={(v) => setForm((p) => ({ ...p, pointsKz: v }))} textarea />
        </>
      )}
    </>
  );
}

const config: ContentCrudConfig<ProgramBlock, ProgramFormShape> = {
  title: 'Программа партии',
  description: '10 направлений предвыборной программы — страница /programma',
  basePath: 'program-blocks',
  hasSortOrder: true,
  emptyForm,
  parseItem: (b) => {
    const ru = b.translations.find((t) => t.lang === 'ru');
    const kz = b.translations.find((t) => t.lang === 'kz');
    return {
      n: String(b.n),
      keyword: b.keyword,
      imageUrl: b.imageUrl ?? '',
      titleRu: ru?.title ?? '', titleKz: kz?.title ?? '',
      lead1Ru: ru?.lead1 ?? '', lead1Kz: kz?.lead1 ?? '',
      lead2Ru: ru?.lead2 ?? '', lead2Kz: kz?.lead2 ?? '',
      pointsRu: toLines(ru?.points ?? []),
      pointsKz: toLines(kz?.points ?? []),
    };
  },
  buildPayload: (f) => ({
    n: Number(f.n),
    keyword: f.keyword,
    imageUrl: f.imageUrl || undefined,
    translations: [
      { lang: 'ru', title: f.titleRu, lead1: f.lead1Ru || undefined, lead2: f.lead2Ru || undefined, points: fromLines(f.pointsRu) },
      { lang: 'kz', title: f.titleKz || f.titleRu, lead1: f.lead1Kz || f.lead1Ru || undefined, lead2: f.lead2Kz || f.lead2Ru || undefined, points: f.pointsKz.trim() ? fromLines(f.pointsKz) : fromLines(f.pointsRu) },
    ],
  }),
  getRowTitle: (b) => `${b.n}. ${b.translations.find((t) => t.lang === 'ru')?.title ?? b.keyword}`,
  getRowSubtitle: (b) => b.keyword,
  renderForm: ({ form, setForm }) => <ProgramFormFields form={form} setForm={setForm} />,
  isValid: (f) => !!f.n && !!f.keyword && !!f.titleRu,
};

export default function ProgramBlocksPage() {
  return <ContentCrudPage config={config} />;
}
