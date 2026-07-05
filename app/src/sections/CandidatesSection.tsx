import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidates, regionFilterTags } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TextReveal } from '@/components/TextReveal';

export function CandidatesSection() {
  const [activeRegion, setActiveRegion] = useState('Все');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = activeRegion === 'Все'
    ? candidates
    : candidates.filter(c => c.region.toLowerCase().includes(activeRegion.toLowerCase()));

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-coal py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-label text-red font-medium mb-3 uppercase tracking-wider">Партия</p>
            <TextReveal
              tag="h2"
              className="font-formular text-heading-md md:text-heading-lg text-white"
            >
              Лица партии
            </TextReveal>
            <p className="text-body-lg font-light text-fog mt-3 max-w-[560px]">
              Люди, которые уже сделали выбор — быть с народом. Депутаты, общественные деятели и лидеры регионов, которые каждый день работают для страны.
            </p>
          </div>
          <Link
            to="/kandidaty"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-body font-medium text-red hover:gap-3 transition-all group"
          >
            Все участники
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
          {regionFilterTags.slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveRegion(tag)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-badge text-label font-medium transition-all duration-200',
                activeRegion === tag
                  ? 'bg-red text-white border border-red'
                  : 'bg-ash text-fog border border-white/10 hover:border-white/30'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Horizontal scroll carousel with drag */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {filtered.map((candidate) => (
              <div
                key={candidate.id}
                className="shrink-0 w-[280px] md:w-[300px] bg-cinder rounded-card overflow-hidden border border-white/[0.08] group hover:border-red/30 transition-all duration-300 hover:-translate-y-1"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Photo */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="text-body-lg font-bold text-white mb-1">{candidate.name}</h3>
                  <p className="text-label text-steel mb-2">{candidate.region} &middot; {candidate.district}</p>
                  <p className="text-body text-fog line-clamp-2 mb-4">{candidate.promise}</p>
                  <button className="w-full py-2.5 bg-ash border border-white/[0.12] rounded-button text-body font-medium text-white hover:border-red/40 hover:bg-[#2a2a2a] transition-all">
                    Поддержать
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll buttons */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/3 -translate-x-1/2 w-10 h-10 rounded-full bg-cinder border border-white/20 flex items-center justify-center text-white hover:bg-red hover:border-red transition-all hidden lg:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/3 translate-x-1/2 w-10 h-10 rounded-full bg-cinder border border-white/20 flex items-center justify-center text-white hover:bg-red hover:border-red transition-all hidden lg:flex"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
