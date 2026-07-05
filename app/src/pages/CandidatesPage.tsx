import { candidates } from '@/lib/data';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { DarkActionButton } from '@/components/DarkActionButton';

export function CandidatesPage() {
  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Наши" bold="кандидаты" subtitle="13 кандидатов в Мажилис Парламента РК" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {candidates.map((candidate, index) => (
            <ScrollReveal key={candidate.id} delay={index * 0.08}>
              <div className="bg-cinder rounded-card p-6 border border-white/[0.08] h-full flex flex-col transition-all duration-200 hover:border-red/30 hover:-translate-y-1">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden mb-4 shrink-0">
                  <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-body-lg font-bold text-white mb-1">{candidate.name}</h3>
                <p className="text-label text-steel mb-2">{candidate.region} &middot; {candidate.district}</p>
                <p className="text-body text-fog mb-4 flex-grow">{candidate.promise}</p>
                <DarkActionButton fullWidth>Поддержать</DarkActionButton>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
