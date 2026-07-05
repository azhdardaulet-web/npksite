import { useState } from 'react';
import { X } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';
import { MediaFile } from '@/hooks/useMedia';

interface MediaPickerProps {
  /** Called when user confirms a file selection */
  onSelect: (url: string, file: MediaFile) => void;
  /** Called when modal closes without selection */
  onClose: () => void;
  /** Restrict accepted MIME types, e.g. "image/*" */
  accept?: string;
}

export function MediaPicker({ onSelect, onClose, accept }: MediaPickerProps) {
  const handleSelect = (url: string, file: MediaFile) => {
    onSelect(url, file);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Медиабиблиотека</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Library */}
        <div className="flex-1 overflow-hidden p-4">
          <MediaLibrary onSelect={handleSelect} accept={accept} />
        </div>
      </div>
    </div>
  );
}

// ─── Hook for controlled open/close ──────────────────────────────────────────

interface UseMediaPickerReturn {
  open: (onSelect: (url: string, file: MediaFile) => void, accept?: string) => void;
  element: React.ReactNode;
}

export function useMediaPicker(): UseMediaPickerReturn {
  const [state, setState] = useState<{
    onSelect: (url: string, file: MediaFile) => void;
    accept?: string;
  } | null>(null);

  const open = (onSelect: (url: string, file: MediaFile) => void, accept?: string) => {
    setState({ onSelect, accept });
  };

  const element = state ? (
    <MediaPicker
      onSelect={state.onSelect}
      onClose={() => setState(null)}
      accept={state.accept}
    />
  ) : null;

  return { open, element };
}
