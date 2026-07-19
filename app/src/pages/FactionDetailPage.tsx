import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { BioSections } from '@/pages/LeadershipDetailPage';
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

  const bioText = member.fullBio ?? member.bio ?? '';

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[720px] mx-auto px-4 md:px-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/frakciya">Фракция</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/frakciya/sostav">Состав фракции</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{member.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link to="/frakciya/sostav" className="inline-block text-body text-text-muted hover:text-text-base transition-colors mt-4 mb-6">
          ← Состав фракции
        </Link>

        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-8">
            <div className="w-32 h-32 bg-surface-2 overflow-hidden flex items-center justify-center shrink-0">
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-accent-brand">{member.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-heading font-bold text-text-base mb-1">{member.name}</h1>
              <p className="text-label text-accent-brand font-medium">{member.position}</p>
            </div>
          </div>
        </ScrollReveal>

        {bioText && (
          <ScrollReveal delay={0.1}>
            <div className="bg-surface rounded-card p-6 md:p-8 border border-line">
              <BioSections text={bioText} />
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
