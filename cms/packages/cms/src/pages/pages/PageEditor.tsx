import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2, Save, Plus, Trash2, ChevronUp, ChevronDown, ImageIcon, FileText,
} from 'lucide-react';
import { usePages, usePage, useUpdatePage, type PageBlock } from '@/hooks/usePages';
import { useMediaPicker } from '@/components/MediaLibrary/MediaPicker';

// ─── Site page catalogue (см. docs/PLAN.md, Часть 2: Page/PageBlock) ──────────
// Валидные слаги фиксированы в cms/packages/api/src/modules/pages/pages.controller.ts

const SITE_PAGES: Record<string, { label: string; description: string }> = {
  home: { label: 'Главная', description: 'Дополнительные текстовые блоки главной страницы (кроме новостей — они управляются в разделе «Новости»)' },
  about: { label: 'О партии', description: 'Страница /o-partii — история, миссия, структура' },
  faction: { label: 'Фракция', description: 'Страница /frakciya — работа фракции в Мажилисе' },
  contacts: { label: 'Контакты', description: 'Страница /kontakty — дополнительная информация, помимо филиалов' },
  footer: { label: 'Футер', description: 'Блоки, отображаемые в подвале сайта на всех страницах' },
};

const BLOCK_TYPES: Record<PageBlock['type'], string> = {
  hero: 'Герой (заголовок + фон)',
  text_image: 'Текст + изображение',
  kpi: 'Показатели (KPI)',
  quote: 'Цитата',
  pdf_list: 'Список документов',
  contacts_block: 'Блок контактов',
};

type Lang = 'ru' | 'kz';

// ─── Block content shapes (хранятся в PageBlock.content как JSON) ─────────────

interface HeroContent {
  titleRu?: string; titleKz?: string;
  subtitleRu?: string; subtitleKz?: string;
  imageUrl?: string;
  ctaLabelRu?: string; ctaLabelKz?: string; ctaHref?: string;
}

interface TextImageContent {
  headingRu?: string; headingKz?: string;
  textRu?: string; textKz?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
}

interface KpiItem { value: string; labelRu: string; labelKz: string; }
interface KpiContent { items: KpiItem[]; }

interface QuoteContent {
  textRu?: string; textKz?: string;
  author?: string;
}

interface PdfItem { nameRu: string; nameKz: string; url: string; }
interface PdfListContent {
  titleRu?: string; titleKz?: string;
  items: PdfItem[];
}

interface ContactItem { labelRu: string; labelKz: string; value: string; }
interface ContactsBlockContent {
  titleRu?: string; titleKz?: string;
  items: ContactItem[];
}

function defaultContent(type: PageBlock['type']): Record<string, unknown> {
  switch (type) {
    case 'hero': return { titleRu: '', titleKz: '', subtitleRu: '', subtitleKz: '', imageUrl: '' } satisfies HeroContent;
    case 'text_image': return { headingRu: '', headingKz: '', textRu: '', textKz: '', imageUrl: '', imagePosition: 'right' } satisfies TextImageContent;
    case 'kpi': return { items: [] } satisfies KpiContent;
    case 'quote': return { textRu: '', textKz: '', author: '' } satisfies QuoteContent;
    case 'pdf_list': return { titleRu: '', titleKz: '', items: [] } satisfies PdfListContent;
    case 'contacts_block': return { titleRu: '', titleKz: '', items: [] } satisfies ContactsBlockContent;
  }
}

// ─── Small field helpers ──────────────────────────────────────────────────────

