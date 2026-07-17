import { useEffect, useState } from 'react';
import { candidates as fallbackCandidates } from '@/lib/data';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { DarkActionButton } from '@/components/DarkActionButton';
import { fetchCandidates, type PublicCandidate } from '@/lib/api';

const FALLBACK: PublicCandidate[] = fallbackCandidates.map((c) => ({
  id: String(c.id),
  name: c.name,
  region: c.region,
  district: c.district,
  photoUrl: c.photo,
  promise: c.promise,
}));

function CandidateSkeleton() {
  return (
    <div className="bg-surface rounded-card p-6 border border-line h-full flex flex-col">
      <div className="w-[80px] h-[80px] rounded-full bg-surface-2 mb-4 shrink-0" />
      <div className="h-4 w-2/3 bg-surface-2 rounded mb-2" />
      <div className="h-3 w-1/2 bg-surface-2 rounded mb-3" />
      <div className="h-3 w-full bg-surface-2 rounded mb-1" />
      <div className="h-3 w-4/5 bg-surface-2 rounded" />
    </div>
  );
}

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<PublicCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCandidates()
      .then((data) => { if (!cancelled) setCandidates(data.length > 0 ? data : FALLBACK); })
      .catch(() => { if (!cancelled) setCandidates(FALLBACK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Наши" bold="кандидаты" subtitle={`${candidates.length || fallbackCandidates.length} кандидатов в Мажилис Парламента РК`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CandidateSkeleton key={i} />)
            : candidates.map((candidate, index) => (
                <ScrollReveal key={candidate.id} delay={index * 0.08}>
                  <div className="bg-surface rounded-card p-6 border border-line h-full flex flex-col transition-all duration-200 hover:border-red/30 hover:-translate-y-1">
                    <div className="w-[80px] h-[80px] rounded-full overflow-hidden mb-4 shrink-0 bg-surface-2">
                      {candidate.photoUrl && <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" />}
                    </div>
                    <h3 className="text-body-lg font-bold text-text-base mb-1">{candidate.name}</h3>
                    <p className="text-label text-text-muted mb-2">{candidate.region}{candidate.district ? ` · ${candidate.district}` : ''}</p>
                    <p className="text-body text-text-muted mb-4 flex-grow">{candidate.promise}</p>
                    <DarkActionButton fullWidth>Поддержать</DarkActionButton>
                  </div>
                </ScrollReveal>
              ))}
        </div>
      </div>
    </div>
  );
}
