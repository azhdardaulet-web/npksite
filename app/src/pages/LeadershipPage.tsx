import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ArrowUpRight } from 'lucide-react';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { LEADERSHIP_FALLBACK } from '../../../shared/leadershipData';

// Данные сверены с halykpartiyasy.kz/ru/rukovodstvo-partii (20.07.2026).
// bio — короткая подпись в карточке, fullBio — полная биография на персональной странице.
// Экспортируется — переиспользуется в LeadershipDetailPage как запасной источник.
export const FALLBACK: PublicTeamMember[] = LEADERSHIP_FALLBACK;

function LeaderSkeleton() {
  return (
    <div className="bg-surface border border-line grid grid-cols-[42%_1fr] min-h-[280px] animate-pulse">
      <div className="bg-surface-2" />
      <div className="p-6 self-center">
        <div className="h-5 w-4/5 bg-surface-2 mb-3" />
        <div className="h-4 w-2/3 bg-surface-2 mb-6" />
        <div className="h-3 w-full bg-surface-2 mb-2" />
        <div className="h-3 w-4/5 bg-surface-2" />
      </div>
    </div>
  );
}

function ChairmanSkeleton() {
  return (
    <div className="bg-surface border border-line mb-6 grid md:grid-cols-[300px_1fr] min-h-[360px] animate-pulse">
      <div className="bg-surface-2" />
      <div className="p-8 md:p-12 self-center">
        <div className="h-8 w-1/2 bg-surface-2 mb-3" />
        <div className="h-5 w-1/3 bg-surface-2 mb-8" />
        <div className="h-4 w-full bg-surface-2 mb-3" />
        <div className="h-4 w-4/5 bg-surface-2" />
      </div>
    </div>
  );
}

function LeaderPhoto({ leader, featured = false }: { leader: PublicTeamMember; featured?: boolean }) {
  return (
    <div className={`bg-surface-2 overflow-hidden flex items-end justify-center ${featured ? 'min-h-[340px] md:min-h-[390px]' : 'min-h-[280px]'}`}>
      {leader.photoUrl ? (
        <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover object-top" />
      ) : (
        <span className="self-center text-6xl font-bold text-accent-brand">{leader.name[0]}</span>
      )}
    </div>
  );
}

// slug может отсутствовать (старая запись из CMS без персональной страницы) —
// тогда карточка просто не кликабельна, а не ведёт на 404.
function leaderHref(leader: PublicTeamMember) {
  return leader.slug ? `/rukovodstvo/${leader.slug}` : undefined;
}

export function LeadershipPage() {
  const [leaders, setLeaders] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTeam('LEADERSHIP')
      .then((data) => { if (!cancelled) setLeaders(data.length > 0 ? data : FALLBACK); })
      .catch(() => { if (!cancelled) setLeaders(FALLBACK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Первый по sortOrder — председатель партии, выносим его отдельной карточкой сверху.
  const [chairman, ...deputies] = leaders;

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Руководство" bold="партии" />

        {loading ? (
          <>
            <ChairmanSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <LeaderSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {chairman && (
              <ScrollReveal>
                <Link
                  to={leaderHref(chairman) ?? '#'}
                  className="group w-full bg-surface border border-line mb-7 grid md:grid-cols-[300px_minmax(0,1fr)] hover:border-text-muted transition-colors overflow-hidden"
                >
                  <LeaderPhoto leader={chairman} featured />
                  <div className="p-7 md:p-12 flex flex-col justify-center min-w-0 relative">
                    <div className="w-10 h-1 bg-accent-brand mb-6" />
                    <h2 className="font-formular text-heading-md md:text-heading-lg font-bold text-text-base leading-tight">{chairman.name}</h2>
                    <p className="text-body-lg text-accent-brand font-semibold mt-3 mb-6">{chairman.position}</p>
                    <p className="text-body md:text-body-lg text-text-muted leading-relaxed max-w-3xl">{chairman.bio}</p>
                    <span className="inline-flex items-center gap-2 text-label font-medium text-text-base mt-7">
                      Подробнее <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deputies.map((leader, index) => (
                <ScrollReveal key={leader.id} delay={index * 0.08} className="h-full">
                  <Link
                    to={leaderHref(leader) ?? '#'}
                    className="group h-full bg-surface border border-line grid grid-cols-[42%_minmax(0,1fr)] hover:border-text-muted transition-colors overflow-hidden"
                  >
                    <LeaderPhoto leader={leader} />
                    <div className="p-5 md:p-7 flex flex-col justify-center min-w-0">
                      <h2 className="text-heading-sm md:text-heading font-bold text-text-base leading-tight">{leader.name}</h2>
                      <p className="text-label text-accent-brand font-semibold mt-3">{leader.position}</p>
                      <p className="text-body text-text-muted leading-relaxed mt-5 line-clamp-4">{leader.bio}</p>
                      <span className="inline-flex items-center gap-2 text-label font-medium text-text-base mt-6">
                        Подробнее <ArrowUpRight size={15} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
