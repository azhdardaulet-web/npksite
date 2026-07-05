import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  LayoutGrid, List, Search, Upload, Loader2, Trash2, CheckSquare, Square
} from 'lucide-react';
import {
  useMediaFiles, useMediaFolders, useUploadFile, useDeleteFiles,
  MediaFile, MediaFilters,
} from '@/hooks/useMedia';
import { FolderTree } from './FolderTree';
import { DetailsPanel } from './DetailsPanel';
import { formatFileSize, formatDate, fileIcon, isImage } from './utils';

// ─── File card ────────────────────────────────────────────────────────────────

interface FileCardProps {
  file: MediaFile;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onCheck: () => void;
  viewMode: 'grid' | 'list';
  pickerMode?: boolean;
}

function FileCard({ file, selected, checked, onSelect, onCheck, viewMode, pickerMode }: FileCardProps) {
  const Icon = fileIcon(file.type);

  if (viewMode === 'list') {
    return (
      <div
        className={[
          'flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition',
          selected ? 'bg-red-50' : '',
        ].join(' ')}
        onClick={onSelect}
      >
        {!pickerMode && (
          <button onClick={(e) => { e.stopPropagation(); onCheck(); }} className="flex-shrink-0 text-gray-400">
            {checked ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
          </button>
        )}
        <div className="w-9 h-9 rounded flex items-center justify-center bg-gray-100 flex-shrink-0 overflow-hidden">
          {isImage(file.type) && file.thumbnailUrl
            ? <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            : <Icon size={18} className="text-gray-400" />}
        </div>
        <span className="flex-1 text-sm text-gray-800 truncate">{file.originalName}</span>
        <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(file.size)}</span>
        <span className="text-xs text-gray-400 flex-shrink-0 w-28 text-right">{formatDate(file.createdAt)}</span>
      </div>
    );
  }

  return (
    <div
      className={[
        'relative rounded-lg border-2 cursor-pointer overflow-hidden transition',
        selected ? 'border-red-500' : 'border-transparent hover:border-gray-200',
      ].join(' ')}
      onClick={onSelect}
    >
      {!pickerMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onCheck(); }}
          className="absolute top-1.5 left-1.5 z-10 text-white drop-shadow"
        >
          {checked ? <CheckSquare size={16} className="text-red-600 bg-white rounded" /> : <Square size={16} />}
        </button>
      )}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {isImage(file.type) && file.thumbnailUrl
          ? <img src={file.thumbnailUrl} alt={file.originalName} className="w-full h-full object-cover" />
          : <Icon size={36} className="text-gray-300" />}
      </div>
      <div className="px-2 py-1.5 bg-white">
        <p className="text-xs text-gray-800 truncate">{file.originalName}</p>
        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MediaLibraryProps {
  /** If provided, clicking a file calls this with its URL instead of showing details */
  onSelect?: (url: string, file: MediaFile) => void;
  /** Restricts accepted MIME types for picker mode */
  accept?: string;
}

export function MediaLibrary({ onSelect, accept }: MediaLibraryProps) {
  const pickerMode = !!onSelect;

  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<MediaFilters>({});
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const { data: foldersData } = useMediaFolders();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMediaFiles({ ...filters, folderId: selectedFolder });

  const uploadFile = useUploadFile();
  const deleteFiles = useDeleteFiles();

  const allFiles = data?.pages.flatMap((p) => p.items) ?? [];

  // Dropzone
  const onDrop = useCallback(
    async (accepted: File[]) => {
      for (const file of accepted) {
        await uploadFile.mutateAsync({ file, folderId: selectedFolder });
      }
    },
    [uploadFile, selectedFolder]
  );

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    noClick: true,
    accept: accept ? { [accept]: [] } : undefined,
  });

  // Selection
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileClick = (file: MediaFile) => {
    if (pickerMode) {
      onSelect!(file.url, file);
      return;
    }
    setSelectedFile((prev) => (prev?.id === file.id ? null : file));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Удалить ${checkedIds.size} файлов?`)) return;
    await deleteFiles.mutateAsync([...checkedIds]);
    setCheckedIds(new Set());
    setSelectedFile(null);
  };

  return (
    <div className="flex h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Sidebar: folder tree */}
      {!pickerMode && (
        <div className="w-52 border-r border-gray-200 flex-shrink-0">
          <FolderTree
            folders={foldersData ?? []}
            selectedId={selectedFolder}
            onSelect={(id) => {
              setSelectedFolder(id);
              setFilters((f) => ({ ...f, folderId: id }));
              setSelectedFile(null);
            }}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0" {...getRootProps()}>
        <input {...getInputProps()} />

        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск файлов..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              value={filters.q ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value || undefined }))}
            />
          </div>

          <select
            value={filters.type ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: (e.target.value as MediaFilters['type']) || undefined }))
            }
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="">Все типы</option>
            <option value="image">Изображения</option>
            <option value="pdf">PDF</option>
            <option value="video">Видео</option>
            <option value="document">Документы</option>
          </select>

          {checkedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleteFiles.isPending}
              className="flex items-center gap-1 text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={14} />
              Удалить ({checkedIds.size})
            </button>
          )}

          <button
            onClick={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))}
            className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
            title="Сменить вид"
          >
            {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>

          <button
            onClick={openFilePicker}
            disabled={uploadFile.isPending}
            className="flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: '#C0392B' }}
          >
            {uploadFile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Загрузить
          </button>
        </div>

        {/* Drop overlay */}
        {isDragActive && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-50/90 border-2 border-dashed border-red-400 rounded-xl m-2">
            <p className="text-red-600 font-medium text-lg">Отпустите файлы для загрузки</p>
          </div>
        )}

        {/* File grid / list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : allFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
              <Upload size={32} className="opacity-30" />
              <p className="text-sm">Нет файлов. Перетащите сюда или нажмите «Загрузить»</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {allFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  selected={selectedFile?.id === file.id}
                  checked={checkedIds.has(file.id)}
                  onSelect={() => handleFileClick(file)}
                  onCheck={() => toggleCheck(file.id)}
                  viewMode="grid"
                  pickerMode={pickerMode}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              {allFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  selected={selectedFile?.id === file.id}
                  checked={checkedIds.has(file.id)}
                  onSelect={() => handleFileClick(file)}
                  onCheck={() => toggleCheck(file.id)}
                  viewMode="list"
                  pickerMode={pickerMode}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
                Загрузить ещё
              </button>
            </div>
          )}
        </div>

        {/* Picker confirm bar */}
        {pickerMode && selectedFile && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 truncate max-w-xs">{selectedFile.originalName}</span>
            <button
              onClick={() => onSelect!(selectedFile.url, selectedFile)}
              className="text-sm text-white px-4 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: '#C0392B' }}
            >
              Выбрать
            </button>
          </div>
        )}
      </div>

      {/* Details panel (non-picker mode) */}
      {!pickerMode && selectedFile && (
        <DetailsPanel
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDeleted={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}
