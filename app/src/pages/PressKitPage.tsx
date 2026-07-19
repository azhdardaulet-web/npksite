import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { DarkActionButton } from '@/components/DarkActionButton';
import { fetchDocuments, type PublicDocument } from '@/lib/api';

const FALLBACK: PublicDocument[] = [
  { id: '1', title: 'Логотип НПК (PNG, SVG)', description: null, type: 'press_kit', fileUrl: '#', fileName: 'logo.zip', fileSize: 2_400_000, year: null },
  { id: '2', title: 'Предвыборная программа 2026 (PDF)', description: null, type: 'press_kit', fileUrl: '#', fileName: 'program.pdf', fileSize: 4_800_000, year: 2026 },
  { id: '3', title: 'Пресс-релиз: запуск кампании (PDF)', description: null, type: 'press_kit', fileUrl: '#', fileName: 'release.pdf', fileSize: 1_200_000, year: 2026 },
  { id: '4', title: 'Биографии кандидатов (PDF)', description: null, type: 'press_kit', fileUrl: '#', fileName: 'bios.pdf', fileSize: 3_100_000, year: null },
  { id: '5', title: 'Фото кандидатов (ZIP)', description: null, type: 'press_kit', fileUrl: '#', fileName: 'photos.zip', fileSize: 18_500_000, year: null },
  { id: '6', title: 'Брендбук партии (PDF)', description: null, type: 'press_kit', fileUrl: '#', fileName: 'brandbook.pdf', fileSize: 8_200_000, year: null },
];

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PressKitPage() {
  const [materials, setMaterials] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDocuments('press_kit')
      .then((data) => { if (!cancelled) setMaterials(data.length > 0 ? data : FALLBACK); })
      .catch(() => { if (!cancelled) setMaterials(FALLBACK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Пресс-" bold="кит" subtitle="Материалы для журналистов и СМИ" />
        <div className="space-y-3">
          {loading ? (
            <p className="text-body text-text-muted text-center py-8">Загрузка...</p>
          ) : materials.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.05}>
              <div className="bg-surface rounded-card p-5 border border-line flex items-center justify-between">
                <div>
                  <h4 className="text-body-lg font-medium text-text-base">{item.title}</h4>
                  <p className="text-label text-text-muted">{formatSize(item.fileSize)}</p>
                </div>
                <DarkActionButton className="flex items-center gap-2" onClick={() => window.open(item.fileUrl, '_blank', 'noopener')}>
                  <Download size={16} />
                  Скачать
                </DarkActionButton>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
