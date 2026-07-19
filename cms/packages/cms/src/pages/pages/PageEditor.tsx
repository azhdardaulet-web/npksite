import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Loader2, Save, Plus, Trash2, ImageIcon, FileText, GripVertical, ChevronDown, ChevronRight,
  Eye, EyeOff,
} from 'lucide-react';
import { usePages, usePage, useUpdatePage, useSetPageVisibility, type PageBlock } from '@/hooks/usePages';
import { useMediaPicker } from '@/components/MediaLibrary/MediaPicker';
import { useAuthStore } from '@/store/authStore';

// ─── Site page catalogue (см. docs/PLAN.md, Часть 2: Page/PageBlock) ──────────
// Валидные слаги фиксированы в cms/packages/api/src/modules/pages/pages.controller.ts

const SITE_PAGES: Record<string, { label: string; description: string }> = {
  home: { label: 'Главная', description: 'Все текстовые блоки и изображения главной страницы. Новости, кандидаты, программа партии и филиалы — отдельные разделы CRUD ниже, здесь редактируются только заголовки/подписи/картинки секций' },
  about: { label: 'О партии', description: 'Страница /o-partii — история, миссия, структура' },
  faction: { label: 'Фракция', description: 'Страница /frakciya — работа фракции в Мажилисе' },
  'press-center': { label: 'Пресс-центр', description: 'Страница /narodnoe-media — «О портале «Халық үні Қазақстан»» (герой, о студии, призыв подписаться). Остальные материалы — в разделах ниже' },
  contacts: { label: 'Контакты', description: 'Страница /kontakty — дополнительная информация, помимо филиалов' },
  footer: { label: 'Футер', description: 'Блоки, отображаемые в подвале сайта на всех страницах' },
  priemnaya: { label: 'Приёмная', description: 'Страница /priemnaya — шапка, шаги «Как это работает», форма обращения и мокап видеоприёма. Статистика — из счётчика обращений (авто) и раздела «Настройки»; отзывы — отдельный CRUD ниже' },
};

const PAGE_VISIBILITY_CATALOG = [
  { slug: 'home', title: 'Главная', path: '/' },
  { slug: 'about', title: 'О партии', path: '/o-partii' },
  { slug: 'history', title: 'История партии', path: '/o-partii/istoriya' },
  { slug: 'ustav', title: 'Устав партии', path: '/o-partii/ustav' },
  { slug: 'projects', title: 'Проекты', path: '/proekty' },
  { slug: 'program', title: 'Программа', path: '/programma' },
  { slug: 'candidates', title: 'Кандидаты', path: '/kandidaty' },
  { slug: 'leadership', title: 'Руководство', path: '/rukovodstvo' },
  { slug: 'faction', title: 'Фракция', path: '/frakciya' },
  { slug: 'priemnaya', title: 'Общественная приёмная', path: '/priemnaya' },
  { slug: 'branches', title: 'Филиалы', path: '/filialy' },
  { slug: 'news', title: 'Новости', path: '/novosti' },
  { slug: 'smi', title: 'СМИ о нас', path: '/smi-o-nas' },
  { slug: 'press-center', title: 'Народное медиа', path: '/narodnoe-media' },
  { slug: 'media', title: 'Видео', path: '/media' },
  { slug: 'contacts', title: 'Контакты', path: '/kontakty' },
  { slug: 'join', title: 'Вступить в партию', path: '/vstupit' },
  { slug: 'press-kit', title: 'Пресс-кит', path: '/mediakits' },
  { slug: 'search', title: 'Поиск', path: '/search' },
  { slug: 'shop', title: 'Магазин', path: '/magazin' },
] as const;

// ─── Дерево навигации мини-панели «Страницы» ──────────────────────────────────
// Узел либо ведёт на редактор блоков этой же страницы (pageSlug), либо на
// отдельный CRUD-экран (route) — коллекции (новости, кандидаты и т.д.) не
// превращаем в блоки, а просто делаем их доступными рядом с родительской
// страницей сайта.

interface PageNavNode {
  label: string;
  pageSlug?: keyof typeof SITE_PAGES;
  route?: string;
  children?: PageNavNode[];
}

