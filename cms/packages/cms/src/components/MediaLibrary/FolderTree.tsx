import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { GalleryFolder, useCreateFolder, useDeleteFolder } from '@/hooks/useMedia';

interface FolderNodeProps {
  folder: GalleryFolder;
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  depth: number;
}

function FolderNode({ folder, selectedId, onSelect, depth }: FolderNodeProps) {
  const [open, setOpen] = useState(false);
  const deleteFolder = useDeleteFolder();
  const hasChildren = folder.children.length > 0;
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <div
        className={[
          'flex items-center gap-1 px-2 py-1 rounded cursor-pointer select-none group text-sm',
          isSelected ? 'bg-red-50 text-red-700 font-medium' : 'hover:bg-gray-100 text-gray-700',
        ].join(' ')}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(isSelected ? undefined : folder.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
            className="flex-shrink-0 text-gray-400"
          >
            <ChevronRight size={14} className={open ? 'rotate-90 transition-transform' : 'transition-transform'} />
          </button>
        ) : (
          <span className="w-[14px]" />
        )}
        {open ? <FolderOpen size={14} className="flex-shrink-0" /> : <Folder size={14} className="flex-shrink-0" />}
        <span className="flex-1 truncate">{folder.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Удалить папку "${folder.name}"?`)) {
              deleteFolder.mutate(folder.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 ml-1"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {open && hasChildren && folder.children.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

interface FolderTreeProps {
  folders: GalleryFolder[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}

export function FolderTree({ folders, selectedId, onSelect }: FolderTreeProps) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const createFolder = useCreateFolder();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createFolder.mutateAsync({ name: newName.trim() });
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Папки</span>
        <button
          onClick={() => setAdding(true)}
          className="text-gray-400 hover:text-gray-600"
          title="Создать папку"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {/* All files */}
        <div
          className={[
            'flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm',
            !selectedId ? 'bg-red-50 text-red-700 font-medium' : 'hover:bg-gray-100 text-gray-700',
          ].join(' ')}
          onClick={() => onSelect(undefined)}
        >
          <Folder size={14} />
          <span>Все файлы</span>
        </div>

        {folders.map((f) => (
          <FolderNode
            key={f.id}
            folder={f}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={0}
          />
        ))}

        {adding && (
          <div className="px-3 py-2 flex gap-2 items-center">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="Название папки"
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-red-400"
            />
            <button
              onClick={handleCreate}
              disabled={createFolder.isPending}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              OK
            </button>
            <button onClick={() => setAdding(false)} className="text-xs text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
