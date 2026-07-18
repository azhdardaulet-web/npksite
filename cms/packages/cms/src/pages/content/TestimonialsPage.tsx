import { ContentCrudPage, CrudTextField, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  approved: boolean;
  sortOrder: number;
}

interface TestimonialFormShape {
  quote: string;
  author: string;
  approved: boolean;
}

const emptyForm: TestimonialFormShape = { quote: '', author: '', approved: true };

function TestimonialFormFields({ form, setForm }: {
  form: TestimonialFormShape;
  setForm: (updater: (prev: TestimonialFormShape) => TestimonialFormShape) => void;
}) {
  return (
    <>
      <CrudTextField label="Отзыв" value={form.quote} onChange={(v) => setForm((p) => ({ ...p, quote: v }))} textarea />
      <CrudTextField label="Автор" value={form.author} onChange={(v) => setForm((p) => ({ ...p, author: v }))} placeholder="Айгуль К., Алматы" />
      <label className="flex items-center gap-2 text-sm text-brand-dark cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.approved}
          onChange={(e) => setForm((p) => ({ ...p, approved: e.target.checked }))}
          className="accent-brand-red"
        />
        Одобрен — показывать на сайте (главная и /priemnaya)
      </label>
    </>
  );
}

const config: ContentCrudConfig<Testimonial, TestimonialFormShape> = {
  title: 'Отзывы граждан',
  description: 'Отзывы об общественной приёмной — используются на главной странице и /priemnaya. На сайте показываются только одобренные',
  basePath: 'testimonials',
  hasSortOrder: true,
  emptyForm,
  parseItem: (t) => ({ quote: t.quote, author: t.author, approved: t.approved }),
  buildPayload: (f) => ({ quote: f.quote, author: f.author, approved: f.approved }),
  getRowTitle: (t) => t.author,
  getRowSubtitle: (t) => (t.approved ? t.quote : `[Не одобрен] ${t.quote}`),
  renderForm: ({ form, setForm }) => <TestimonialFormFields form={form} setForm={setForm} />,
  isValid: (f) => !!f.quote && !!f.author,
};

export default function TestimonialsPage() {
  return <ContentCrudPage config={config} />;
}
