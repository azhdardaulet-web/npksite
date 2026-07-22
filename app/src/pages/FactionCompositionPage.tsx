import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { TextReveal } from '@/components/TextReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { getFactionFallback, mergeFactionMembers } from '@/lib/faction';

export function FactionCompositionPage() {
  const { language } = useLanguage();
  const [deputies, setDeputies] = useState<PublicTeamMember[]>(getFactionFallback(language));

  useEffect(() => {
    let cancelled = false;
    fetchTeam('FACTION', language)
      .then((items) => { if (!cancelled) setDeputies(mergeFactionMembers(items, language)); })
      .catch(() => { if (!cancelled) setDeputies(getFactionFallback(language)); });
    return () => { cancelled = true; };
  }, [language]);

  const isKazakh = language === 'kz';

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
              <BreadcrumbPage style={{ color: 'var(--text)' }}>{isKazakh ? 'Фракция құрамы' : 'Состав фракции'}</BreadcrumbPage>
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
          {isKazakh ? 'ҚХП фракциясы' : 'Фракция НПК'}
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800,
          lineHeight: 0.95, letterSpacing: '-0.04em', margin: 0, color: 'var(--text)',
        }}>
          {isKazakh ? 'Қазақстан Республикасы Парламенті Мәжілісінің ' : 'Состав фракции '}
          <span style={{ color: '#db1f26' }}>{isKazakh ? 'VIII шақырылымы' : '8 созыва Мажилиса Парламента'}</span>
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.65,
          marginTop: 20, maxWidth: 640,
        }}>
          {isKazakh
            ? 'Қазақстан Халық партиясының депутаттары сайлаушылардың мүддесін Мәжілістің негізгі комитеттерінде қорғайды және партия бастамаларын заңнамалық деңгейде ілгерілетеді.'
            : 'Депутаты Народной партии Казахстана представляют интересы избирателей в ключевых комитетах Мажилиса и продвигают инициативы партии на законодательном уровне.'}
        </p>
      </section>

      {/* ===== НАШИ ЛИЦА ===== */}
      <section className="bg-bg py-[var(--section-gap)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-label text-accent-brand font-medium mb-3 uppercase tracking-wider">{isKazakh ? 'Фракция' : 'Фракция'}</p>
              <TextReveal
                tag="h2"
                className="font-formular text-heading-md md:text-heading-lg text-text-base"
              >
                {isKazakh ? 'Біздің өкілдер' : 'Наши представители'}
              </TextReveal>
              <p className="text-body-lg font-light text-text-muted mt-3 max-w-[560px]">
                {isKazakh
                  ? 'ҚХП фракциясының Мәжілістегі депутаттары — ел үшін қажетті заңдармен күн сайын жұмыс істейтін халық өкілдері.'
                  : 'Депутаты фракции НПК в Мажилисе — представители народа, которые ежедневно работают над необходимыми стране законами.'}
              </p>
            </div>
          </div>

          {/* Grid of deputy cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {deputies.map((d) => (
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
