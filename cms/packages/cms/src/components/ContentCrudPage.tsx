import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useMediaPicker } from '@/components/MediaLibrary/MediaPicker';
import { useEntityList, useDeleteEntity } from '@/hooks/useGenericContent';

// ─── Generic config-driven CRUD page for simple content models ───────────────
// Используется для справочных сущностей CMS (Candidate, HistoryEvent,
// ProgramBlock, MediaProject, MediaPublication, Testimonial, MenuItem) —
// разный набор полей, но одинаковый список+модалка+сортировка.

export type FieldType = 'text' | 'textarea' | 'number' | 'image' | 'points';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
}

export interface ContentCrudConfig<TItem extends { id: string }, TForm> {
  title: string;
  description: string;
  basePath: string;
  hasSortOrder?: boolean;
  emptyForm: TForm;
  parseItem: (item: TItem) => TForm;
  buildPayload: (form: TForm) => unknown;
  getRowTitle: (item: TItem) => string;
  getRowSubtitle?: (item: TItem) => string | undefined;
  renderForm: (props: {
    form: TForm;
    setForm: (updater: (prev: TForm) => TForm) => void;
    openImagePicker: (onPick: (url: string) => void, accept?: string) => void;
  }) => React.ReactNode;
  isValid: (form: TForm) => boolean;
}

export function ContentCrudPage<TItem extends { id: string; sortOrder?: number }, TForm>({
  config,
}: {
  config: ContentCrudConfig<TItem, TForm>;
}) {
  const { data: items = [], isLoading } = useEntityList<TItem>(config.basePath);
  const deleteMut = useDeleteEntity(config.basePath);
  const { open: openImagePicker, element: imagePickerEl } = useMediaPicker();
  const qc = useQueryClient();

  const [modal, setModal] = useState<{ open: boolean; editing?: TItem }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [form, setFormState] = useState<TForm>(config.emptyForm);
  const setForm = (updater: (prev: TForm) => TForm) => setFormState(updater);

  const openCreate = () => {
    setFormState(config.emptyForm);
    setModal({ open: true });
  };

  const openEdit = (item: TItem) => {
    setFormState(config.parseItem(item));
    setModal({ open: true, editing: item });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = config.buildPayload(form);
      if (modal.editing) {
        await api.put(`/cms/api/v1/${config.basePath}/${modal.editing.id}`, payload);
      } else {
        await api.post(`/cms/api/v1/${config.basePath}`, payload);
      }
      qc.invalidateQueries({ queryKey: [config.basePath] });
      setModal({ open: false });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: TItem) => {
    if (window.confirm(`Удалить «${config.getRowTitle(item)}»?`)) {
      deleteMut.mutate(item.id);
    }
  };

  const moveItem = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    if (a.sortOrder === undefined || b.sortOrder === undefined) return;
    await Promise.all([
      api.put(`/cms/api/v1/${config.basePath}/${a.id}`, { sortOrder: b.sortOrder }),
      api.put(`/cms/api/v1/${config.basePath}/${b.id}`, { sortOrder: a.sortOrder }),
    ]);
    qc.invalidateQueries({ queryKey: [config.basePath] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">{config.title}</h1>
          <p className="text-sm text-brand-gray mt-0.5">{config.description}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-silver" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-brand-gray text-sm">Пока ничего не добавлено</div>
        ) : (
          <div className="divide-y divide-brand-silver/30">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-brand-cream/30 transition-colors">
                {config.hasSortOrder && (
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-brand-gray hover:text-brand-dark disabled:opacity-30">
                      <ChevronUp size={13} />
                    </button>
                    <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="text-brand-gray hover:text-brand-dark disabled:opacity-30">
                      <ChevronDown size={13} />
                    </button>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">{config.getRowTitle(item)}</p>
                  {config.getRowSubtitle?.(item) && (
                    <p className="text-xs text-brand-gray truncate">{config.getRowSubtitle(item)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-brand-gray hover:text-brand-dark hover:bg-brand-cream rounded">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-1.5 text-brand-gray hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-brand-silver/40 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-brand-dark">{modal.editing ? 'Редактировать' : 'Добавить'}</h2>
              <button onClick={() => setModal({ open: false })} className="text-brand-gray hover:text-brand-dark text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {config.renderForm({ form, setForm, openImagePicker })}
            </div>
            <div className="px-6 py-4 border-t border-brand-silver/40 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-brand-gray hover:text-brand-dark">
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={!config.isValid(form) || saving}
                className="px-4 py-2 text-sm bg-brand-red text-white rounded-lg hover:bg-brand-red/90 disabled:opacity-40 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
      {imagePickerEl}
    </div>
  );
}

// ─── Small shared form field components (используются в renderForm) ──────────

export function CrudTextField({ label, value, onChange, textarea, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string;
}) {
  const cls = 'w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red bg-white';
  return (
    <div>
      <label className="block text-xs font-medium text-brand-gray uppercase tracking-wide mb-1">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls + ' resize-none'} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

export function CrudLangTabs({ activeLang, onChange }: { activeLang: 'ru' | 'kz'; onChange: (l: 'ru' | 'kz') => void }) {
  return (
    <div className="flex gap-1 mb-2">
      {(['ru', 'kz'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            activeLang === l ? 'bg-brand-dark text-white' : 'bg-brand-cream text-brand-gray hover:bg-brand-silver/40'
          }`}
        >
          {l === 'ru' ? 'РУ' : 'ҚЗ'}
        </button>
      ))}
    </div>
  );
}
