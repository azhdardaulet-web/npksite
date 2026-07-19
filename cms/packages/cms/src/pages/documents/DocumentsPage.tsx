import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface DocumentItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  year: number | null;
  createdAt: string;
}

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState('');

  const documents = useQuery<DocumentItem[]>({
    queryKey: ['documents', 'ustav'],
    queryFn: async () => {
      const { data } = await api.get<DocumentItem[]>('/cms/api/v1/documents', { params: { type: 'ustav' } });
      return data;
    },
  });

  const upload = useMutation({
    mutationFn: async (form: FormData) => {
      await api.post('/cms/api/v1/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      setTitle('');
      setDescription('');
      if (fileRef.current) fileRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['documents', 'ustav'] });
    },
    onError: () => setError('Не удалось загрузить документ. Проверьте PDF-файл и повторите попытку.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/api/v1/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', 'ustav'] }),
    onError: () => setError('Не удалось удалить документ.'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const file = fileRef.current?.files?.[0];
    if (!title.trim() || !file) {
      setError('Укажите название и выберите PDF-файл.');
      return;
    }
    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('type', 'ustav');
    if (year) form.append('year', year);
    form.append('file', file);
    upload.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Устав партии</h1>
        <p className="text-brand-gray text-sm mt-0.5">PDF-документы, опубликованные на странице /o-partii/ustav</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-brand-silver/50 p-5 space-y-4">
        <h2 className="font-semibold text-brand-dark">Добавить документ</h2>
        <div className="grid md:grid-cols-[1fr_120px] gap-4">
          <label className="text-sm text-brand-dark">
            <span className="block mb-1.5 font-medium">Название *</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-brand-silver px-3 py-2 outline-none focus:border-brand-red" placeholder="Устав НПК" />
          </label>
          <label className="text-sm text-brand-dark">
            <span className="block mb-1.5 font-medium">Год</span>
            <input type="number" min="1990" max="2100" value={year} onChange={(e) => setYear(e.target.value)} className="w-full border border-brand-silver px-3 py-2 outline-none focus:border-brand-red" />
          </label>
        </div>
        <label className="text-sm text-brand-dark block">
          <span className="block mb-1.5 font-medium">Описание</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-brand-silver px-3 py-2 outline-none focus:border-brand-red resize-y" />
        </label>
        <label className="text-sm text-brand-dark block">
          <span className="block mb-1.5 font-medium">PDF-файл *</span>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="block w-full text-sm text-brand-gray file:mr-4 file:border-0 file:bg-brand-cream file:px-4 file:py-2 file:text-brand-dark file:cursor-pointer" />
        </label>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button type="submit" disabled={upload.isPending} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm hover:bg-brand-red/90 disabled:opacity-50">
          {upload.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Опубликовать
        </button>
      </form>

      <div className="bg-white border border-brand-silver/50 overflow-hidden">
        {documents.isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-brand-gray" /></div>
        ) : documents.isError ? (
          <p className="text-center py-12 text-brand-red">Не удалось загрузить документы</p>
        ) : documents.data?.length === 0 ? (
          <div className="text-center py-14">
            <FileText size={36} className="mx-auto mb-3 text-brand-silver" />
            <p className="text-brand-dark font-medium">Документов пока нет</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-silver/40">
            {documents.data?.map((document) => (
              <div key={document.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-brand-red shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{document.title}</p>
                    <p className="text-xs text-brand-gray">{document.fileName} · {formatSize(document.fileSize)}{document.year ? ` · ${document.year}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Открыть ${document.title}`} className="p-2 text-brand-gray hover:text-brand-dark hover:bg-brand-cream"><Download size={16} /></a>
                  <button type="button" aria-label={`Удалить ${document.title}`} disabled={remove.isPending} onClick={() => window.confirm(`Удалить «${document.title}»?`) && remove.mutate(document.id)} className="p-2 text-brand-gray hover:text-brand-red hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
