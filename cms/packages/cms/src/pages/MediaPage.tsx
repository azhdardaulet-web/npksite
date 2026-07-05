import { MediaLibrary } from '@/components/MediaLibrary';

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Медиабиблиотека</h1>
        <p className="text-sm text-gray-500 mt-0.5">Управление файлами и изображениями</p>
      </div>

      {/* Library fills remaining height */}
      <div className="flex-1 p-6" style={{ minHeight: 0 }}>
        <div className="h-full" style={{ minHeight: '600px' }}>
          <MediaLibrary />
        </div>
      </div>
    </div>
  );
}
