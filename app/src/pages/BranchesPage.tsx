import { useState } from 'react';
import { regions } from '@/lib/data';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { BranchMapSection } from '@/sections/BranchMapSection';
import { Phone, MapPin, X, ChevronRight } from 'lucide-react';
import type { Region } from '@/types';

export function BranchesPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Наши" bold="филиалы" subtitle="20 филиалов по всему Казахстану" />
      </div>

      {/* Карта — тот же компонент, что и на главной (глобус с интерактивными филиалами) */}
      <div className="mb-10">
        <BranchMapSection />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Region cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions.map((region, index) => (
            <ScrollReveal key={region.id} delay={index * 0.03}>
              <button
                onClick={() => setSelectedRegion(selectedRegion?.id === region.id ? null : region)}
                className={`w-full flex items-center justify-between p-5 rounded-card border text-left transition-all duration-200 ${
                  selectedRegion?.id === region.id
                    ? 'border-red bg-red/[0.08]'
                    : 'border-line bg-surface hover:border-text-muted'
                }`}
              >
                <div>
                  <h4 className="text-body-lg font-bold text-text-base">{region.name}</h4>
                  <p className="text-label text-text-muted">{region.chairman}</p>
                </div>
                <ChevronRight size={20} className="text-text-muted shrink-0" />
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Detail modal */}
        {selectedRegion && (
          <ScrollReveal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRegion(null)}>
              <div className="bg-surface rounded-card p-6 border border-line max-w-md w-full relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedRegion(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-base transition-colors" aria-label="Закрыть">
                  <X size={20} />
                </button>
                <h4 className="text-heading font-bold text-text-base mb-4">НПК — {selectedRegion.name}</h4>
                <div className="space-y-3">
                  <p className="text-body text-text-base"><span className="text-text-muted">Председатель:</span> {selectedRegion.chairman}</p>
                  <p className="text-body text-text-muted flex items-start gap-2"><MapPin size={14} className="shrink-0 mt-1" />{selectedRegion.address}</p>
                  {selectedRegion.phone && selectedRegion.phone !== '—' ? (
                    <a href={`tel:${selectedRegion.phone.replace(/[\s()\-]/g, '')}`} className="text-body text-red font-medium flex items-center gap-2 hover:underline">
                      <Phone size={14} className="shrink-0" />{selectedRegion.phone}
                    </a>
                  ) : (
                    <p className="text-body text-text-muted flex items-center gap-2">
                      <Phone size={14} className="shrink-0" />Телефон не указан
                    </p>
                  )}
                  {selectedRegion.email && (
                    <a href={`mailto:${selectedRegion.email}`} className="text-body text-text-muted flex items-center gap-2 hover:text-text-base transition-colors break-all">
                      <span className="shrink-0 text-xs opacity-60">@</span>{selectedRegion.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>
    </div>
  );
}
