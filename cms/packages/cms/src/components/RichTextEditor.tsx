import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Code2,
  Link as LinkIcon, ImageIcon, Minus, Undo, Redo, List, ListOrdered,
  Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, RemoveFormatting,
  ChevronDown,
} from 'lucide-react';
import { useMediaPicker } from '@/components/MediaLibrary/MediaPicker';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const TEXT_TYPES = [
  { label: 'Обычный текст', action: (e: ReturnType<typeof useEditor>) => e?.chain().setParagraph().run() },
  { label: 'Заголовок 1',   action: (e: ReturnType<typeof useEditor>) => e?.chain().toggleHeading({ level: 1 }).run() },
  { label: 'Заголовок 2',   action: (e: ReturnType<typeof useEditor>) => e?.chain().toggleHeading({ level: 2 }).run() },
  { label: 'Заголовок 3',   action: (e: ReturnType<typeof useEditor>) => e?.chain().toggleHeading({ level: 3 }).run() },
  { label: 'Заголовок 4',   action: (e: ReturnType<typeof useEditor>) => e?.chain().toggleHeading({ level: 4 }).run() },
];

const ALIGN_OPTIONS = [
  { icon: AlignLeft,    value: 'left',    title: 'По левому краю' },
  { icon: AlignCenter,  value: 'center',  title: 'По центру' },
  { icon: AlignRight,   value: 'right',   title: 'По правому краю' },
  { icon: AlignJustify, value: 'justify', title: 'По ширине' },
];

