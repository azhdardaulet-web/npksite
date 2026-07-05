import { Download } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { DarkActionButton } from '@/components/DarkActionButton';

const materials = [
  { title: 'Логотип НПК (PNG, SVG)', size: '2.4 MB' },
  { title: 'Предвыборная программа 2026 (PDF)', size: '4.8 MB' },
  { title: 'Пресс-релиз: запуск кампании (PDF)', size: '1.2 MB' },
  { title: 'Биографии кандидатов (PDF)', size: '3.1 MB' },
  { title: 'Фото кандидатов (ZIP)', size: '18.5 MB' },
  { title: 'Брендбук партии (PDF)', size: '8.2 MB' },
];

export function PressKitPage() {
  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Пресс-" bold="кит" subtitle="Материалы для журналистов и СМИ" />
        <div className="space-y-3">
          {materials.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.05}>
              <div className="bg-cinder rounded-card p-5 border border-white/[0.08] flex items-center justify-between">
                <div>
                  <h4 className="text-body-lg font-medium text-white">{item.title}</h4>
                  <p className="text-label text-steel">{item.size}</p>
                </div>
                <DarkActionButton className="flex items-center gap-2">
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
