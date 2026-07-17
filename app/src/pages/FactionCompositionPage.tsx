import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { TextReveal } from '@/components/TextReveal';

const deputies = [
  { name: 'Марат Бекетов', role: 'Руководитель фракции', committee: 'Комитет по социально-культурному развитию', photo: '/images/candidate-3.jpg' },
  { name: 'Айкын Конуров', role: 'Первый заместитель председателя партии', committee: 'Комитет по финансам и бюджету', photo: '/images/candidate-1.jpg' },
  { name: 'Жамбыл Ахметбеков', role: 'Депутат Мажилиса', committee: 'Комитет по аграрным вопросам', photo: '/images/candidate-2.jpg' },
  { name: 'Ирина Смирнова', role: 'Депутат Мажилиса', committee: 'Комитет по социально-культурному развитию', photo: '/images/candidate-4.jpg' },
  { name: 'Александр Милютин', role: 'Депутат Мажилиса', committee: 'Комитет по вопросам экономической реформы и региональному развитию', photo: '/images/candidate-5.jpg' },
  { name: 'Сергей Решетников', role: 'Депутат Мажилиса', committee: 'Комитет по законодательству и судебно-правовой реформе', photo: '/images/candidate-6.jpg' },
  { name: 'Айбек Паяев', role: 'Депутат Мажилиса', committee: 'Комитет по международным делам, обороне и безопасности', photo: '/images/candidate-1.jpg' },
  { name: 'Газиз Кулахметов', role: 'Депутат Мажилиса', committee: 'Комитет по вопросам экологии и природопользования', photo: '/images/candidate-2.jpg' },
  { name: 'Ерлан Смайлов', role: 'Депутат Мажилиса', committee: 'Комитет по финансам и бюджету', photo: '/images/candidate-3.jpg' },
  { name: 'Файзолла Каменов', role: 'Депутат Мажилиса', committee: 'Комитет по аграрным вопросам', photo: '/images/candidate-4.jpg' },
];

export function FactionCompositionPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* ===== BREADCRUMBS ===== */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10" style={{ paddingTop: 128 }}>
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
          padding: '8px 18px', borderRadius: 10000,
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
      <section className="bg-bg py-20 md:py-28">
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
            {deputies.map((d) => (
              <div
                key={d.name}
                className="bg-surface rounded-card overflow-hidden border border-line group hover:border-red/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={d.photo}
                    alt={d.name}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="text-body-lg font-bold text-text-base mb-1">{d.name}</h3>
                  <p className="text-label text-accent-brand font-medium mb-2">{d.role}</p>
                  <p className="text-body text-text-muted line-clamp-2">{d.committee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
