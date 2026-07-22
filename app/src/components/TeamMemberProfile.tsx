import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ScrollReveal } from '@/components/ScrollReveal';
import type { PublicTeamMember } from '@/lib/api';

interface ProfileCrumb {
  label: string;
  href: string;
}

// Полная биография хранится блоками через пустую строку: отдельный заголовок,
// абзац или группа строк с маркером «•». Такой формат поддерживает длинные
// биографии из CMS без HTML-разметки.
export function BioSections({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        const isHeading = lines.length === 1 && /^[А-ЯЁӘҒҚҢӨҰҮҺІ0-9\s«»()–—-]+$/.test(lines[0]);
        const isList = lines.every((line) => line.startsWith('• '));

        if (isHeading) {
          return (
            <h2 key={index} className="text-label font-bold tracking-[0.12em] text-text-base uppercase pt-5 first:pt-0 border-t border-line first:border-t-0">
              {lines[0]}
            </h2>
          );
        }

        if (isList) {
          return (
            <ul key={index} className="space-y-3">
              {lines.map((item, itemIndex) => (
                <li key={itemIndex} className="text-body md:text-body-lg text-text-muted leading-relaxed pl-5 relative">
                  <span className="absolute left-0 top-[0.72em] w-1.5 h-1.5 bg-accent-brand" />
                  {item.replace(/^•\s*/, '')}
                </li>
              ))}
            </ul>
          );
        }

        return lines.map((line, lineIndex) => (
          <p key={`${index}-${lineIndex}`} className="text-body md:text-body-lg text-text-muted leading-relaxed">
            {line}
          </p>
        ));
      })}
    </div>
  );
}

export function TeamMemberProfile({
  member,
  crumbs,
  backHref,
  backLabel,
}: {
  member: PublicTeamMember;
  crumbs: ProfileCrumb[];
  backHref: string;
  backLabel: string;
}) {
  const biography = member.fullBio ?? member.bio ?? '';

  return (
    <div className="pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
            {crumbs.map((crumb) => (
              <Fragment key={crumb.href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link to={crumb.href}>{crumb.label}</Link></BreadcrumbLink></BreadcrumbItem>
              </Fragment>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{member.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link
          to={backHref}
          className="inline-flex items-center gap-2 text-label font-medium text-text-muted hover:text-text-base transition-colors mt-5 mb-8"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </Link>

        <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
          <ScrollReveal>
            <div className="bg-surface-2 border border-line lg:sticky lg:top-[120px]">
              <div className="aspect-[4/5] flex items-end justify-center overflow-hidden">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="self-center text-7xl font-bold text-accent-brand">{member.name[0]}</span>
                )}
              </div>
            </div>
          </ScrollReveal>

          <div className="min-w-0">
            <ScrollReveal>
              <header className="pb-7 border-b border-line">
                <div className="w-12 h-1 bg-accent-brand mb-6" />
                <h1 className="font-formular text-[clamp(32px,5vw,58px)] leading-[0.98] tracking-[-0.035em] font-bold text-text-base">
                  {member.name}
                </h1>
                <p className="text-body-lg md:text-heading-sm text-accent-brand font-semibold mt-4">
                  {member.position}
                </p>
                {member.bio && member.fullBio && (
                  <p className="text-body-lg text-text-muted leading-relaxed mt-6 max-w-3xl">{member.bio}</p>
                )}
              </header>
            </ScrollReveal>

            {biography && (
              <ScrollReveal delay={0.08}>
                <div className="bg-surface border border-line p-6 md:p-9 mt-8">
                  <BioSections text={biography} />
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