function TextField({ label, value, onChange, textarea, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string;
}) {
  const cls = 'w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors';
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#89837E] uppercase tracking-wider mb-1">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls + ' resize-none'} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function ImagePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { open, element } = useMediaPicker();
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#89837E] uppercase tracking-wider mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {value ? (
          <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover border border-[#DFDFDF]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-[#F2EBE3] flex items-center justify-center text-[#89837E]">
            <ImageIcon size={18} />
          </div>
        )}
        <button type="button" onClick={() => open((url) => onChange(url), 'image/*')} className="px-3 py-2 text-xs bg-[#F2EBE3] text-[#383233] rounded-lg hover:bg-[#DFDFDF]">
          Выбрать
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="px-3 py-2 text-xs text-[#D64338] hover:bg-red-50 rounded-lg">
            Удалить
          </button>
        )}
      </div>
      {element}
    </div>
  );
}

// ─── Block editors per type ────────────────────────────────────────────────────

function HeroEditor({ content, onChange }: { content: HeroContent; onChange: (c: HeroContent) => void }) {
  const set = <K extends keyof HeroContent>(key: K, val: HeroContent[K]) => onChange({ ...content, [key]: val });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок (RU)" value={content.titleRu ?? ''} onChange={v => set('titleRu', v)} />
        <TextField label="Заголовок (KZ)" value={content.titleKz ?? ''} onChange={v => set('titleKz', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Подзаголовок (RU)" value={content.subtitleRu ?? ''} onChange={v => set('subtitleRu', v)} textarea />
        <TextField label="Подзаголовок (KZ)" value={content.subtitleKz ?? ''} onChange={v => set('subtitleKz', v)} textarea />
      </div>
      <ImagePickerField label="Фоновое изображение" value={content.imageUrl ?? ''} onChange={v => set('imageUrl', v)} />
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Кнопка (RU)" value={content.ctaLabelRu ?? ''} onChange={v => set('ctaLabelRu', v)} />
        <TextField label="Кнопка (KZ)" value={content.ctaLabelKz ?? ''} onChange={v => set('ctaLabelKz', v)} />
        <TextField label="Ссылка кнопки" value={content.ctaHref ?? ''} onChange={v => set('ctaHref', v)} placeholder="/vstupit" />
      </div>
    </div>
  );
}

function TextImageEditor({ content, onChange }: { content: TextImageContent; onChange: (c: TextImageContent) => void }) {
  const set = <K extends keyof TextImageContent>(key: K, val: TextImageContent[K]) => onChange({ ...content, [key]: val });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок (RU)" value={content.headingRu ?? ''} onChange={v => set('headingRu', v)} />
        <TextField label="Заголовок (KZ)" value={content.headingKz ?? ''} onChange={v => set('headingKz', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Текст (RU)" value={content.textRu ?? ''} onChange={v => set('textRu', v)} textarea />
        <TextField label="Текст (KZ)" value={content.textKz ?? ''} onChange={v => set('textKz', v)} textarea />
      </div>
      <ImagePickerField label="Изображение" value={content.imageUrl ?? ''} onChange={v => set('imageUrl', v)} />
      <div>
        <label className="block text-[11px] font-bold text-[#89837E] uppercase tracking-wider mb-1">Положение изображения</label>
        <select
          value={content.imagePosition ?? 'right'}
          onChange={e => set('imagePosition', e.target.value as 'left' | 'right')}
          className="px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338]"
        >
          <option value="right">Справа</option>
          <option value="left">Слева</option>
        </select>
      </div>
    </div>
  );
}

function KpiEditor({ content, onChange }: { content: KpiContent; onChange: (c: KpiContent) => void }) {
  const items = content.items ?? [];
  const update = (i: number, patch: Partial<KpiItem>) => {
    onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[100px_1fr_1fr_32px] gap-2 items-start bg-[#F9F8F6] p-2.5 rounded-lg border border-[#DFDFDF]">
          <input value={item.value} onChange={e => update(i, { value: e.target.value })} placeholder="550+" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.labelRu} onChange={e => update(i, { labelRu: e.target.value })} placeholder="Подпись (RU)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.labelKz} onChange={e => update(i, { labelKz: e.target.value })} placeholder="Подпись (KZ)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <button onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) })} className="text-[#89837E] hover:text-red-600 p-1.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ items: [...items, { value: '', labelRu: '', labelKz: '' }] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors"
      >
        <Plus size={14} /> Добавить показатель
      </button>
    </div>
  );
}