const PRESET_COLORS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#FFFFFF',
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Напишите текст...',
  minHeight = 300,
}: RichTextEditorProps) {
  const { open: openPicker, element: pickerElement } = useMediaPicker();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [alignDropOpen, setAlignDropOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-sm max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) editor.commands.setContent(value, false);
  }, [value, editor]);

  if (!editor) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const activeTextType = () => {
    for (let i = 1; i <= 4; i++) {
      if (editor.isActive('heading', { level: i })) return `Заголовок ${i}`;
    }
    return 'Обычный текст';
  };

  const activeAlign = () => {
    const opt = ALIGN_OPTIONS.find((a) => editor.isActive({ textAlign: a.value }));
    return opt ?? ALIGN_OPTIONS[0];
  };

  const ToolBtn = ({
    onClick, active, title, children, className = '',
  }: {
    onClick: () => void; active?: boolean; title: string;
    children: React.ReactNode; className?: string;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`p-1.5 rounded text-sm transition-colors ${
        active ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;

  // ── Link ─────────────────────────────────────────────────────────────────

  const handleSetLink = () => {
    const current = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(current ?? '');
    setLinkDialogOpen(true);
  };

  const applyLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  // ── Image ─────────────────────────────────────────────────────────────────

  const handleInsertImage = () => {
    openPicker((url) => editor.chain().focus().setImage({ src: url }).run(), 'image/*');
  };

  // ── Color ─────────────────────────────────────────────────────────────────

  const applyColor = (color: string) => {
    setCurrentColor(color);
    editor.chain().setColor(color).run();
    setColorPickerOpen(false);
  };

  const AlignIcon = activeAlign().icon;

  return (
    <div className="border border-gray-300 rounded-lg overflow-visible focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="relative flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 rounded-t-lg">

        {/* Undo / Redo */}
        <ToolBtn title="Отменить (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={15} />
        </ToolBtn>
        <ToolBtn title="Повторить (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={15} />
        </ToolBtn>

        <Divider />

        {/* Text type dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setTypeDropOpen((v) => !v); setAlignDropOpen(false); setColorPickerOpen(false); }}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
          >
            {activeTextType()}
            <ChevronDown size={12} />
          </button>
          {typeDropOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
              {TEXT_TYPES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); t.action(editor); setTypeDropOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Alignment dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setAlignDropOpen((v) => !v); setTypeDropOpen(false); setColorPickerOpen(false); }}
            className="flex items-center gap-0.5 px-1.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <AlignIcon size={15} />
            <ChevronDown size={11} />
          </button>
          {alignDropOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {ALIGN_OPTIONS.map(({ icon: Icon, value, title }) => (
                <button
                  key={value}
                  type="button"
                  title={title}
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().setTextAlign(value).run(); setAlignDropOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    editor.isActive({ textAlign: value }) ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  <Icon size={14} />
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Color picker */}
        <div className="relative">
          <button
            type="button"
            title="Цвет текста"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setColorPickerOpen((v) => !v); setTypeDropOpen(false); setAlignDropOpen(false); }}
            className="flex items-center gap-0.5 px-1.5 py-1.5 hover:bg-gray-100 rounded"
          >
            <span className="flex flex-col items-center">
              <span className="text-xs font-bold text-gray-700 leading-none" style={{ fontSize: '13px' }}>A</span>
              <span className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: currentColor }} />
            </span>
            <ChevronDown size={11} className="text-gray-500" />
          </button>
          {colorPickerOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 w-[168px]">
              <div className="grid grid-cols-5 gap-1 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c); }}
                    className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={currentColor}
                  onChange={(e) => applyColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-500">Другой цвет</span>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Inline formatting */}
        <ToolBtn title="Жирный (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().toggleBold().run()}>
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn title="Курсив (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().toggleItalic().run()}>
          <Italic size={15} />
        </ToolBtn>
        <ToolBtn title="Подчёркнутый (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolBtn>
        <ToolBtn title="Зачёркнутый" active={editor.isActive('strike')} onClick={() => editor.chain().toggleStrike().run()}>
          <Strikethrough size={15} />
        </ToolBtn>
        <ToolBtn title="Инлайн-код" active={editor.isActive('code')} onClick={() => editor.chain().toggleCode().run()}>
          <Code size={15} />
        </ToolBtn>
        <ToolBtn title="Очистить форматирование" onClick={() => editor.chain().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting size={15} />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn title="Маркированный список" active={editor.isActive('bulletList')} onClick={() => editor.chain().toggleBulletList().run()}>
          <List size={15} />
        </ToolBtn>
        <ToolBtn title="Нумерованный список" active={editor.isActive('orderedList')} onClick={() => editor.chain().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolBtn>

        <Divider />

        {/* Rich elements */}
        <ToolBtn title="Ссылка" active={editor.isActive('link')} onClick={handleSetLink}>
          <LinkIcon size={15} />
        </ToolBtn>
        <ToolBtn title="Вставить изображение" onClick={handleInsertImage}>
          <ImageIcon size={15} />
        </ToolBtn>
        <ToolBtn title="Блок кода" active={editor.isActive('codeBlock')} onClick={() => editor.chain().toggleCodeBlock().run()}>
          <Code2 size={15} />
        </ToolBtn>
        <ToolBtn title="Цитата" active={editor.isActive('blockquote')} onClick={() => editor.chain().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolBtn>
        <ToolBtn title="Горизонтальная линия" onClick={() => editor.chain().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolBtn>
      </div>

      {/* ── Editor area ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-b-lg" onClick={() => { setTypeDropOpen(false); setAlignDropOpen(false); setColorPickerOpen(false); }}>
        <EditorContent editor={editor} />
      </div>

      {/* ── Link dialog ──────────────────────────────────────────────────── */}
      {linkDialogOpen && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-t border-blue-100">
          <LinkIcon size={14} className="text-blue-500 shrink-0" />
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setLinkDialogOpen(false); }}
            placeholder="https://example.com"
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder-blue-300"
          />
          <button type="button" onClick={applyLink} className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded">
            Применить
          </button>
          <button type="button" onClick={() => setLinkDialogOpen(false)} className="text-xs text-gray-500 hover:text-gray-700">
            Отмена
          </button>
        </div>
      )}

      {/* ── Media picker ─────────────────────────────────────────────────── */}
      {pickerElement}
    </div>
  );
}
