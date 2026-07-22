import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { TeamMemberProfile } from '@/components/TeamMemberProfile';
import { FALLBACK } from './LeadershipPage';
import { mergeLeadership } from '@/lib/leadership';

export function LeadershipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [leaders, setLeaders] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTeam('LEADERSHIP')
      .then((data) => { if (!cancelled) setLeaders(mergeLeadership(data)); })
      .catch(() => { if (!cancelled) setLeaders(FALLBACK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const leader = leaders.find((l) => l.slug === slug);

  if (loading) {
    return (
      <div className="pb-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 grid lg:grid-cols-[340px_1fr] gap-12 animate-pulse">
          <div className="aspect-[4/5] bg-surface-2" />
          <div className="pt-8">
            <div className="h-10 w-2/3 bg-surface-2 mb-4" />
            <div className="h-5 w-1/3 bg-surface-2 mb-10" />
            <div className="h-64 bg-surface-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="pb-16 text-center">
        <h1 className="text-heading font-bold text-text-base mb-2">Не найдено</h1>
        <p className="text-body text-text-muted mb-6">Такой страницы руководства не существует.</p>
        <Link to="/rukovodstvo" className="text-accent-brand font-medium">← Всё руководство</Link>
      </div>
    );
  }

  return (
    <TeamMemberProfile
      member={leader}
      crumbs={[{ label: 'Руководство партии', href: '/rukovodstvo' }]}
      backHref="/rukovodstvo"
      backLabel="Назад к руководству"
    />
  );
}
