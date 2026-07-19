import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Mail, MapPin, Phone } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { findBranchProfile, type BranchPerson } from '@/lib/branchProfiles';

function contactPhone(phone: string) {
  return phone.replace(/[^+\d]/g, '');
}

function PersonCard({ person }: { person: BranchPerson }) {
  return (
    <article className="bg-surface border border-line overflow-hidden h-full flex flex-col">
      <div className="relative aspect-[4/5] bg-surface-2 overflow-hidden flex items-center justify-center">
        <span className="absolute text-5xl font-bold text-accent-brand/30">{person.name[0]}</span>
        {person.image && (
          <img src={person.image} alt={person.name} className="relative w-full h-full object-cover object-top" loading="lazy" />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-body-lg font-bold text-text-base leading-tight">{person.name}</h3>
        {person.position && <p className="text-label text-text-muted leading-relaxed mt-3">{person.position}</p>}
        <div className="mt-auto pt-4 space-y-2 text-label">
          {person.phone && (
            <a href={`tel:${contactPhone(person.phone)}`} className="flex items-center gap-2 text-accent-brand hover:underline">
              <Phone size={14} />{person.phone}
            </a>
          )}
          {person.email && (
            <a href={`mailto:${person.email}`} className="flex items-center gap-2 text-text-muted hover:text-text-base break-all">
              <Mail size={14} />{person.email}
            </a>
          )}
        </div>
        {person.bio && (
          <details className="group mt-5 border-t border-line pt-4">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-label font-semibold text-text-base">
              Биографическая справка
              <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-label text-text-muted leading-relaxed whitespace-pre-line mt-4">{person.bio}</p>
          </details>
        )}
      </div>
    </article>
  );
}

export function BranchDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const branch = findBranchProfile(slug);

  if (!branch) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pb-16 text-center">
        <h1 className="text-heading font-bold text-text-base mb-2">Филиал не найден</h1>
        <p className="text-body text-text-muted mb-6">Проверьте адрес страницы или вернитесь к списку филиалов.</p>
        <Link to="/filialy" className="text-accent-brand font-medium">← Все филиалы</Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <Link to="/filialy" className="inline-flex text-label font-semibold text-text-muted hover:text-text-base mb-8">
          ← Назад к филиалам
        </Link>

        <section className="bg-surface border border-line grid lg:grid-cols-[360px_minmax(0,1fr)] overflow-hidden">
          <div className="relative min-h-[420px] bg-surface-2 flex items-center justify-center overflow-hidden">
            <span className="absolute text-8xl font-bold text-accent-brand/30">{branch.title[0]}</span>
            {branch.image && <img src={branch.image} alt={branch.chairman || branch.title} className="relative w-full h-full object-cover object-top" />}
          </div>
          <div className="p-7 md:p-12 flex flex-col justify-center">
            <div className="w-10 h-1 bg-accent-brand mb-6" />
            <h1 className="font-formular text-heading-md md:text-heading-lg font-bold text-text-base leading-tight">{branch.title}</h1>
            <p className="text-body-lg text-accent-brand font-semibold mt-4">{branch.chairman || 'Председатель не указан'}</p>
            <p className="text-label text-text-muted mt-1">Председатель филиала</p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mt-9 pt-7 border-t border-line">
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin size={18} className="text-accent-brand shrink-0 mt-0.5" />
                <div><p className="text-label text-text-muted mb-1">Адрес</p><p className="text-body text-text-base">{branch.address}</p></div>
              </div>
              {branch.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-accent-brand shrink-0 mt-0.5" />
                  <div><p className="text-label text-text-muted mb-1">Телефон</p><a href={`tel:${contactPhone(branch.phone)}`} className="text-body text-text-base hover:text-accent-brand">{branch.phone}</a></div>
                </div>
              )}
              {branch.email && (
                <div className="flex items-start gap-3 min-w-0">
                  <Mail size={18} className="text-accent-brand shrink-0 mt-0.5" />
                  <div className="min-w-0"><p className="text-label text-text-muted mb-1">Email</p><a href={`mailto:${branch.email}`} className="text-body text-text-base hover:text-accent-brand break-all">{branch.email}</a></div>
                </div>
              )}
            </div>
          </div>
        </section>

        {branch.sections.map((section, sectionIndex) => (
          <section key={`${section.title}-${sectionIndex}`} className="mt-14 md:mt-20">
            <ScrollReveal>
              <div className="flex items-end justify-between gap-6 mb-7 border-b border-line pb-5">
                <h2 className="text-heading font-bold text-text-base">{section.title}</h2>
                <span className="text-label text-text-muted shrink-0">{section.people.length}</span>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {section.people.map((person, index) => (
                <ScrollReveal key={`${person.name}-${index}`} delay={index * 0.03} className="h-full">
                  <PersonCard person={person} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        ))}

        {branch.sections.length === 0 && (
          <div className="mt-12 p-6 border border-line bg-surface text-body text-text-muted">
            Дополнительный состав филиала на официальной странице не указан.
          </div>
        )}
      </div>
    </div>
  );
}