const PAGE_NAV_TREE: PageNavNode[] = [
  {
    label: 'Главная',
    pageSlug: 'home',
    children: [{ label: 'Отзывы', route: '/testimonials' }],
  },
  {
    label: 'О партии',
    pageSlug: 'about',
    children: [
      { label: 'История партии', route: '/history' },
      { label: 'Устав партии', route: '/documents/ustav' },
      { label: 'Программа', route: '/program' },
      { label: 'Кандидаты', route: '/candidates' },
      { label: 'Руководство и команда', route: '/team' },
    ],
  },
  { label: 'Филиалы', route: '/filialy' },
  {
    label: 'Приёмная',
    pageSlug: 'priemnaya',
    children: [{ label: 'Отзывы', route: '/testimonials' }],
  },
  {
    label: 'Пресс-центр',
    pageSlug: 'press-center',
    children: [
      { label: 'Новости и релизы', route: '/news' },
      { label: 'СМИ о нас', route: '/smi' },
      { label: 'Медиапроекты', route: '/media-projects' },
      { label: 'Медиабиблиотека', route: '/media' },
      { label: 'Народный подкаст', route: '/podcast' },
      { label: 'Галерея', route: '/galereya' },
    ],
  },
  { label: 'Контакты', pageSlug: 'contacts' },
  { label: 'Меню сайта', route: '/menu' },
];

