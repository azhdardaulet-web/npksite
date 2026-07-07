import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import { extractTextFromDocx, parseArticles, type ParsedArticle } from '@/lib/docxImport';

// Компактная панель импорта одной статьи из .docx прямо на экране
// «Новая статья». Для массового импорта нескольких статей за раз — полный
// инструмент /news/import (WordImporter.tsx), сюда просто отправляем.
export function WordImportPanel({ onImported }: { onImported: (article: ParsedArticle) => void }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickFile = useCallback((f: File) => {
    if (!f.name.endsWith('.docx')) {
      setError('Поддерживаются только файлы .docx');
      return;
    }
    setError('');
    setFile(f);
    setUrl('');
  }, []);

  async function handleImport() {
    setError('');
    setLoading(true);
    try {
      let targetFile = file;
      if (!targetFile && url.trim()) {
        const res = await fetch(url.trim());
        if (!res.ok) throw new Error('Не удалось скачать файл по ссылке');
        const blob = await res.blob();
        targetFile = new File([blob], 'import.docx');
      }
      if (!targetFile) {
        setError('Выберите файл .docx или укажите ссылку');
        return;
      }

      const lines = await extractTextFromDocx(targetFile);
      const articles = parseArticles(lines);

      if (articles.length === 0) {
        setError('Не удалось распознать статью в документе');
        return;
      }
      if (articles.length > 1) {
        // Несколько статей в одном файле — это работа для группового
        // импортёра, не для формы одной статьи.
        navigate('/news/import');
        return;
      }

      onImported(articles[0]);
      setFile(null);
      setUrl('');
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? 'Ошибка импорта');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-red-50 rounded-lg">
          <FileText size={16} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Импорт из Word</h3>
          <p className="text-[11px] text-gray-500">Загрузка статьи из .docx файла</p>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) pickFile(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-lg py-6 px-3 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <Upload size={18} className="text-gray-400" />
        <p className="text-xs text-gray-600">
          {file ? file.name : <>Перетащите .docx файл сюда<br />или нажмите для выбора</>}
        </p>
        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          Формат .docx · Статьи на сайте
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
          }}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-[11px] text-gray-500 space-y-0.5">
        <p className="font-medium text-gray-600 mb-1">Ожидаемый формат документа:</p>
        <p>• Каждый абзац начинается с новой строки</p>
        <p>• Русский блок помечен # РУССКИЙ</p>
        <p>• Казахский блок помечен # КАЗАКША</p>
        <p>• Несколько статей разделяются тегом # РАЗДЕЛИТЕЛЬ ---------</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Или введите URL</label>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setFile(null); }}
          placeholder="https://..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
          <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={loading || (!file && !url.trim())}
        className="w-full text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Импортировать
      </button>
    </div>
  );
}
