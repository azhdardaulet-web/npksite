import { useState } from 'react';
import { regions } from '@/lib/data';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Phone, MapPin, X, ChevronRight } from 'lucide-react';
import type { Region } from '@/types';

export function BranchesPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Наши" bold="филиалы" subtitle="20 филиалов по всему Казахстану" />

        {/* SVG Map */}
        <ScrollReveal>
          <div className="relative max-w-[900px] mx-auto mb-10">
            <svg viewBox="0 0 900 420" className="w-full h-auto">
              {regionPaths.map((rp) => {
                const region = regions.find(r => r.id === rp.id);
                return (
                  <path
                    key={rp.id}
                    d={rp.d}
                    style={{ fill: selectedRegion?.id === rp.id ? 'rgba(219,31,38,0.25)' : 'var(--surface-2)', stroke: selectedRegion?.id === rp.id ? '#db1f26' : 'var(--line)' }}
                    strokeWidth={selectedRegion?.id === rp.id ? 2 : 1}
                    className="transition-all duration-200 cursor-pointer hover:fill-[rgba(219,31,38,0.15)] hover:stroke-[#db1f26]"
                    onClick={() => setSelectedRegion(region || null)}
                  />
                );
              })}
              {regionLabels.map((rl) => (
                <text key={rl.id} x={rl.x} y={rl.y} fontSize={rl.fontSize || 10}
                  fontWeight={500} textAnchor="middle" className="pointer-events-none select-none"
                  style={{ fontFamily: 'Inter, sans-serif', fill: 'var(--text-muted)' }}>{rl.label}</text>
              ))}
            </svg>
          </div>
        </ScrollReveal>

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
                  <p className="text-body text-text-muted flex items-center gap-2"><MapPin size={14} className="shrink-0" />{selectedRegion.address}</p>
                  <a href={`tel:${selectedRegion.phone.replace(/\s/g, '')}`} className="text-body text-red font-medium flex items-center gap-2 hover:underline">
                    <Phone size={14} className="shrink-0" />{selectedRegion.phone}
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

// Re-use region data from BranchMapSection
const regionPaths = [
  { id: 'vko', d: 'M680 40 L750 30 L800 50 L820 100 L780 140 L720 130 L680 100 Z' },
  { id: 'pavlodar', d: 'M520 30 L620 25 L680 40 L680 100 L600 110 L520 90 Z' },
  { id: 'nko', d: 'M380 20 L480 15 L520 30 L520 90 L450 100 L380 80 Z' },
  { id: 'kostanay', d: 'M250 40 L380 20 L380 80 L320 110 L240 100 Z' },
  { id: 'akmola', d: 'M320 110 L450 100 L480 150 L420 180 L340 170 Z' },
  { id: 'karaganda', d: 'M420 180 L520 160 L580 180 L550 240 L450 250 L400 220 Z' },
  { id: 'ulytau', d: 'M400 220 L450 250 L430 290 L380 270 Z' },
  { id: 'abay', d: 'M720 130 L780 140 L810 190 L750 200 L680 170 Z' },
  { id: 'jetisu', d: 'M580 180 L650 170 L680 200 L620 240 L550 240 Z' },
  { id: 'almaty-obl', d: 'M550 240 L620 240 L640 280 L580 310 L520 290 Z' },
  { id: 'almaty', d: 'M580 310 L610 300 L620 320 L590 330 Z' },
  { id: 'zhambyl', d: 'M430 290 L520 290 L500 350 L420 340 Z' },
  { id: 'turkestan', d: 'M420 340 L500 350 L510 400 L430 410 L400 380 Z' },
  { id: 'shymkent', d: 'M400 380 L430 410 L410 420 L390 400 Z' },
  { id: 'kyzylorda', d: 'M280 280 L380 270 L430 290 L420 340 L320 340 L260 310 Z' },
  { id: 'aktobe', d: 'M100 120 L250 40 L240 100 L200 160 L120 180 L80 150 Z' },
  { id: 'atyrau', d: 'M80 150 L120 180 L140 230 L80 240 L40 200 Z' },
  { id: 'zko', d: 'M120 180 L200 160 L240 100 L320 110 L340 170 L320 230 L200 240 L140 230 Z' },
  { id: 'mangistau', d: 'M40 200 L80 240 L140 230 L160 280 L100 300 L30 260 Z' },
  { id: 'astana', d: 'M450 100 L520 90 L520 160 L480 150 Z' },
];

const regionLabels = [
  { id: 'vko', x: 745, y: 85, label: 'ВКО' },
  { id: 'pavlodar', x: 600, y: 65, label: 'Павлодар' },
  { id: 'nko', x: 445, y: 55, label: 'СКО' },
  { id: 'kostanay', x: 310, y: 65, label: 'Костанай' },
  { id: 'akmola', x: 400, y: 145, label: 'Акмола' },
  { id: 'karaganda', x: 490, y: 210, label: 'Караганда' },
  { id: 'ulytau', x: 415, y: 255, label: 'Улытау' },
  { id: 'abay', x: 740, y: 165, label: 'Абай' },
  { id: 'jetisu', x: 615, y: 210, label: 'Жетысу' },
  { id: 'almaty-obl', x: 585, y: 275, label: 'Алматинская' },
  { id: 'almaty', x: 600, y: 318, label: 'Алматы', fontSize: 9 },
  { id: 'zhambyl', x: 470, y: 320, label: 'Жамбыл' },
  { id: 'turkestan', x: 460, y: 380, label: 'Туркестан' },
  { id: 'shymkent', x: 405, y: 405, label: 'Шымкент', fontSize: 9 },
  { id: 'kyzylorda', x: 340, y: 310, label: 'Кызылорда' },
  { id: 'aktobe', x: 170, y: 100, label: 'Актобе' },
  { id: 'atyrau', x: 100, y: 200, label: 'Атырау' },
  { id: 'zko', x: 235, y: 185, label: 'ЗКО' },
  { id: 'mangistau', x: 95, y: 265, label: 'Мангистау' },
  { id: 'astana', x: 485, y: 128, label: 'Астана', fontSize: 9 },
];