const BLOCK_TYPES: Record<PageBlock['type'], string> = {
  hero: 'Герой (заголовок + фон)',
  home_hero: 'Герой главной (заголовок, слова, кнопки, видео)',
  text_image: 'Текст + изображение',
  kpi: 'Показатели (KPI)',
  quote: 'Цитата',
  pdf_list: 'Список документов',
  contacts_block: 'Блок контактов',
  ticker: 'Бегущая строка',
  stats: 'Статистика с заголовком',
  video: 'Видео-секция',
  about_hero: '«О партии»: герой (заголовок + текст + кнопка)',
  about_community: '«О партии»: С кем мы',
  about_methods: '«О партии»: Методы партии',
  about_structure: '«О партии»: Структура партии',
  about_goal: '«О партии»: Наша цель',
  press_hero: '«Пресс-центр»: герой (значок + заголовок + текст + кнопка)',
  press_studio: '«Пресс-центр»: О студии',
  press_cta: '«Пресс-центр»: Призыв подписаться',
  reception: '«Главная»: Онлайн приёмная',
  candidates_intro: '«Главная»: Лица партии (заголовок)',
  program_intro: '«Главная»: Программа (заголовок)',
  join: '«Главная»: Вступить в партию',
  reception_header: '«Приёмная»: шапка, WhatsApp, мокап видеоприёма',
  reception_steps: '«Приёмная»: шаги «Как это работает»',
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

interface ContactItem { labelRu: string; labelKz: string; value: string; href?: string; }
interface ContactsBlockContent {
  headingRu?: string; headingKz?: string;
  textRu?: string; textKz?: string;
  titleRu?: string; titleKz?: string;
  items: ContactItem[];
}

interface ReceptionContent {
  headingRu?: string; headingKz?: string;
  textRu?: string; textKz?: string;
  whatsappNumber?: string; whatsappLabelRu?: string; whatsappLabelKz?: string;
  counterValue?: string; counterLabelRu?: string; counterLabelKz?: string;
}

interface ReceptionHeaderContent {
  headingRu?: string; headingKz?: string;
  subtitleRu?: string; subtitleKz?: string;
  whatsappNumber?: string;
  whatsappNoteRu?: string; whatsappNoteKz?: string;
  counterLabelRu?: string; counterLabelKz?: string;
  stat2LabelRu?: string; stat2LabelKz?: string;
  stat3LabelRu?: string; stat3LabelKz?: string;
  mockupImageUrl?: string;
  mockupCaptionRu?: string; mockupCaptionKz?: string;
}

interface ReceptionStepItem { titleRu: string; titleKz: string; textRu: string; textKz: string; }
interface ReceptionStepsContent { items: ReceptionStepItem[]; }

interface HomeHeroContent {
  titleRu?: string; titleKz?: string;
  wordsRu: string[]; wordsKz: string[];
  subtitleRu?: string; subtitleKz?: string;
  cta1LabelRu?: string; cta1LabelKz?: string; cta1Href?: string;
  cta2LabelRu?: string; cta2LabelKz?: string; cta2Href?: string;
  videoUrl?: string;
}

interface TickerContent {
  phrasesRu: string[];
  phrasesKz: string[];
}

interface StatItem { value: string; suffix?: string; labelRu: string; labelKz: string; }
interface StatsContent {
  headingRu?: string; headingKz?: string;
  introRu?: string; introKz?: string;
  items: StatItem[];
}

interface VideoContent {
  videoUrl?: string;
}

function defaultContent(type: PageBlock['type']): Record<string, unknown> {
  switch (type) {
    case 'hero': return { titleRu: '', titleKz: '', subtitleRu: '', subtitleKz: '', imageUrl: '' } satisfies HeroContent;
    case 'home_hero': return { titleRu: '', titleKz: '', wordsRu: [], wordsKz: [], subtitleRu: '', subtitleKz: '', videoUrl: '' } satisfies HomeHeroContent;
    case 'ticker': return { phrasesRu: [], phrasesKz: [] } satisfies TickerContent;
    case 'stats': return { headingRu: '', headingKz: '', introRu: '', introKz: '', items: [] } satisfies StatsContent;
    case 'video': return { videoUrl: '' } satisfies VideoContent;
    case 'text_image': return { headingRu: '', headingKz: '', textRu: '', textKz: '', imageUrl: '', imagePosition: 'right' } satisfies TextImageContent;
    case 'kpi': return { items: [] } satisfies KpiContent;
    case 'quote': return { textRu: '', textKz: '', author: '' } satisfies QuoteContent;
    case 'pdf_list': return { titleRu: '', titleKz: '', items: [] } satisfies PdfListContent;
    case 'contacts_block': return { titleRu: '', titleKz: '', items: [] } satisfies ContactsBlockContent;
    case 'about_hero': return { titleRu: '', titleKz: '', subtitleRu: '', subtitleKz: '', imageUrl: '' } satisfies HeroContent;
    case 'about_community':
    case 'about_methods':
    case 'about_structure':
    case 'about_goal':
      return { headingRu: '', headingKz: '', textRu: '', textKz: '', imageUrl: '', imagePosition: 'right' } satisfies TextImageContent;
    case 'press_hero': return { titleRu: '', titleKz: '', subtitleRu: '', subtitleKz: '', imageUrl: '' } satisfies HeroContent;
    case 'press_studio':
    case 'press_cta':
      return { headingRu: '', headingKz: '', textRu: '', textKz: '' } satisfies TextImageContent;
    case 'reception': return { headingRu: '', headingKz: '', textRu: '', textKz: '', whatsappNumber: '', whatsappLabelRu: '', whatsappLabelKz: '', counterValue: '', counterLabelRu: '', counterLabelKz: '' } satisfies ReceptionContent;
    case 'candidates_intro':
    case 'program_intro':
      return { headingRu: '', headingKz: '', textRu: '', textKz: '' } satisfies TextImageContent;
    case 'join': return { titleRu: '', titleKz: '', subtitleRu: '', subtitleKz: '', imageUrl: '' } satisfies HeroContent;
    case 'reception_header':
      return {
        headingRu: '', headingKz: '', subtitleRu: '', subtitleKz: '',
        whatsappNumber: '', whatsappNoteRu: '', whatsappNoteKz: '',
        counterLabelRu: '', counterLabelKz: '', stat2LabelRu: '', stat2LabelKz: '', stat3LabelRu: '', stat3LabelKz: '',
        mockupImageUrl: '', mockupCaptionRu: '', mockupCaptionKz: '',
      } satisfies ReceptionHeaderContent;
    case 'reception_steps': return { items: [] } satisfies ReceptionStepsContent;
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
        <TextField label="Заголовок блока (RU)" value={content.headingRu ?? content.titleRu ?? ''} onChange={v => onChange({ ...content, headingRu: v })} />
        <TextField label="Заголовок блока (KZ)" value={content.headingKz ?? content.titleKz ?? ''} onChange={v => onChange({ ...content, headingKz: v })} />
      </div>
      <TextField label="Подзаголовок (RU)" value={content.textRu ?? ''} onChange={v => onChange({ ...content, textRu: v })} />
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2 items-start bg-[#F9F8F6] p-2.5 rounded-lg border border-[#DFDFDF]">
          <input value={item.labelRu} onChange={e => update(i, { labelRu: e.target.value })} placeholder="Название (RU)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.labelKz} onChange={e => update(i, { labelKz: e.target.value })} placeholder="Название (KZ)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.value} onChange={e => update(i, { value: e.target.value })} placeholder="Email / телефон / адрес" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.href ?? ''} onChange={e => update(i, { href: e.target.value })} placeholder="Ссылка (mailto:/tel:/https:)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <button onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })} className="text-[#89837E] hover:text-red-600 p-1.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ ...content, items: [...items, { labelRu: '', labelKz: '', value: '', href: '' }] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors"
      >
        <Plus size={14} /> Добавить контакт
      </button>
    </div>
  );
}

function ReceptionEditor({ content, onChange }: { content: ReceptionContent; onChange: (c: ReceptionContent) => void }) {
  const set = <K extends keyof ReceptionContent>(key: K, val: ReceptionContent[K]) => onChange({ ...content, [key]: val });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок (RU)" value={content.headingRu ?? ''} onChange={v => set('headingRu', v)} />
        <TextField label="Заголовок (KZ)" value={content.headingKz ?? ''} onChange={v => set('headingKz', v)} />
      </div>
      <TextField label="Подзаголовок (RU)" value={content.textRu ?? ''} onChange={v => set('textRu', v)} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="WhatsApp номер (только цифры/+)" value={content.whatsappNumber ?? ''} onChange={v => set('whatsappNumber', v)} placeholder="+7 700 088 19 17" />
        <TextField label="Подпись под номером (RU)" value={content.whatsappLabelRu ?? ''} onChange={v => set('whatsappLabelRu', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Счётчик (число)" value={content.counterValue ?? ''} onChange={v => set('counterValue', v)} placeholder="847" />
        <TextField label="Подпись под счётчиком (RU)" value={content.counterLabelRu ?? ''} onChange={v => set('counterLabelRu', v)} />
      </div>
    </div>
  );
}

function ReceptionHeaderEditor({ content, onChange }: { content: ReceptionHeaderContent; onChange: (c: ReceptionHeaderContent) => void }) {
  const set = <K extends keyof ReceptionHeaderContent>(key: K, val: ReceptionHeaderContent[K]) => onChange({ ...content, [key]: val });
  const { open, element } = useMediaPicker();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок (RU)" value={content.headingRu ?? ''} onChange={v => set('headingRu', v)} />
        <TextField label="Заголовок (KZ)" value={content.headingKz ?? ''} onChange={v => set('headingKz', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Подзаголовок (RU)" value={content.subtitleRu ?? ''} onChange={v => set('subtitleRu', v)} textarea />
        <TextField label="Подзаголовок (KZ)" value={content.subtitleKz ?? ''} onChange={v => set('subtitleKz', v)} textarea />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="WhatsApp номер" value={content.whatsappNumber ?? ''} onChange={v => set('whatsappNumber', v)} placeholder="+7 700 088 19 17" />
        <TextField label="Подпись под номером (RU)" value={content.whatsappNoteRu ?? ''} onChange={v => set('whatsappNoteRu', v)} placeholder="ответ обычно в течение дня" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Подпись счётчика 1 — обращений решено (RU)" value={content.counterLabelRu ?? ''} onChange={v => set('counterLabelRu', v)} />
        <TextField label="Подпись счётчика 2 — срок ответа (RU)" value={content.stat2LabelRu ?? ''} onChange={v => set('stat2LabelRu', v)} />
        <TextField label="Подпись счётчика 3 — филиалов (RU)" value={content.stat3LabelRu ?? ''} onChange={v => set('stat3LabelRu', v)} />
      </div>
      <p className="text-[10px] text-[#89837E] -mt-2">Значения счётчиков — не здесь: «обращений решено» считается автоматически из БД, остальные два берутся из раздела «Настройки» (ключи reception_avg_response_time, reception_branches_accepting)</p>
      <div>
        <label className="block text-[11px] font-bold text-[#89837E] uppercase tracking-wider mb-1">Мокап видеоприёма (картинка справа)</label>
        <div className="flex items-center gap-2">
          {content.mockupImageUrl ? (
            <img src={content.mockupImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-[#DFDFDF]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[#F2EBE3] flex items-center justify-center text-[#89837E]"><ImageIcon size={18} /></div>
          )}
          <button type="button" onClick={() => open((url) => set('mockupImageUrl', url), 'image/*')} className="px-3 py-2 text-xs bg-[#F2EBE3] text-[#383233] rounded-lg hover:bg-[#DFDFDF]">Выбрать</button>
        </div>
        {element}
      </div>
      <TextField label="Подпись под мокапом (RU)" value={content.mockupCaptionRu ?? ''} onChange={v => set('mockupCaptionRu', v)} textarea />
    </div>
  );
}

function ReceptionStepsEditor({ content, onChange }: { content: ReceptionStepsContent; onChange: (c: ReceptionStepsContent) => void }) {
  const items = content.items ?? [];
  const update = (i: number, patch: Partial<ReceptionStepItem>) => {
    onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[80px_1fr_32px] gap-2 items-start bg-[#F9F8F6] p-2.5 rounded-lg border border-[#DFDFDF]">
          <input value={item.titleRu} onChange={e => update(i, { titleRu: e.target.value })} placeholder="Шаг 1" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.textRu} onChange={e => update(i, { textRu: e.target.value })} placeholder="Заполните форму" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <button onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) })} className="text-[#89837E] hover:text-red-600 p-1.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ items: [...items, { titleRu: `Шаг ${items.length + 1}`, titleKz: '', textRu: '', textKz: '' }] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors"
      >
        <Plus size={14} /> Добавить шаг
      </button>
    </div>
  );
}

// Список строк — по одной на строку (для анимируемых слов, бегущей строки).
function StringListField({ label, value, onChange, placeholder }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#89837E] uppercase tracking-wider mb-1">{label}</label>
      <textarea
        rows={4}
        value={value.join('\n')}
        onChange={e => onChange(e.target.value.split('\n'))}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338] transition-colors resize-none font-mono"
      />
      <p className="text-[10px] text-[#89837E] mt-1">По одной строке на пункт</p>
    </div>
  );
}

function VideoPickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { open, element } = useMediaPicker();
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#89837E] uppercase tracking-wider mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {value ? (
          <video src={value} className="w-20 h-14 rounded-lg object-cover border border-[#DFDFDF] bg-black" muted />
        ) : (
          <div className="w-20 h-14 rounded-lg bg-[#F2EBE3] flex items-center justify-center text-[#89837E] text-[10px]">
            нет видео
          </div>
        )}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="/videos/hero-bg.mp4"
          className="flex-1 px-3 py-2 bg-[#F9F8F6] border border-[#DFDFDF] rounded-lg text-sm text-[#383233] focus:outline-none focus:border-[#D64338] font-mono"
        />
        <button type="button" onClick={() => open((url) => onChange(url), 'video/*')} className="px-3 py-2 text-xs bg-[#F2EBE3] text-[#383233] rounded-lg hover:bg-[#DFDFDF] shrink-0">
          Выбрать
        </button>
      </div>
      {element}
    </div>
  );
}

function HomeHeroEditor({ content, onChange }: { content: HomeHeroContent; onChange: (c: HomeHeroContent) => void }) {
  const set = <K extends keyof HomeHeroContent>(key: K, val: HomeHeroContent[K]) => onChange({ ...content, [key]: val });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок (RU)" value={content.titleRu ?? ''} onChange={v => set('titleRu', v)} textarea />
        <TextField label="Заголовок (KZ)" value={content.titleKz ?? ''} onChange={v => set('titleKz', v)} textarea />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StringListField label="Анимируемые слова (RU)" value={content.wordsRu ?? []} onChange={v => set('wordsRu', v)} placeholder={'С ВЫБОРА\nС НПК\nСЕГОДНЯ'} />
        <StringListField label="Анимируемые слова (KZ)" value={content.wordsKz ?? []} onChange={v => set('wordsKz', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Подзаголовок (RU)" value={content.subtitleRu ?? ''} onChange={v => set('subtitleRu', v)} textarea />
        <TextField label="Подзаголовок (KZ)" value={content.subtitleKz ?? ''} onChange={v => set('subtitleKz', v)} textarea />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Кнопка 1 (RU)" value={content.cta1LabelRu ?? ''} onChange={v => set('cta1LabelRu', v)} />
        <TextField label="Кнопка 1 (KZ)" value={content.cta1LabelKz ?? ''} onChange={v => set('cta1LabelKz', v)} />
        <TextField label="Ссылка кнопки 1" value={content.cta1Href ?? ''} onChange={v => set('cta1Href', v)} placeholder="/vstupit" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Кнопка 2 (RU)" value={content.cta2LabelRu ?? ''} onChange={v => set('cta2LabelRu', v)} />
        <TextField label="Кнопка 2 (KZ)" value={content.cta2LabelKz ?? ''} onChange={v => set('cta2LabelKz', v)} />
        <TextField label="Ссылка кнопки 2" value={content.cta2Href ?? ''} onChange={v => set('cta2Href', v)} placeholder="/programma" />
      </div>
      <VideoPickerField label="Видео-фон" value={content.videoUrl ?? ''} onChange={v => set('videoUrl', v)} />
    </div>
  );
}

function TickerEditor({ content, onChange }: { content: TickerContent; onChange: (c: TickerContent) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StringListField label="Фразы бегущей строки (RU)" value={content.phrasesRu ?? []} onChange={v => onChange({ ...content, phrasesRu: v })} />
      <StringListField label="Фразы бегущей строки (KZ)" value={content.phrasesKz ?? []} onChange={v => onChange({ ...content, phrasesKz: v })} />
    </div>
  );
}

function StatsEditor({ content, onChange }: { content: StatsContent; onChange: (c: StatsContent) => void }) {
  const items = content.items ?? [];
  const update = (i: number, patch: Partial<StatItem>) => {
    onChange({ ...content, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Заголовок (RU)" value={content.headingRu ?? ''} onChange={v => onChange({ ...content, headingRu: v })} />
        <TextField label="Заголовок (KZ)" value={content.headingKz ?? ''} onChange={v => onChange({ ...content, headingKz: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Вводный текст (RU)" value={content.introRu ?? ''} onChange={v => onChange({ ...content, introRu: v })} textarea />
        <TextField label="Вводный текст (KZ)" value={content.introKz ?? ''} onChange={v => onChange({ ...content, introKz: v })} textarea />
      </div>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[80px_70px_1fr_1fr_32px] gap-2 items-start bg-[#F9F8F6] p-2.5 rounded-lg border border-[#DFDFDF]">
          <input value={item.value} onChange={e => update(i, { value: e.target.value })} placeholder="30" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.suffix ?? ''} onChange={e => update(i, { suffix: e.target.value })} placeholder="+" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.labelRu} onChange={e => update(i, { labelRu: e.target.value })} placeholder="Подпись (RU)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <input value={item.labelKz} onChange={e => update(i, { labelKz: e.target.value })} placeholder="Подпись (KZ)" className="px-2 py-1.5 border border-[#DFDFDF] rounded text-sm bg-white" />
          <button onClick={() => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })} className="text-[#89837E] hover:text-red-600 p-1.5">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ ...content, items: [...items, { value: '', suffix: '', labelRu: '', labelKz: '' }] })}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#DFDFDF] rounded-lg text-xs text-[#89837E] hover:border-[#D64338] hover:text-[#D64338] transition-colors"
      >
        <Plus size={14} /> Добавить показатель
      </button>
    </div>
  );
}

function VideoEditor({ content, onChange }: { content: VideoContent; onChange: (c: VideoContent) => void }) {
  return <VideoPickerField label="Видео" value={content.videoUrl ?? ''} onChange={v => onChange({ ...content, videoUrl: v })} />;
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
    case 'home_hero': return <HomeHeroEditor content={block.content as unknown as HomeHeroContent} onChange={asChange<HomeHeroContent>(onChange)} />;
    case 'ticker': return <TickerEditor content={block.content as unknown as TickerContent} onChange={asChange<TickerContent>(onChange)} />;
    case 'stats': return <StatsEditor content={block.content as unknown as StatsContent} onChange={asChange<StatsContent>(onChange)} />;
    case 'video': return <VideoEditor content={block.content as unknown as VideoContent} onChange={asChange<VideoContent>(onChange)} />;
    case 'about_hero': return <HeroEditor content={block.content as unknown as HeroContent} onChange={asChange<HeroContent>(onChange)} />;
    case 'about_community':
    case 'about_methods':
    case 'about_structure':
    case 'about_goal':
      return <TextImageEditor content={block.content as unknown as TextImageContent} onChange={asChange<TextImageContent>(onChange)} />;
    case 'press_hero': return <HeroEditor content={block.content as unknown as HeroContent} onChange={asChange<HeroContent>(onChange)} />;
    case 'press_studio':
    case 'press_cta':
      return <TextImageEditor content={block.content as unknown as TextImageContent} onChange={asChange<TextImageContent>(onChange)} />;
    case 'reception': return <ReceptionEditor content={block.content as unknown as ReceptionContent} onChange={asChange<ReceptionContent>(onChange)} />;
    case 'candidates_intro':
    case 'program_intro':
      return <TextImageEditor content={block.content as unknown as TextImageContent} onChange={asChange<TextImageContent>(onChange)} />;
    case 'join': return <HeroEditor content={block.content as unknown as HeroContent} onChange={asChange<HeroContent>(onChange)} />;
    case 'reception_header': return <ReceptionHeaderEditor content={block.content as unknown as ReceptionHeaderContent} onChange={asChange<ReceptionHeaderContent>(onChange)} />;
    case 'reception_steps': return <ReceptionStepsEditor content={block.content as unknown as ReceptionStepsContent} onChange={asChange<ReceptionStepsContent>(onChange)} />;
  }
}

