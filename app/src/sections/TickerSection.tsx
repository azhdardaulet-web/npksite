import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import { useLanguage } from '@/i18n/LanguageContext';

interface TickerBlock {
  phrasesRu?: string[];
}

const PHRASES_RU = [
  'Достойный труд',
  'Равные возможности',
  'Доступная медицина',
  'Качественное образование',
  'Единство и культура',
  'Справедливое государство',
  'Чистая среда',
  'Сильные регионы',
  'Экономика для человека',
  'Мир и сотрудничество',
];

const PHRASES_KZ = [
  'Әділ еңбек',
  'Тең мүмкіндіктер',
  'Қолжетімді медицина',
  'Сапалы білім',
  'Бірлік пен мәдениет',
  'Әділ мемлекет',
  'Таза орта',
  'Қуатты өңірлер',
  'Адамға қызмет ететін экономика',
  'Бейбітшілік пен ынтымақтастық',
];

export function TickerSection() {
  const { language } = useLanguage();
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<TickerBlock>('ticker');

  const cmsPhrases = cms?.phrasesRu?.filter(Boolean) ?? [];
  const hasLegacyProgram = cmsPhrases.some((phrase) => phrase === 'Человек труда' || phrase === 'Еңбек адамы');
  const phrases = cmsPhrases.length && !hasLegacyProgram
    ? cmsPhrases
    : (language === 'kz' ? PHRASES_KZ : PHRASES_RU);

  const allPhrases = [...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <section className="overflow-hidden border-y border-line bg-bg py-4 md:py-5">
      <div className="flex whitespace-nowrap">
        <div className="animate-ticker flex items-center gap-8 md:gap-12 shrink-0">
          {allPhrases.map((text, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-12 shrink-0">
              <span className="text-[18px] md:text-[22px] font-bold text-text-base uppercase tracking-wider whitespace-nowrap">
                {text}
              </span>
              <span className="w-2 h-2 rounded-full bg-accent-brand shrink-0" />
            </div>
          ))}
        </div>
        <div className="animate-ticker flex items-center gap-8 md:gap-12 shrink-0" aria-hidden="true">
          {allPhrases.map((text, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-12 shrink-0">
              <span className="text-[18px] md:text-[22px] font-bold text-text-base uppercase tracking-wider whitespace-nowrap">
                {text}
              </span>
              <span className="w-2 h-2 rounded-full bg-accent-brand shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
