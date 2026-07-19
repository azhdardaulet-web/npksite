import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { TeamMemberProfile } from '@/components/TeamMemberProfile';
import { FACTION_FALLBACK } from '@/pages/FactionCompositionPage';

export function FactionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [members, setMembers] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTeam('FACTION')
      .then((items) => { if (!cancelled) setMembers(items.length > 0 ? items : FACTION_FALLBACK); })
      .catch(() => { if (!cancelled) setMembers(FACTION_FALLBACK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const member = members.find((item) => item.slug === slug);

  if (loading) {
    return <div className="pt-[104px] pb-16 min-h-[60vh]" />;
  }

  if (!member) {
    return (
      <div className="pt-[104px] pb-16 text-center">
        <h1 className="text-heading font-bold text-text-base mb-2">Не найдено</h1>
        <p className="text-body text-text-muted mb-6">Такой страницы депутата не существует.</p>
        <Link to="/frakciya/sostav" className="text-accent-brand font-medium">← Состав фракции</Link>
      </div>
    );
  }

  return (
    <TeamMemberProfile
      member={member}
      crumbs={[
        { label: 'Фракция', href: '/frakciya' },
        { label: 'Состав фракции', href: '/frakciya/sostav' },
      ]}
      backHref="/frakciya/sostav"
      backLabel="Назад к составу фракции"
    />
  );
}
