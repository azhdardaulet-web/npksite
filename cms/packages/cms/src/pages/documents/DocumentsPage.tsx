import { useState, useRef } from 'react';
import { FileText, Upload, Trash2, Download, File } from 'lucide-react';

interface Doc {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  url: string;
}

const MOCK: Doc[] = [];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(MOCK);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(file => {
      const sizeMb = (file.size / 1024 / 1024).toFixed(1);
      setDocs(prev => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: `${sizeMb} МБ`,
          uploadedAt: new Date().toLocaleDateString('ru-RU'),
          url: URL.createObjectURL(file),
        },
      ]);
    });
  }

  function handleDelete(id: string) {
    if (window.confirm('Удалить документ?')) setDocs(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Документы</h1>
          <p className="text-brand-gray text-sm mt-0.5">PDF-файлы для скачивания на сайте</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
        >
          <Upload size={16} /> Загрузить документ
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-brand-silver rounded-xl p-8 text-center hover:border-brand-red/50 hover:bg-brand-cream/30 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={32} className="mx-auto mb-2 text-brand-gray/60" />
        <p className="text-brand-dark font-medium">Перетащите файлы сюда</p>
        <p className="text-brand-gray text-sm mt-1">или нажмите для выбора · PDF, DOC, XLS · до 50 МБ</p>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
        {docs.length === 0 ? (
          <div className="text-center py-16">
            <File size={40} className="mx-auto mb-3 text-brand-silver" />
            <p className="text-brand-dark font-medium">Документов пока нет</p>
            <p className="text-brand-gray text-sm mt-1">Загрузите первый документ через кнопку выше</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-silver/40 bg-brand-cream/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Файл</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Размер</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Дата</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="border-b border-brand-silver/30 hover:bg-brand-cream/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-cream rounded-lg">
                        <FileText size={16} className="text-brand-red" />
                      </div>
                      <span className="text-sm font-medium text-brand-dark">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-brand-gray text-sm">{doc.size}</td>
                  <td className="px-5 py-3 text-brand-gray text-sm">{doc.uploadedAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={doc.url} download={doc.name} className="p-1.5 text-brand-gray hover:text-brand-dark hover:bg-brand-cream rounded">
                        <Download size={15} />
                      </a>
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
