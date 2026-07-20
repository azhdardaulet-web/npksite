import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TextReveal } from '@/components/TextReveal';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { LEADERSHIP_FALLBACK } from '../../../shared/leadershipData';

interface CandidatesIntroBlock { headingRu?: string; textRu?: string; }

export function CandidatesSection() {
  const [leaders, setLeaders] = useState<PublicTeamMember[]>(LEADERSHIP_FALLBACK);
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<CandidatesIntroBlock>('candidates_intro');
  const heading = cms?.headingRu?.trim() || 'Лица партии';
  const subtitle = cms?.textRu?.trim() || 'Люди, которые уже сделали выбор — быть с народом. Депутаты, общественные деятели и лидеры регионов, которые каждый день работают для страны.';

  const scrollRef = useRef<HTMLDivElement>(null);

  // До публикации списка кандидатов секция показывает актуальное руководство.
  useEffect(() => {
    let cancelled = false;
    fetchTeam('LEADERSHIP')
      .then((data) => {
        if (!cancelled && data.length > 0) setLeaders(data);
      })
      .catch(() => {
        // Локальный список уже установлен как безопасный запасной источник.
      });
    return () => { cancelled = true; };
  }, []);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-bg py-[var(--section-gap)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-label text-accent-brand font-medium mb-3 uppercase tracking-wider">Партия</p>
            <TextReveal
              tag="h2"
              className="font-formular text-heading-md md:text-heading-lg text-text-base"
            >
              {heading}
            </TextReveal>
            <p className="text-body-lg font-light text-text-muted mt-3 max-w-[560px]">
              {subtitle}
            </p>
          </div>
          <Link
            to="/rukovodstvo"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-body font-medium text-accent-brand hover:gap-3 transition-all group"
          >
            Все участники
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal scroll carousel with drag */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {leaders.map((leader) => (
              <Link
                key={leader.id}
                to={leader.slug ? `/rukovodstvo/${leader.slug}` : '/rukovodstvo'}
                className="shrink-0 w-[280px] md:w-[300px] bg-surface rounded-card overflow-hidden border border-line group hover:border-red/30 transition-all duration-300 hover:-translate-y-1"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Photo */}
                <div className="aspect-[4/5] overflow-hidden">
                  {leader.photoUrl ? (
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-2 flex items-center justify-center text-6xl font-bold text-accent-brand">
                      {leader.name[0]}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="text-body-lg font-bold text-text-base mb-2">{leader.name}</h3>
                  <p className="text-label text-accent-brand font-semibold mb-3 line-clamp-2">{leader.position}</p>
                  {leader.bio && <p className="text-body text-text-muted line-clamp-3">{leader.bio}</p>}
                </div>
              </Link>
            ))}
          </div>

          {/* Scroll buttons */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/3 -translate-x-1/2 w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-text-base hover:bg-accent-brand hover:border-accent-brand hover:text-accent-brand-text transition-all hidden lg:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/3 translate-x-1/2 w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-text-base hover:bg-accent-brand hover:border-accent-brand hover:text-accent-brand-text transition-all hidden lg:flex"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
