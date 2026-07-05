import { useEffect, useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';

const FALLBACK: PublicTeamMember[] = [
  { id: '1', photoUrl: null, group: 'LEADERSHIP', sortOrder: 0, name: 'Ерлан Кошанов', position: 'Председатель партии', bio: 'Опытный государственный деятель с 25-летним стажем работы в органах власти.' },
  { id: '2', photoUrl: null, group: 'LEADERSHIP', sortOrder: 1, name: 'Гульшара Абдыкаликова', position: 'Заместитель председателя', bio: 'Экс-аким Кызылординской области, депутат Мажилиса нескольких созывов.' },
  { id: '3', photoUrl: null, group: 'LEADERSHIP', sortOrder: 2, name: 'Марат Бекетов', position: 'Руководитель фракции', bio: 'Депутат Мажилиса, председатель комитета по социальным вопросам.' },
  { id: '4', photoUrl: null, group: 'LEADERSHIP', sortOrder: 3, name: 'Айгуль Нурланова', position: 'Пресс-секретарь', bio: 'Журналист, медиа-эксперт, руководитель информационной службы партии.' },
];

function LeaderSkeleton() {
  return (
    <div className="bg-cinder rounded-card p-6 border border-white/[0.08]">
      <div className="w-16 h-16 rounded-full bg-white/[0.06] mb-4" />
      <div className="h-4 w-1/2 bg-white/[0.08] rounded mb-2" />
      <div className="h-3 w-1/3 bg-white/[0.06] rounded mb-3" />
      <div className="h-3 w-full bg-white/[0.05] rounded" />
    </div>
  );
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

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Руководство" bold="партии" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <LeaderSkeleton key={i} />)
            : leaders.map((leader, index) => (
                <ScrollReveal key={leader.id} delay={index * 0.08}>
                  <div className="bg-cinder rounded-card p-6 border border-white/[0.08]">
                    <div className="w-16 h-16 rounded-full bg-ash overflow-hidden flex items-center justify-center mb-4">
                      {leader.photoUrl ? (
                        <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-red">{leader.name[0]}</span>
                      )}
                    </div>
                    <h3 className="text-heading-sm font-bold text-white mb-1">{leader.name}</h3>
                    <p className="text-label text-red font-medium mb-3">{leader.position}</p>
                    <p className="text-body text-fog">{leader.bio}</p>
                  </div>
                </ScrollReveal>
              ))}
        </div>
      </div>
    </div>
  );
}
