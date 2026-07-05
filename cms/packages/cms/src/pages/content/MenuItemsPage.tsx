import { useEntityList } from '@/hooks/useGenericContent';
import { ContentCrudPage, CrudTextField, type ContentCrudConfig } from '@/components/ContentCrudPage';

interface MenuItem {
  id: string;
  labelRu: string;
  labelKz: string;
  href: string;
  parentId: string | null;
  sortOrder: number;
}

interface MenuItemFormShape {
  labelRu: string;
  labelKz: string;
  href: string;
  parentId: string;
}

const emptyForm: MenuItemFormShape = { labelRu: '', labelKz: '', href: '', parentId: '' };

function MenuItemFormFields({ form, setForm }: {
  form: MenuItemFormShape;
  setForm: (updater: (prev: MenuItemFormShape) => MenuItemFormShape) => void;
}) {
  const { data: allItems = [] } = useEntityList<MenuItem>('menu-items');
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <CrudTextField label="Название (RU)" value={form.labelRu} onChange={(v) => setForm((p) => ({ ...p, labelRu: v }))} placeholder="О партии" />
        <CrudTextField label="Название (KZ)" value={form.labelKz} onChange={(v) => setForm((p) => ({ ...p, labelKz: v }))} />
      </div>
      <CrudTextField label="Ссылка" value={form.href} onChange={(v) => setForm((p) => ({ ...p, href: v }))} placeholder="/o-partii" />
      <div>
        <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">Родительский пункт (для подменю)</label>
        <select value={form.parentId} onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))} className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Без родителя (верхний уровень)</option>
          {allItems.map((item) => (
            <option key={item.id} value={item.id}>{item.labelRu}</option>
          ))}
        </select>
      </div>
    </>
  );
}

const config: ContentCrudConfig<MenuItem, MenuItemFormShape> = {
  title: 'Меню сайта',
  description: 'Пункты меню в шапке и футере сайта',
  basePath: 'menu-items',
  hasSortOrder: true,
  emptyForm,
  parseItem: (m) => ({ labelRu: m.labelRu, labelKz: m.labelKz, href: m.href, parentId: m.parentId ?? '' }),
  buildPayload: (f) => ({
    labelRu: f.labelRu,
    labelKz: f.labelKz || f.labelRu,
    href: f.href,
    parentId: f.parentId || null,
  }),
  getRowTitle: (m) => m.labelRu,
  getRowSubtitle: (m) => m.href,
  renderForm: ({ form, setForm }) => <MenuItemFormFields form={form} setForm={setForm} />,
  isValid: (f) => !!f.labelRu && !!f.href,
};

export default function MenuItemsPage() {
  return <ContentCrudPage config={config} />;
}
