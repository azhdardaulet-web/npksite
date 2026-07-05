import { useState } from 'react';
import { Plus, Trash2, Pencil, Building2, Phone, Mail, MapPin, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  type Branch,
  type BranchInput,
} from '@/hooks/useBranches';

// ─── Form ───────────────────────────────────────────────────────────────────

type FormState = BranchInput;

const EMPTY_FORM: FormState = {
  cityRu: '',
  cityKz: '',
  addressRu: '',
  addressKz: '',
  phone: '',
  email: '',
  department: '',
  chairman: '',
  lng: null,
  lat: null,
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    'w-full border border-[#DFDFDF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D64338] transition-colors bg-[#F9F8F6] text-[#383233]';
  return (
    <div>
      <label className="block text-xs font-bold text-[#383233] uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-[#D64338]">*</span>}
      </label>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function BranchModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: Branch;
  onSave: (data: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          cityRu: initial.cityRu,
          cityKz: initial.cityKz,
          addressRu: initial.addressRu,
          addressKz: initial.addressKz,
          phone: initial.phone,
          email: initial.email,
          department: initial.department ?? '',
          chairman: initial.chairman ?? '',
          lng: initial.lng,
          lat: initial.lat,
        }
      : { ...EMPTY_FORM }
  );

  const set = (key: keyof FormState, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const isValid =
    form.cityRu && form.cityKz && form.addressRu && form.addressKz && form.phone && form.email;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#DFDFDF] flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold text-[#383233]">{initial ? 'Редактировать филиал' : 'Добавить филиал'}</h2>
          <button onClick={onClose} className="text-[#89837E] hover:text-[#383233] text-xl leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Город/область (RU)" value={form.cityRu} onChange={(v) => set('cityRu', v)} placeholder="Астана" required />
            <Field label="Город/область (KZ)" value={form.cityKz} onChange={(v) => set('cityKz', v)} placeholder="Астана" required />
          </div>

          <Field label="Адрес (RU)" value={form.addressRu} onChange={(v) => set('addressRu', v)} placeholder="пр. Кабанбай батыра, 18" required textarea />
          <Field label="Адрес (KZ)" value={form.addressKz} onChange={(v) => set('addressKz', v)} placeholder="Қабанбай батыр даңғылы, 18" required textarea />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Телефон" value={form.phone} onChange={(v) => set('phone', v)} placeholder="+7 7172 70 12 34" required />
            <Field label="Email" value={form.email} onChange={(v) => set('email', v)} placeholder="astana@npk.kz" required />
          </div>

          <Field label="Председатель филиала" value={form.chairman ?? ''} onChange={(v) => set('chairman', v)} placeholder="Нурлан Сагинтаев" />
          <Field label="Отдел/подразделение (необязательно)" value={form.department ?? ''} onChange={(v) => set('department', v)} placeholder="" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Долгота (lng)" value={form.lng?.toString() ?? ''} onChange={(v) => setForm((p) => ({ ...p, lng: v ? Number(v) : null }))} placeholder="71.430564" />
            <Field label="Широта (lat)" value={form.lat?.toString() ?? ''} onChange={(v) => setForm((p) => ({ ...p, lat: v ? Number(v) : null }))} placeholder="51.128207" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#DFDFDF] flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#89837E] hover:text-[#383233]">
            Отмена
          </button>
          <button
            disabled={!isValid || saving}
            onClick={() => onSave(form)}
            className="px-5 py-2 text-sm bg-[#D64338] text-white rounded-lg hover:bg-[#b8362d] disabled:opacity-40 font-medium flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Branch row ───────────────────────────────────────────────────────────────

function BranchRow({ branch, onEdit, onDelete, readOnly }: { branch: Branch; onEdit: () => void; onDelete: () => void; readOnly?: boolean }) {
  return (
    <div className="bg-white border border-[#DFDFDF] rounded-xl px-5 py-4 flex gap-4 group hover:border-[#D64338]/30 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-[#F2EBE3] flex items-center justify-center shrink-0">
        <Building2 className="w-6 h-6 text-[#D64338]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#383233] text-sm leading-tight">{branch.cityRu}</p>
        {branch.chairman && <p className="text-[#D64338] text-xs mt-0.5 mb-2 flex items-center gap-1"><User className="w-3 h-3" />{branch.chairman}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#383233]/60 mt-1">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 shrink-0 text-[#D64338]" />{branch.addressRu}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 shrink-0 text-[#D64338]" />{branch.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 shrink-0 text-[#D64338]" />{branch.email}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-[#F2EBE3] text-[#89837E] hover:text-[#383233] transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        {!readOnly && (
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 text-[#89837E] hover:text-[#D64338] transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BranchesPage() {
  const { user } = useAuthStore();
  const isBranchEditor = user?.role === 'BRANCH_EDITOR';

  const { data: branches = [], isLoading } = useBranches();
  const createMut = useCreateBranch();
  const [modal, setModal] = useState<{ open: boolean; editing?: Branch }>({ open: false });

  const updateMut = useUpdateBranch(modal.editing?.id ?? '');
  const deleteMut = useDeleteBranch();

  const visibleBranches = isBranchEditor
    ? branches.filter((b) => b.id === user?.branchId)
    : branches;

  const handleSave = async (data: BranchInput) => {
    if (modal.editing) {
      await updateMut.mutateAsync(data);
    } else {
      await createMut.mutateAsync(data);
    }
    setModal({ open: false });
  };

  const handleDelete = (branch: Branch) => {
    if (window.confirm(`Удалить филиал «${branch.cityRu}»?`)) {
      deleteMut.mutate(branch.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <div className="bg-white border-b border-[#DFDFDF] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-[#383233] text-lg">{isBranchEditor ? 'Мой филиал' : 'Филиалы'}</h1>
          <p className="text-[#89837E] text-sm mt-0.5">Региональные отделения партии</p>
        </div>
        {!isBranchEditor && (
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-[#D64338] text-white text-sm rounded-lg hover:bg-[#b8362d] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить филиал
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#89837E]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : visibleBranches.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-[#DFDFDF]" />
            <p className="text-[#89837E]">Филиалы не добавлены</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleBranches.map((branch) => (
              <BranchRow
                key={branch.id}
                branch={branch}
                readOnly={isBranchEditor}
                onEdit={() => setModal({ open: true, editing: branch })}
                onDelete={() => handleDelete(branch)}
              />
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <BranchModal
          initial={modal.editing}
          saving={createMut.isPending || updateMut.isPending}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
