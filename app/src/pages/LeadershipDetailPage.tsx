import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { FALLBACK } from './LeadershipPage';

// fullBio хранится как секции через пустую строку: первая строка — заголовок
// («ОБРАЗОВАНИЕ», «КАРЬЕРА» и т.д.), дальше — пункты с «• ». Если пунктов нет —
// секция рендерится обычным абзацем (так формируется bio-фолбэк без fullBio).
export function BioSections({ text }: { text: string }) {
  const sections = text.split('\n\n').filter(Boolean);
  return (
    <div className="space-y-6">
      {sections.map((section, i) => {
        const lines = section.split('\n').filter(Boolean);
        const [first, ...rest] = lines;
        const isHeading = rest.length > 0 && rest.every((l) => l.startsWith('• '));
        return (
          <div key={i}>
            {isHeading && (
              <h4 className="text-[13px] font-semibold tracking-wide text-text-muted uppercase mb-2.5">{first}</h4>
            )}
            {isHeading ? (
              <ul className="space-y-1.5">
                {rest.map((item, j) => (
                  <li key={j} className="text-body text-text-muted leading-relaxed pl-4 relative">
                    <span className="absolute left-0 text-accent-brand">•</span>
                    {item.replace(/^•\s*/, '')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-text-muted leading-relaxed">{lines.join(' ')}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LeadershipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
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

  const leader = leaders.find((l) => l.slug === slug);

  if (loading) {
    return (
      <div className="pt-[104px] pb-16">
        <div className="max-w-[720px] mx-auto px-4 md:px-10 animate-pulse">
          <div className="w-32 h-32 rounded-full bg-surface-2 mb-6 mx-auto sm:mx-0" />
          <div className="h-6 w-1/3 bg-surface-2 rounded mb-3" />
          <div className="h-4 w-1/4 bg-surface-2 rounded mb-6" />
          <div className="h-3 w-full bg-surface-2 rounded mb-2" />
          <div className="h-3 w-full bg-surface-2 rounded mb-2" />
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="pt-[104px] pb-16 text-center">
        <h1 className="text-heading font-bold text-text-base mb-2">Не найдено</h1>
        <p className="text-body text-text-muted mb-6">Такой страницы руководства не существует.</p>
        <Link to="/rukovodstvo" className="text-accent-brand font-medium">← Всё руководство</Link>
      </div>
    );
  }

  const bioText = leader.fullBio ?? leader.bio ?? '';

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[720px] mx-auto px-4 md:px-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/rukovodstvo">Руководство партии</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{leader.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link to="/rukovodstvo" className="inline-block text-body text-text-muted hover:text-text-base transition-colors mt-4 mb-6">
          ← Всё руководство
        </Link>

        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-8">
            <div className="w-32 h-32 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center shrink-0">
              {leader.photoUrl ? (
                <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-accent-brand">{leader.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-heading font-bold text-text-base mb-1">{leader.name}</h1>
              <p className="text-label text-accent-brand font-medium">{leader.position}</p>
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