function QuoteEditor({ content, onChange }: { content: QuoteContent; onChange: (c: QuoteContent) => void }) {
  const set = <K extends keyof QuoteContent>(key: K, val: QuoteContent[K]) => onChange({ ...content, [key]: val });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Текст цитаты (RU)" value={content.textRu ?? ''} onChange={v => set('textRu', v)} textarea />
        <TextField label="Текст цитаты (KZ)" value={content.textKz ?? ''} onChange={v => set('textKz', v)} textarea />
      </div>
      <TextField label="Автор" value={content.author ?? ''} onChange={v => set('author', v)} />
    </div>
  );
}

function PdfListEditor({ content, onChange }: { content: PdfListContent; onChange: (c: PdfListContent) => void }) {
  const items = content.items ?? [];
  const { open, element } = useMediaPicker();
  const update = (i: number, patch: Partial<PdfItem>) => {
    onChange({ ...content, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок блока (RU)" value={content.titleRu ?? ''} onChange={v => onChange({ ...content, titleRu: v })} />
        <TextField label="Заголовок блока (KZ)" value={content.titleKz ?? ''} onChange={v => onChange({ ...content, titleKz: v })} />
      </div>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto_32px] gap-2 items-start bg-[#F9F8F6] p-2.5 rounded-lg border border-[#DFDFDF]">
          <input value={item.nameRu} onChange={e => update(i, { nameRu: e.target.value })} placeholder="Название (RU)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.nameKz} onChange={e => update(i, { nameKz: e.target.value })} placeholder="Название (KZ)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.url} onChange={e => update(i, { url: e.target.value })} placeholder="URL файла" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white font-mono text-xs" />
          <button onClick={() => open((url) => update(i, { url }), '.pdf,application/pdf')} className="px-2 py-1.5 text-xs bg-[#F2EBE3] rounded hover:bg-[#DFDFDF] flex items-center gap-1">
            <FileText size={12} /> Файл
          </button>
          <button onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })} className="text-[#89837E] hover:text-red-600 p-1.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ ...content, items: [...items, { nameRu: '', nameKz: '', url: '' }] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors"
      >
        <Plus size={14} /> Добавить документ
      </button>
      {element}
    </div>
  );
}

function ContactsBlockEditor({ content, onChange }: { content: ContactsBlockContent; onChange: (c: ContactsBlockContent) => void }) {
  const items = content.items ?? [];
  const update = (i: number, patch: Partial<ContactItem>) => {
    onChange({ ...content, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок блока (RU)" value={content.titleRu ?? ''} onChange={v => onChange({ ...content, titleRu: v })} />
        <TextField label="Заголовок блока (KZ)" value={content.titleKz ?? ''} onChange={v => onChange({ ...content, titleKz: v })} />
      </div>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-start bg-[#F9F8F6] p-2.5 rounded-lg border border-[#DFDFDF]">
          <input value={item.labelRu} onChange={e => update(i, { labelRu: e.target.value })} placeholder="Название (RU)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.labelKz} onChange={e => update(i, { labelKz: e.target.value })} placeholder="Название (KZ)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.value} onChange={e => update(i, { value: e.target.value })} placeholder="Email / телефон" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <button onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })} className="text-[#89837E] hover:text-red-600 p-1.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ ...content, items: [...items, { labelRu: '', labelKz: '', value: '' }] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors"
      >
        <Plus size={14} /> Добавить контакт
      </button>
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: PageBlock; onChange: (content: Record<string, unknown>) => void }) {
  const asChange = <T,>(fn: (content: Record<string, unknown>) => void) => (c: T) => fn(c as unknown as Record<string, unknown>);
  switch (block.type) {
    case 'hero': return <HeroEditor content={block.content as unknown as HeroContent} onChange={asChange<HeroContent>(onChange)} />;
    case 'text_image': return <TextImageEditor content={block.content as unknown as TextImageContent} onChange={asChange<TextImageContent>(onChange)} />;
    case 'kpi': return <KpiEditor content={block.content as unknown as KpiContent} onChange={asChange<KpiContent>(onChange)} />;
    case 'quote': return <QuoteEditor content={block.content as unknown as QuoteContent} onChange={asChange<QuoteContent>(onChange)} />;
    case 'pdf_list': return <PdfListEditor content={block.content as unknown as PdfListContent} onChange={asChange<PdfListContent>(onChange)} />;
    case 'contacts_block': return <ContactsBlockEditor content={block.content as unknown as ContactsBlockContent} onChange={asChange<ContactsBlockContent>(onChange)} />;
  }
}

