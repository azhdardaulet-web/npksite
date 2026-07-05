import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';

const leaders = [
  { name: 'Ерлан Кошанов', role: 'Председатель партии', bio: 'Опытный государственный деятель с 25-летним стажем работы в органах власти.' },
  { name: 'Гульшара Абдыкаликова', role: 'Заместитель председателя', bio: 'Экс-аким Кызылординской области, депутат Мажилиса нескольких созывов.' },
  { name: 'Марат Бекетов', role: 'Руководитель фракции', bio: 'Депутат Мажилиса, председатель комитета по социальным вопросам.' },
  { name: 'Айгуль Нурланова', role: 'Пресс-секретарь', bio: 'Журналист, медиа-эксперт, руководитель информационной службы партии.' },
];

export function LeadershipPage() {
  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Руководство" bold="партии" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaders.map((leader, index) => (
            <ScrollReveal key={leader.name} delay={index * 0.08}>
              <div className="bg-cinder rounded-card p-6 border border-white/[0.08]">
                <div className="w-16 h-16 rounded-full bg-ash flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-red">{leader.name[0]}</span>
                </div>
                <h3 className="text-heading-sm font-bold text-white mb-1">{leader.name}</h3>
                <p className="text-label text-red font-medium mb-3">{leader.role}</p>
                <p className="text-body text-fog">{leader.bio}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
