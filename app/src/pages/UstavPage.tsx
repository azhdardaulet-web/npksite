import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchDocuments, type PublicDocument } from '@/lib/api';

function formatSize(bytes: number) {
  if (bytes <= 0) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function UstavPage() {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDocuments('ustav')
      .then((items) => {
        if (!cancelled) setDocuments(items);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader
          light="Устав"
          bold="партии"
          subtitle="Основной документ Народной партии Казахстана"
        />

        <div className="max-w-3xl mb-10">
          <p className="text-body-lg text-text-muted leading-relaxed">
            Устав определяет цели и задачи партии, принципы её деятельности,
            структуру руководящих органов, а также права и обязанности членов НПК.
            Здесь опубликованы действующие редакции документа.
          </p>
        </div>

        {loading ? (
          <p className="text-body text-text-muted py-8">Загрузка документов...</p>
        ) : loadFailed ? (
          <div className="bg-surface border border-line rounded-card p-6 text-text-muted">
            Не удалось загрузить документы. Пожалуйста, попробуйте позже.
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-surface border border-line rounded-card p-6 flex items-center gap-4">
            <FileText className="text-text-muted shrink-0" size={28} />
            <p className="text-body text-text-muted">Документы пока не опубликованы.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document, index) => (
              <ScrollReveal key={document.id} delay={index * 0.05}>
                <article className="bg-surface rounded-card p-5 border border-line flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-11 h-11 bg-surface-2 border border-line flex items-center justify-center shrink-0">
                      <FileText size={21} className="text-text-muted" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-body-lg font-medium text-text-base">{document.title}</h2>
                      {document.description && (
                        <p className="text-body text-text-muted mt-1">{document.description}</p>
                      )}
                      <p className="text-label text-text-muted mt-1">
                        {[document.year, formatSize(document.fileSize)].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface-2 text-text-base text-sm font-medium rounded-button px-4 py-2.5 border border-line hover:border-text-muted hover:bg-line transition-all duration-200 flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Смотреть
                    </a>
                    <a
                      href={document.fileUrl}
                      download={document.fileName}
                      className="bg-surface-2 text-text-base text-sm font-medium rounded-button px-4 py-2.5 border border-line hover:border-text-muted hover:bg-line transition-all duration-200 flex items-center gap-2"
                    >
                      <Download size={16} />
                      Скачать
                    </a>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
