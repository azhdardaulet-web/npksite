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
import { GripVertical, Plus, Trash2, Pencil, ExternalLink, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useReorderClients,
  Client,
  ClientInput,
} from '@/hooks/useClients';

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableClientRow({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: client.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

      <div className="w-16 h-10 flex-shrink-0 bg-gray-50 border border-gray-100 rounded flex items-center justify-center overflow-hidden">
        {client.logoUrl ? (
          <img src={client.logoUrl} alt={client.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-xs text-gray-400">Нет лого</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{client.name}</p>
        {client.websiteUrl && (
          <a
            href={client.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
          >
            {client.websiteUrl} <ExternalLink size={10} />
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(client)}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(client)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Client form modal ────────────────────────────────────────────────────────

function ClientModal({
  initial,
  onSave,
  onClose,
  loading,
}: {
  initial?: Client;
  onSave: (data: ClientInput) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {initial ? 'Редактировать клиента' : 'Добавить клиента'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="АО «Компания»"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL логотипа *</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            {logoUrl && (
              <img src={logoUrl} alt="" className="mt-2 h-10 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сайт</label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Отмена
          </button>
          <button
            disabled={loading || !name || !logoUrl}
            onClick={() => onSave({ name, logoUrl, websiteUrl: websiteUrl || null })}
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

export default function ClientsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { data: clients = [], isLoading } = useClients();
  const [items, setItems] = useState<Client[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing?: Client }>({ open: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMut = useCreateClient();
  const deleteMut = useDeleteClient();
  const reorderMut = useReorderClients();
  const updateMut = useUpdateClient(editingId ?? '');

  const displayItems = items.length > 0 ? items : clients;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const base = items.length > 0 ? items : clients;
    const oldIndex = base.findIndex((c) => c.id === active.id);
    const newIndex = base.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(base, oldIndex, newIndex);
    setItems(reordered);
    reorderMut.mutate(reordered.map((c) => c.id));
  }

  function handleDelete(client: Client) {
    if (window.confirm(`Удалить клиента «${client.name}»?`)) {
      deleteMut.mutate(client.id);
      setItems((prev) => prev.filter((c) => c.id !== client.id));
    }
  }

  function handleEdit(client: Client) {
    setEditingId(client.id);
    setModal({ open: true, editing: client });
  }

  function handleSave(data: ClientInput) {
    if (modal.editing) {
      updateMut.mutate(data, {
        onSuccess: () => {
          setModal({ open: false });
          setItems([]);
        },
      });
    } else {
      createMut.mutate(data, {
        onSuccess: () => {
          setModal({ open: false });
          setItems([]);
        },
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={16} /> Назад
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Клиенты</h1>
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-lg animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Клиенты не добавлены</p>
            <p className="text-sm mt-1">Нажмите «Добавить» чтобы создать первого клиента</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Перетащите строки чтобы изменить порядок отображения на сайте
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayItems.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {displayItems.map((client) => (
                  <SortableClientRow
                    key={client.id}
                    client={client}
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
        <ClientModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          loading={createMut.isPending || updateMut.isPending}
        />
      )}
    </div>
  );
}