// ─── Local editable block (id используется только как React key) ─────────────

interface EditableBlock {
  key: string;
  type: PageBlock['type'];
  content: Record<string, unknown>;
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function PageEditor() {
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = routeSlug ?? 'home';

  const { data: pagesList } = usePages();
  const { data: page, isLoading } = usePage(slug);
  const updateMut = useUpdatePage(slug);

  const [activeLang, setActiveLang] = useState<Lang>('ru');
  const [titleRu, setTitleRu] = useState('');
  const [titleKz, setTitleKz] = useState('');
  const [seoTitleRu, setSeoTitleRu] = useState('');
  const [seoTitleKz, setSeoTitleKz] = useState('');
  const [seoDescRu, setSeoDescRu] = useState('');
  const [seoDescKz, setSeoDescKz] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [blocks, setBlocks] = useState<EditableBlock[]>([]);
  const [addType, setAddType] = useState<PageBlock['type']>('text_image');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!page) return;
    const ru = page.translations.find(t => t.lang === 'ru');
    const kz = page.translations.find(t => t.lang === 'kz');
    setTitleRu(ru?.title ?? '');
    setTitleKz(kz?.title ?? '');
    setSeoTitleRu(ru?.seoTitle ?? '');
    setSeoTitleKz(kz?.seoTitle ?? '');
    setSeoDescRu(ru?.seoDescription ?? '');
    setSeoDescKz(kz?.seoDescription ?? '');
    setIsPublished(page.isPublished);
    setBlocks(page.blocks.map((b, i) => ({ key: b.id || `b_${i}`, type: b.type, content: b.content })));
  }, [page]);

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeBlock = (index: number) => {
    if (!window.confirm('Удалить блок?')) return;
    setBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const addBlock = () => {
    setBlocks(prev => [...prev, { key: `new_${Date.now()}`, type: addType, content: defaultContent(addType) }]);
  };

  const handleSave = async () => {
    setSaved(false);
    await updateMut.mutateAsync({
      isPublished,
      translations: [
        { lang: 'ru', title: titleRu || SITE_PAGES[slug]?.label || slug, seoTitle: seoTitleRu || null, seoDescription: seoDescRu || null },
        { lang: 'kz', title: titleKz || SITE_PAGES[slug]?.label || slug, seoTitle: seoTitleKz || null, seoDescription: seoDescKz || null },
      ],
      blocks: blocks.map((b, i) => ({ type: b.type, sortOrder: i, content: b.content })),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar: page list */}
      <aside className="w-56 shrink-0 border-r border-[#DFDFDF] bg-white overflow-y-auto">
        <div className="px-4 py-3 border-b border-[#DFDFDF]">
          <h2 className="text-sm font-bold text-[#383233]">Страницы сайта</h2>
        </div>
        <nav className="py-2">
          {Object.entries(SITE_PAGES).map(([s, def]) => {
            const pageMeta = pagesList?.find(p => p.slug === s);
            return (
              <button
                key={s}
                onClick={() => navigate(`/pages/${s}`)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  slug === s ? 'bg-[#F2EBE3] text-[#D64338] font-medium border-r-2 border-[#D64338]' : 'text-[#383233] hover:bg-[#F9F8F6]'
                }`}
              >
                {def.label}
                {pageMeta && !pageMeta.isPublished && <span className="ml-2 text-[10px] text-[#89837E]">(скрыто)</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main editor */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#89837E]" size={28} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-[#383233]">{SITE_PAGES[slug]?.label ?? slug}</h1>
                <p className="text-xs text-[#89837E] mt-0.5">{SITE_PAGES[slug]?.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[#383233]">
                  <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="accent-[#D64338]" />
                  Опубликована
                </label>
                <button
                  onClick={handleSave}
                  disabled={updateMut.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D64338] text-white text-sm rounded-lg hover:bg-[#b8362d] disabled:opacity-50"
                >
                  {updateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Сохранить
                </button>
              </div>
            </div>

            {saved && <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">✓ Сохранено</div>}

            {/* Page title / SEO */}
            <div className="bg-white rounded-xl border border-[#DFDFDF] overflow-hidden">
              <div className="flex border-b border-[#DFDFDF]">
                {(['ru', 'kz'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeLang === l ? 'border-b-2 border-[#D64338] text-[#D64338]' : 'text-[#89837E]'}`}
                  >
                    {l === 'ru' ? 'РУ' : 'ҚЗ'}
                  </button>
                ))}
              </div>
              <div className="p-4 space-y-3">
                {activeLang === 'ru' ? (
                  <>
                    <TextField label="Заголовок страницы (RU)" value={titleRu} onChange={setTitleRu} />
                    <TextField label="SEO заголовок (RU)" value={seoTitleRu} onChange={setSeoTitleRu} />
                    <TextField label="SEO описание (RU)" value={seoDescRu} onChange={setSeoDescRu} textarea />
                  </>
                ) : (
                  <>
                    <TextField label="Заголовок страницы (KZ)" value={titleKz} onChange={setTitleKz} />
                    <TextField label="SEO заголовок (KZ)" value={seoTitleKz} onChange={setSeoTitleKz} />
                    <TextField label="SEO описание (KZ)" value={seoDescKz} onChange={setSeoDescKz} textarea />
                  </>
                )}
              </div>
            </div>

            {/* Blocks */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#383233]">Блоки страницы</h3>
              {blocks.map((block, i) => (
                <div key={block.key} className="bg-white rounded-xl border border-[#DFDFDF] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F8F6] border-b border-[#DFDFDF]">
                    <span className="text-xs font-bold text-[#383233] uppercase tracking-wide">
                      {i + 1}. {BLOCK_TYPES[block.type]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="p-1.5 text-[#89837E] hover:text-[#383233] disabled:opacity-30">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} className="p-1.5 text-[#89837E] hover:text-[#383233] disabled:opacity-30">
                        <ChevronDown size={14} />
                      </button>
                      <button onClick={() => removeBlock(i)} className="p-1.5 text-[#89837E] hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <BlockEditor
                      block={{ id: block.key, type: block.type, sortOrder: i, content: block.content }}
                      onChange={(content) => setBlocks(prev => prev.map((b, idx) => (idx === i ? { ...b, content } : b)))}
                    />
                  </div>
                </div>
              ))}

              {blocks.length === 0 && (
                <p className="text-sm text-[#89837E] text-center py-6">Блоков пока нет — добавьте первый ниже.</p>
              )}

              {/* Add block */}
              <div className="flex items-center gap-2">
                <select
                  value={addType}
                  onChange={e => setAddType(e.target.value as PageBlock['type'])}
                  className="flex-1 px-3 py-2 bg-white border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338]"
                >
                  {Object.entries(BLOCK_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={addBlock}
                  className="flex items-center gap-2 px-4 py-2 bg-[#383233] text-white text-sm rounded-lg hover:bg-[#4a4044]"
                >
                  <Plus size={14} /> Добавить блок
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
