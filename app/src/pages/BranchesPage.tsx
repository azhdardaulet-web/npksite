import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { BranchMapSection } from '@/sections/BranchMapSection';
import { branchProfiles, type BranchProfile } from '@/lib/branchProfiles';

function BranchPhoto({ branch }: { branch: BranchProfile }) {
  return (
    <div className="relative min-h-[250px] bg-surface-2 overflow-hidden flex items-center justify-center">
      <span className="absolute text-6xl font-bold text-accent-brand/30">{branch.title[0]}</span>
      {branch.image && (
        <img
          src={branch.image}
          alt={branch.chairman || branch.title}
          className="relative w-full h-full min-h-[250px] object-cover object-top"
          loading="lazy"
        />
      )}
    </div>
  );
}

export function BranchesPage() {
  return (
    <div className="pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Наши" bold="филиалы" subtitle="20 региональных филиалов по всему Казахстану" />
      </div>

      <div className="mb-12">
        <BranchMapSection />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branchProfiles.map((branch, index) => (
            <ScrollReveal key={branch.slug} delay={index * 0.03} className="h-full">
              <Link
                to={`/filialy/${branch.slug}`}
                className="group h-full bg-surface border border-line grid sm:grid-cols-[38%_minmax(0,1fr)] hover:border-text-muted transition-colors overflow-hidden"
              >
                <BranchPhoto branch={branch} />
                <div className="p-5 md:p-7 flex flex-col min-w-0">
                  <h2 className="text-heading-sm font-bold text-text-base leading-tight">{branch.title}</h2>
                  <p className="text-label text-accent-brand font-semibold mt-3">
                    {branch.chairman || 'Председатель не указан'}
                  </p>
                  <div className="space-y-2 mt-5 text-label text-text-muted">
                    <p className="flex items-start gap-2"><MapPin size={15} className="shrink-0 mt-0.5" />{branch.address}</p>
                    {branch.phone && <p className="flex items-center gap-2"><Phone size={15} className="shrink-0" />{branch.phone}</p>}
                    {branch.email && <p className="flex items-center gap-2 break-all"><Mail size={15} className="shrink-0" />{branch.email}</p>}
                  </div>
                  <span className="inline-flex items-center gap-2 text-label font-medium text-text-base mt-auto pt-6">
                    Подробнее <ArrowUpRight size={15} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
