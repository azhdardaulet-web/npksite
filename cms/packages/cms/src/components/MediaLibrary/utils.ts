import { FileText, Film, File, ImageIcon, LucideIcon } from 'lucide-react';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function fileIcon(type: string): LucideIcon {
  switch (type) {
    case 'image':    return ImageIcon;
    case 'pdf':      return FileText;
    case 'video':    return Film;
    default:         return File;
  }
}

export function isImage(type: string): boolean {
  return type === 'image';
}
