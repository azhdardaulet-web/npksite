import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import { useLanguage } from '@/i18n/LanguageContext';

interface TickerBlock {
  phrasesRu?: string[];
}

const PHRASES_RU = [
  'Человек труда',
  'Государство, которое держит слово',
  'Один закон для всех',
  'Экономика для людей',
  'Жильё для работающей семьи',
  'Образование и социальные лифты',
  'Сильные регионы — сильный Казахстан',
  'Экономика будущего',
  'Здоровье и семья',
];

const PHRASES_KZ = [
  'Еңбек адамы',
  'Уәдесіне берік мемлекет',
  'Заң бәріне ортақ',
  'Адамға қызмет ететін экономика',
  'Еңбек ететін отбасыға баспана',
  'Білім және әлеуметтік өрлеу мүмкіндіктері',
  'Қуатты өңірлер — қуатты Қазақстан',
  'Болашақ экономикасы',
  'Денсаулық пен отбасы',
];

export function TickerSection() {
  const { language } = useLanguage();
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<TickerBlock>('ticker');

  const phrases = cms?.phrasesRu?.filter(Boolean).length
    ? cms.phrasesRu.filter(Boolean)
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
