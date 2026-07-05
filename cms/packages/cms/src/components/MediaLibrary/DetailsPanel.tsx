import { useState, useEffect } from 'react';
import { X, Copy, Check, Trash2, Pencil } from 'lucide-react';
import { MediaFile, useRenameFile, useDeleteFile } from '@/hooks/useMedia';
import { formatFileSize, formatDate, fileIcon, isImage } from './utils';

interface DetailsPanelProps {
  file: MediaFile;
  onClose: () => void;
  onDeleted: () => void;
}

export function DetailsPanel({ file, onClose, onDeleted }: DetailsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(file.originalName);

  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();

  useEffect(() => {
    setName(file.originalName);
    setEditing(false);
  }, [file.id, file.originalName]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRename = async () => {
    if (name.trim() === file.originalName) { setEditing(false); return; }
    await renameFile.mutateAsync({ id: file.id, originalName: name.trim() });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить файл "${file.originalName}"?`)) return;
    await deleteFile.mutateAsync(file.id);
    onDeleted();
  };

  const Icon = fileIcon(file.type);

  return (
    <div className="w-72 border-l border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">Информация</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Preview */}
      <div className="p-4 flex items-center justify-center bg-gray-50 border-b border-gray-200 min-h-[160px]">
        {isImage(file.type) ? (
          <img
            src={file.thumbnailUrl ?? file.url}
            alt={file.originalName}
            className="max-h-40 max-w-full object-contain rounded"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Icon size={48} />
            <span className="text-xs uppercase tracking-wide">{file.type}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Filename */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Имя файла</label>
          {editing ? (
            <div className="mt-1 flex gap-1">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') { setEditing(false); setName(file.originalName); }
                }}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-red-400"
              />
              <button
                onClick={handleRename}
                disabled={renameFile.isPending}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-start gap-1 group">
              <p className="text-sm text-gray-800 flex-1 break-all">{file.originalName}</p>
              <button
                onClick={() => setEditing(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Тип</span>
            <span className="text-gray-800 uppercase text-xs font-medium">{file.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Размер</span>
            <span className="text-gray-800">{formatFileSize(file.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Загружен</span>
            <span className="text-gray-800">{formatDate(file.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Автор</span>
            <span className="text-gray-800">{file.uploadedBy.name}</span>
          </div>
        </div>

        {/* URL */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">URL</label>
          <div className="mt-1 flex gap-1 items-center">
            <p className="text-xs text-gray-600 flex-1 truncate font-mono">{file.url}</p>
            <button
              onClick={copyUrl}
              className="flex-shrink-0 p-1 rounded hover:bg-gray-100 text-gray-500"
              title="Скопировать URL"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleDelete}
          disabled={deleteFile.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 text-red-600 py-2 text-sm hover:bg-red-50 transition disabled:opacity-50"
        >
          <Trash2 size={14} />
          {deleteFile.isPending ? 'Удаление...' : 'Удалить файл'}
        </button>
      </div>
    </div>
  );
}
