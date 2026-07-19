import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { TextReveal } from '@/components/TextReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';

export const FACTION_FALLBACK: PublicTeamMember[] = [
  { id: 'f1', slug: 'marat-beketov', group: 'FACTION', sortOrder: 0, name: 'Марат Бекетов', position: 'Руководитель фракции', bio: 'Комитет по социально-культурному развитию', fullBio: null, photoUrl: '/images/candidate-3.jpg' },
  { id: 'f2', slug: 'ajkyn-konurov', group: 'FACTION', sortOrder: 1, name: 'Айкын Конуров', position: 'Первый заместитель председателя партии', bio: 'Комитет по финансам и бюджету', fullBio: null, photoUrl: '/images/candidate-1.jpg' },
  { id: 'f3', slug: 'zhambyl-ahmetbekov', group: 'FACTION', sortOrder: 2, name: 'Жамбыл Ахметбеков', position: 'Депутат Мажилиса', bio: 'Комитет по аграрным вопросам', fullBio: null, photoUrl: '/images/candidate-2.jpg' },
  { id: 'f4', slug: 'irina-smirnova', group: 'FACTION', sortOrder: 3, name: 'Ирина Смирнова', position: 'Депутат Мажилиса', bio: 'Комитет по социально-культурному развитию', fullBio: null, photoUrl: '/images/candidate-4.jpg' },
  { id: 'f5', slug: 'aleksandr-milyutin', group: 'FACTION', sortOrder: 4, name: 'Александр Милютин', position: 'Депутат Мажилиса', bio: 'Комитет по вопросам экономической реформы и региональному развитию', fullBio: null, photoUrl: '/images/candidate-5.jpg' },
  { id: 'f6', slug: 'sergej-reshetnikov', group: 'FACTION', sortOrder: 5, name: 'Сергей Решетников', position: 'Депутат Мажилиса', bio: 'Комитет по законодательству и судебно-правовой реформе', fullBio: null, photoUrl: '/images/candidate-6.jpg' },
  { id: 'f7', slug: 'ajbek-payaev', group: 'FACTION', sortOrder: 6, name: 'Айбек Паяев', position: 'Депутат Мажилиса', bio: 'Комитет по международным делам, обороне и безопасности', fullBio: null, photoUrl: '/images/candidate-1.jpg' },
  { id: 'f8', slug: 'gaziz-kulahmetov', group: 'FACTION', sortOrder: 7, name: 'Газиз Кулахметов', position: 'Депутат Мажилиса', bio: 'Комитет по вопросам экологии и природопользования', fullBio: null, photoUrl: '/images/candidate-2.jpg' },
  { id: 'f9', slug: 'erlan-smajlov', group: 'FACTION', sortOrder: 8, name: 'Ерлан Смайлов', position: 'Депутат Мажилиса', bio: 'Комитет по финансам и бюджету', fullBio: null, photoUrl: '/images/candidate-3.jpg' },
  { id: 'f10', slug: 'fajzolla-kamenov', group: 'FACTION', sortOrder: 9, name: 'Файзолла Каменов', position: 'Депутат Мажилиса', bio: 'Комитет по аграрным вопросам', fullBio: null, photoUrl: '/images/candidate-4.jpg' },
];

export function FactionCompositionPage() {
  const [deputies, setDeputies] = useState<PublicTeamMember[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchTeam('FACTION')
      .then((items) => { if (!cancelled) setDeputies(items.length > 0 ? items : FACTION_FALLBACK); })
      .catch(() => { if (!cancelled) setDeputies(FACTION_FALLBACK); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-bg min-h-screen">
      {/* ===== BREADCRUMBS ===== */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/frakciya">Фракция</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>Состав фракции</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ===== HERO ===== */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-10" style={{ padding: '24px 16px 40px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 0,
          border: '1.5px solid rgba(219,31,38,0.35)', color: '#db1f26',
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
          marginBottom: 24,
        }}>
          Фракция НПК
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800,
          lineHeight: 0.95, letterSpacing: '-0.04em', margin: 0, color: 'var(--text)',
        }}>
          Состав <span style={{ color: '#db1f26' }}>фракции</span>
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.65,
          marginTop: 20, maxWidth: 640,
        }}>
          Депутаты Народной партии Казахстана в Мажилисе Парламента РК — люди, которые
          представляют интересы избирателей в ключевых комитетах и продвигают инициативы
          партии на законодательном уровне.
        </p>
      </section>

      {/* ===== НАШИ ЛИЦА ===== */}
      <section className="bg-bg py-[var(--section-gap)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-label text-accent-brand font-medium mb-3 uppercase tracking-wider">Фракция</p>
              <TextReveal
                tag="h2"
                className="font-formular text-heading-md md:text-heading-lg text-text-base"
              >
                Наши лица
              </TextReveal>
              <p className="text-body-lg font-light text-text-muted mt-3 max-w-[560px]">
                Депутаты фракции НПК в Мажилисе Парламента РК — представители народа,
                которые каждый день работают над законами для страны.
              </p>
            </div>
          </div>

          {/* Grid of deputy cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(deputies.length > 0 ? deputies : FACTION_FALLBACK).map((d) => (
              <Link
                key={d.id}
                to={d.slug ? `/frakciya/sostav/${d.slug}` : '/frakciya/sostav'}
                className="bg-surface rounded-card overflow-hidden border border-line group hover:border-red/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={d.photoUrl ?? undefined}
                    alt={d.name}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="text-body-lg font-bold text-text-base mb-1">{d.name}</h3>
                  <p className="text-label text-accent-brand font-medium mb-2">{d.position}</p>
                  <p className="text-body text-text-muted line-clamp-2">{d.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
