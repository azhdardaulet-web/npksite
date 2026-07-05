import { ContentCrudPage, CrudTextField, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  sortOrder: number;
}

interface TestimonialFormShape {
  quote: string;
  author: string;
}

const emptyForm: TestimonialFormShape = { quote: '', author: '' };

function TestimonialFormFields({ form, setForm }: {
  form: TestimonialFormShape;
  setForm: (updater: (prev: TestimonialFormShape) => TestimonialFormShape) => void;
}) {
  return (
    <>
      <CrudTextField label="Отзыв" value={form.quote} onChange={(v) => setForm((p) => ({ ...p, quote: v }))} textarea />
      <CrudTextField label="Автор" value={form.author} onChange={(v) => setForm((p) => ({ ...p, author: v }))} placeholder="Айгуль К., Алматы" />
    </>
  );
}

const config: ContentCrudConfig<Testimonial, TestimonialFormShape> = {
  title: 'Отзывы граждан',
  description: 'Отзывы об общественной приёмной — используются на главной странице',
  basePath: 'testimonials',
  hasSortOrder: true,
  emptyForm,
  parseItem: (t) => ({ quote: t.quote, author: t.author }),
  buildPayload: (f) => ({ quote: f.quote, author: f.author }),
  getRowTitle: (t) => t.author,
  getRowSubtitle: (t) => t.quote,
  renderForm: ({ form, setForm }) => <TestimonialFormFields form={form} setForm={setForm} />,
  isValid: (f) => !!f.quote && !!f.author,
};

export default function TestimonialsPage() {
  return <ContentCrudPage config={config} />;
}
