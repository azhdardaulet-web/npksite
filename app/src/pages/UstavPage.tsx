import { Download, FileText } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useLanguage } from '@/i18n/LanguageContext';

export function UstavPage() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const documentUrl = isKz ? '/documents/charter-kz.pdf' : '/documents/charter-ru.pdf';
  const documentName = isKz ? 'ҚХП жарғысы' : 'Устав НПК';
  const pageTitle = isKz ? 'Партия жарғысы' : 'Устав партии';
  const pageSubtitle = isKz ? 'Қазақстан Халық партиясының негізгі құжаты' : 'Основной документ Народной партии Казахстана';
  const intro = isKz
    ? 'Жарғы партияның мақсаттары мен міндеттерін, қызмет қағидаттарын, басқарушы органдардың құрылымын, сондай-ақ ҚХП мүшелерінің құқықтары мен міндеттерін айқындайды.'
    : 'Устав определяет цели и задачи партии, принципы её деятельности, структуру руководящих органов, а также права и обязанности членов НПК.';

  return (
    <div className="pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader
          light={pageTitle.split(' ')[0]}
          bold={pageTitle.split(' ').slice(1).join(' ')}
          subtitle={pageSubtitle}
        />

        <div className="max-w-3xl mb-10">
          <p className="text-body-lg text-text-muted leading-relaxed">
            {intro}
          </p>
        </div>

        <ScrollReveal>
          <div className="border-y border-line py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-7">
            <div className="flex items-start gap-4">
              <FileText size={28} className="text-accent-brand shrink-0 mt-1" />
              <div>
                <p className="text-label font-bold tracking-[0.14em] uppercase text-accent-brand">{isKz ? 'Құжат' : 'Документ'}</p>
                <h2 className="text-heading-sm md:text-heading font-bold text-text-base mt-2">{documentName}</h2>
                <p className="text-body text-text-muted mt-2">{isKz ? '2026 жылғы 27 маусымдағы ресми редакция.' : 'Официальная редакция от 27 июня 2026 года.'}</p>
              </div>
            </div>
            <a
              href={documentUrl}
              download
              className="inline-flex items-center justify-center gap-3 bg-accent-brand text-white px-7 py-4 text-body font-bold hover:brightness-90 transition shrink-0"
            >
              <Download size={18} /> {isKz ? 'Жүктеп алу' : 'Скачать'}
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="mt-10 bg-surface border border-line overflow-hidden">
            <iframe
              key={documentUrl}
              src={`${documentUrl}#view=FitH`}
              title={documentName}
              className="block w-full h-[72vh] min-h-[640px]"
            />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
