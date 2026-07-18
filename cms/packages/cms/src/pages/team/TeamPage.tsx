import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Pencil, ChevronLeft, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useTeam,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useReorderTeam,
  TeamMember,
  TeamMemberInput,
  TeamMemberGroup,
} from '@/hooks/useTeam';

const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'kz', label: 'ҚАЗ' },
  { code: 'en', label: 'ENG' },
];

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableMemberRow({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  onEdit: (m: TeamMember) => void;
  onDelete: (m: TeamMember) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ruTr = member.translations.find((t) => t.lang === 'ru');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>

      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={ruTr?.name} className="w-full h-full object-cover" />
        ) : (
          <User size={20} className="text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{ruTr?.name ?? '—'}</p>
        <p className="text-sm text-gray-500 truncate">{ruTr?.position ?? ''}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {LANGS.map((l) => {
          const filled = member.translations.some((t) => t.lang === l.code && t.name);
          return (
            <span
              key={l.code}
              className={`text-xs px-1.5 py-0.5 rounded font-mono ${filled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
            >
              {l.label}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(member)}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(member)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Member form modal ────────────────────────────────────────────────────────

function MemberModal({
  initial,
  group,
  onSave,
  onClose,
  loading,
}: {
  initial?: TeamMember;
  group?: TeamMemberGroup;
  onSave: (data: TeamMemberInput) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const isDeputy = (initial?.group ?? group) === 'FACTION';
  const [activeLang, setActiveLang] = useState('ru');
  const [translations, setTranslations] = useState<Record<string, { name: string; position: string; bio: string }>>(
    () => {
      const init: Record<string, { name: string; position: string; bio: string }> = {};
      LANGS.forEach(({ code }) => {
        const t = initial?.translations.find((x) => x.lang === code);
        init[code] = { name: t?.name ?? '', position: t?.position ?? '', bio: t?.bio ?? '' };
      });
      return init;
    }
  );

  function setField(lang: string, field: 'name' | 'position' | 'bio', value: string) {
    setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  }

  function handleSave() {
    const trs = LANGS.filter(({ code }) => translations[code].name).map(({ code }) => ({
      lang: code,
      name: translations[code].name,
      position: translations[code].position,
      bio: translations[code].bio || null,
    }));
    onSave({ photoUrl: photoUrl || null, email: email || null, translations: trs });
  }

  const cur = translations[activeLang];
  const isValid = translations['ru']?.name && translations['ru']?.position;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {initial ? 'Редактировать' : 'Добавить сотрудника'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фото (URL)</label>
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            {photoUrl && (
              <img
                src={photoUrl}
                alt=""
                className="mt-2 h-12 w-12 object-cover rounded-full border border-gray-200"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          {isDeputy && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (для приглашения на видеоприём Google Meet)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="deputy@example.com"
              />
            </div>
          )}

          <div>
            <div className="flex gap-2 mb-3">
              {LANGS.map(({ code, label }) => {
                const filled = translations[code]?.name;
                return (
                  <button
                    key={code}
                    onClick={() => setActiveLang(code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      activeLang === code
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${filled ? 'bg-green-400' : 'bg-gray-300'}`}
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя {activeLang === 'ru' && <span className="text-red-500">*</span>}
                </label>
                <input
                  value={cur.name}
                  onChange={(e) => setField(activeLang, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Должность {activeLang === 'ru' && <span className="text-red-500">*</span>}
                </label>
                <input
                  value={cur.position}
                  onChange={(e) => setField(activeLang, 'position', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Биография</label>
                <textarea
                  rows={3}
                  value={cur.bio}
                  onChange={(e) => setField(activeLang, 'bio', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Отмена
          </button>
          <button
            disabled={loading || !isValid}
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TeamPage({
  group,
  title = 'Команда',
  embedded = false,
}: {
  group?: TeamMemberGroup;
  title?: string;
  embedded?: boolean;
} = {}) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { data: allMembers = [], isLoading } = useTeam();
  // По умолчанию (страница «Команда») скрываем депутатов фракции — они
  // управляются отдельно на «Фракция → Депутаты» (group=FACTION).
  const members = group
    ? allMembers.filter((m) => m.group === group)
    : allMembers.filter((m) => m.group !== 'FACTION');
  const [items, setItems] = useState<TeamMember[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing?: TeamMember }>({ open: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMut = useCreateTeamMember();
  const deleteMut = useDeleteTeamMember();
  const reorderMut = useReorderTeam();
  const updateMut = useUpdateTeamMember(editingId ?? '');

  const displayItems = items.length > 0 ? items : members;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const base = items.length > 0 ? items : members;
    const oldIndex = base.findIndex((m) => m.id === active.id);
    const newIndex = base.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(base, oldIndex, newIndex);
    setItems(reordered);
    reorderMut.mutate(reordered.map((m) => m.id));
  }

  function handleDelete(member: TeamMember) {
    const name = member.translations.find((t) => t.lang === 'ru')?.name ?? member.id;
    if (window.confirm(`Удалить сотрудника «${name}»?`)) {
      deleteMut.mutate(member.id);
      setItems((prev) => prev.filter((m) => m.id !== member.id));
    }
  }

  function handleEdit(member: TeamMember) {
    setEditingId(member.id);
    setModal({ open: true, editing: member });
  }

  function handleSave(data: TeamMemberInput) {
    const mut = modal.editing ? updateMut : createMut;
    const payload: TeamMemberInput = modal.editing ? data : { ...data, group: group ?? 'LEADERSHIP' };
    (mut as typeof createMut).mutate(payload, {
      onSuccess: () => {
        setModal({ open: false });
        setItems([]);
      },
    });
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-100'}>
      {embedded ? (
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => { setEditingId(null); setModal({ open: true }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Добавить
          </button>
        </div>
      ) : (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
              >
                <ChevronLeft size={16} /> Назад
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setEditingId(null); setModal({ open: true }); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} /> Добавить
              </button>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
                Выйти
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={embedded ? '' : 'max-w-4xl mx-auto px-6 py-8'}>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-lg animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Команда не добавлена</p>
            <p className="text-sm mt-1">Нажмите «Добавить» чтобы создать первого сотрудника</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Перетащите строки чтобы изменить порядок отображения на сайте
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayItems.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                {displayItems.map((member) => (
                  <SortableMemberRow
                    key={member.id}
                    member={member}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </>
        )}
      </main>

      {modal.open && (
        <MemberModal
          initial={modal.editing}
          group={group}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          loading={createMut.isPending || updateMut.isPending}
        />
      )}
    </div>
  );
}