// ─── Local editable block (id используется только как React key) ─────────────

interface EditableBlock {
  key: string;
  type: PageBlock['type'];
  content: Record<string, unknown>;
}

// ─── Drag handle wrapper for a block card ─────────────────────────────────────

function SortableBlock({ id, children }: {
  id: string;
  children: (drag: { attributes: React.HTMLAttributes<HTMLButtonElement>; listeners?: React.HTMLAttributes<HTMLButtonElement> }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

// ─── Nested nav item (мини-панель «Страницы») ────────────────────────────────

function PageNavItem({ node, activeSlug, pagesList, onNavigatePage, depth = 0 }: {
  node: PageNavNode;
  activeSlug: string;
  pagesList?: Array<{ slug: string; isPublished: boolean }>;
  onNavigatePage: (slug: string) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const isActivePage = !!node.pageSlug && node.pageSlug === activeSlug;
  const pageMeta = node.pageSlug ? pagesList?.find(p => p.slug === node.pageSlug) : undefined;
  const hasChildren = !!node.children?.length;

  const rowClass = `w-full flex items-center gap-1.5 text-left px-4 py-2.5 text-sm transition-colors ${
    isActivePage ? 'bg-[#F2EBE3] text-[#D64338] font-medium border-r-2 border-[#D64338]' : 'text-[#383233] hover:bg-[#F9F8F6]'
  }`;

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: depth * 12 }}>
        {hasChildren && (
          <button onClick={() => setOpen(v => !v)} className="p-1 text-[#89837E] hover:text-[#383233] shrink-0">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        )}
        {node.pageSlug ? (
          <button onClick={() => onNavigatePage(node.pageSlug!)} className={rowClass}>
            {node.label}
            {pageMeta && !pageMeta.isPublished && <span className="ml-2 text-[10px] text-[#89837E]">(скрыто)</span>}
          </button>
        ) : (
          <Link to={node.route!} className={rowClass}>{node.label}</Link>
        )}
      </div>
      {hasChildren && open && (
        <div className="border-l border-[#EDEAE5] ml-6">
          {node.children!.map((child) => (
            <PageNavItem key={child.label} node={child} activeSlug={activeSlug} pagesList={pagesList} onNavigatePage={onNavigatePage} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Мини-панель «Страницы» (используется и в PagesLayout для дочерних CRUD) ──

export function PagesSidebar({ activeSlug }: { activeSlug: string }) {
  const navigate = useNavigate();
  const { data: pagesList } = usePages();
  return (
    <aside className="w-56 shrink-0 border-r border-[#DFDFDF] bg-white overflow-y-auto">
      <div className="px-4 py-3 border-b border-[#DFDFDF]">
        <h2 className="text-sm font-bold text-[#383233]">Страницы сайта</h2>
      </div>
      <nav className="py-2">
        {PAGE_NAV_TREE.map((node) => (
          <PageNavItem key={node.label} node={node} activeSlug={activeSlug} pagesList={pagesList} onNavigatePage={(s) => navigate(`/pages/${s}`)} />
        ))}
      </nav>
    </aside>
  );
}

function PageVisibilityPanel() {
  const user = useAuthStore((state) => state.user);
  const { data: pages = [], isLoading } = usePages();
  const visibilityMut = useSetPageVisibility();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <section className="bg-white border border-[#DFDFDF] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#DFDFDF]">
        <h2 className="font-bold text-[#383233]">Показывать страницы на сайте</h2>
        <p className="text-xs text-[#89837E] mt-1">Скрытая страница исчезает из меню, а её адрес перенаправляет на главную. Переключатели доступны только администратору.</p>
      </div>
      {isLoading ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-[#89837E]" size={22} /></div>
      ) : (
        <div className="divide-y divide-[#EDEAE5]">
          {PAGE_VISIBILITY_CATALOG.map((item) => {
            const visible = pages.find((page) => page.slug === item.slug)?.isPublished ?? true;
            const locked = item.slug === 'home';
            return (
              <div key={item.slug} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#383233]">{item.title}</p>
                  <p className="text-xs text-[#89837E]">{item.path}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={visible}
                  aria-label={`${visible ? 'Скрыть' : 'Показать'} страницу «${item.title}»`}
                  disabled={!isAdmin || locked || visibilityMut.isPending}
                  onClick={() => visibilityMut.mutate({ slug: item.slug, visible: !visible })}
                  className={`w-28 px-3 py-2 text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                    visible ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#F2EBE3] text-[#89837E] border border-[#DFDFDF]'
                  }`}
                >
                  {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {visible ? 'Показывается' : 'Скрыта'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function PageEditor({ slugOverride }: { slugOverride?: string } = {}) {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = slugOverride ?? routeSlug ?? 'home';

  const { data: page, isLoading } = usePage(slug);
  const updateMut = useUpdatePage(slug);
  const canManageVisibility = useAuthStore((state) => state.user?.role === 'ADMIN');

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks(prev => {
      const oldIndex = prev.findIndex(b => b.key === active.id);
      const newIndex = prev.findIndex(b => b.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
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
    <>
      {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#89837E]" size={28} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 space-y-5">
            {slug === 'home' && <PageVisibilityPanel />}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-[#383233]">{SITE_PAGES[slug]?.label ?? slug}</h1>
                <p className="text-xs text-[#89837E] mt-0.5">{SITE_PAGES[slug]?.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[#383233]">
                  <input type="checkbox" checked={isPublished} disabled={!canManageVisibility} onChange={e => setIsPublished(e.target.checked)} className="accent-[#D64338] disabled:opacity-50" />
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
              <p className="text-xs text-[#89837E] -mt-2">Перетащите за ⠿ чтобы изменить порядок секций на странице</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.key)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block, i) => (
                    <SortableBlock key={block.key} id={block.key}>
                      {({ attributes, listeners }) => (
                        <div className="bg-white rounded-xl border border-[#DFDFDF] overflow-hidden mb-3">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F8F6] border-b border-[#DFDFDF]">
                            <div className="flex items-center gap-2">
                              <button {...attributes} {...listeners} className="text-[#89837E] hover:text-[#383233] cursor-grab active:cursor-grabbing">
                                <GripVertical size={16} />
                              </button>
                              <span className="text-xs font-bold text-[#383233] uppercase tracking-wide">
                                {i + 1}. {BLOCK_TYPES[block.type]}
                              </span>
                            </div>
                            <button onClick={() => removeBlock(i)} className="p-1.5 text-[#89837E] hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="p-4">
                            <BlockEditor
                              block={{ id: block.key, type: block.type, sortOrder: i, content: block.content }}
                              onChange={(content) => setBlocks(prev => prev.map((b, idx) => (idx === i ? { ...b, content } : b)))}
                            />
                          </div>
                        </div>
                      )}
                    </SortableBlock>
                  ))}
                </SortableContext>
              </DndContext>

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
    </>
  );
}
