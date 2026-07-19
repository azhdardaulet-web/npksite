import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';

// Данные сверены с halykpartiyasy.kz/ru/rukovodstvo-partii (19.07.2026).
// bio — короткая подпись в карточке, fullBio — резюме (образование/карьера) в модалке по клику.
const FALLBACK: PublicTeamMember[] = [
  {
    id: '1', photoUrl: '/images/leader-shokanov.jpg', group: 'LEADERSHIP', sortOrder: 0,
    name: 'Нурсултан Шоканов', position: 'Председатель партии',
    bio: 'Возглавляет партию с 2026 года. Ранее руководил Алматинским городским и областным филиалами НПК, депутат Маслихата города Алматы VIII созыва.',
    fullBio: 'Образование: Казахстанский институт менеджмента, экономики и прогнозирования, специальность «Финансы» (2007); Executive MBA, IMD Business School, Швейцария (2018).\n\nКарьера: 2006–2007 — аудитор нефтегазовых компаний, Ernst & Young; 2007–2008 — консультант «Казахстан Девелопмент Груп»; 2008–2010 — руководящие должности в «СанДриллинг», затем генеральный директор ТОО «Центр Развития Карьеры»; 2010–2019 — возглавлял Allies Industrial; 2020–2022 — председатель Правления Ассоциации поставщиков промышленных предприятий; 2022–2025 — руководитель Алматинского городского филиала партии; 2024–2025 — председатель Алматинского областного филиала.\n\nТакже: депутат Маслихата города Алматы VIII созыва, президент Федерации альпинизма и спортивного скалолазания Казахстана.',
  },
  {
    id: '2', photoUrl: '/images/leader-kusainov.jpg', group: 'LEADERSHIP', sortOrder: 1,
    name: 'Бейбит Кусаинов', position: 'Заместитель Председателя партии',
    bio: 'Председатель Алматинского городского филиала НПК, депутат Маслихата города Алматы VIII созыва, председатель комиссии по культуре, спорту и молодёжи.',
    fullBio: 'Образование: Казахский национальный университет имени аль-Фараби, факультет международных отношений, специальность «Международное право» (2008); MBA по направлению «Деловое администрирование», МГУ имени М.В. Ломоносова (2019).\n\nКарьера: с 2006 года — Министерство юстиции РК, затем консалтинг (Ernst & Young), руководящие должности в ряде компаний (АКА Транс, Vendor Holding, ADVANTA INDUSTRIES), работа в Евразийском экономическом сообществе.\n\nТакже: председатель Алматинского городского филиала партии (с 2025 года), депутат Маслихата города Алматы VIII созыва, председатель постоянной комиссии по культуре, спорту, внутренней политике, религии и молодёжи.',
  },
  {
    id: '3', photoUrl: '/images/leader-aukenov.jpg', group: 'LEADERSHIP', sortOrder: 2,
    name: 'Мирас Аукенов', position: 'Заместитель Председателя партии',
    bio: 'В партии с 2022 года, ранее — исполнительный директор аналитического центра TALAP. Награждён медалями «Ерен еңбегі үшін» и «Халық алғысы».',
    fullBio: 'Образование: юридический факультет Карагандинского государственного университета имени Е.А. Букетова, специальность «Юриспруденция»; MBA по направлению «Международный бизнес», РАНХиГС при Президенте РФ.\n\nКарьера: 2006–2009 — юрист, затем главный юрист АО «Цеснабанк»; 2009–2011 — заместитель директора юридического департамента строительной компании (Астана); 2011–2013 — начальник отдела таможенно-правового обеспечения Казахстанской промышленной корпорации; 2013–2015 — юридический руководитель АО «Кокшетауские минеральные воды»; 2015–2022 — исполнительный директор аналитического центра TALAP; 2022 — советник Председателя партии; 2022–2023 — руководитель Аппарата партии; с 2023 года — заместитель Председателя партии.\n\nНаграждён медалями «Ерен еңбегі үшін» и «Халық алғысы».',
  },
  {
    id: '4', photoUrl: '/images/leader-kurmanbaev.jpg', group: 'LEADERSHIP', sortOrder: 3,
    name: 'Жандос Курманбаев', position: 'Заместитель Председателя партии по стратегии и идеологии',
    bio: 'Отвечает за стратегию и идеологию партии с 2026 года, советник по медиа с 2023 года. Опыт работы в маркетинге, PR и на телевидении.',
    fullBio: 'Образование: Республиканская музыкальная школа-интернат имени Куляш Байсеитовой (специализация — гобой), Национальный университет искусств; MBA по корпоративному менеджменту, University of International Business; Institute of Metacognitive Programming (Торонто, Канада); Академия экспоненциального коучинга Михаила Саидова.\n\nКарьера: 2004–2006 — арт-директор Западно-Казахстанского филармонического оркестра; 2006–2010 — руководитель маркетинга АО «Астана Финанс»; 2011–2012 — главный менеджер медиапроектов «Самрук-Казына»; 2012–2013 — директор по PR «Союз Атамекен»; 2015–2016 — советник по коммуникациям при Председателе «Атамекен»; 2016–2017 — директор по развитию телеканала «Алматы»; с 2023 года — советник по медиа Народной партии, с 2026 года — заместитель Председателя партии по стратегии и идеологии.',
  },
  {
    id: '5', photoUrl: '/images/leader-maksutov.jpg', group: 'LEADERSHIP', sortOrder: 4,
    name: 'Калел Максутов', position: 'Заместитель Председателя партии',
    bio: 'Также возглавляет Карагандинский областной филиал НПК. Ранее — аким Каркаралинского района, работал в акиматах Атырауской области.',
    fullBio: 'Образование: диплом по юриспруденции и диплом по экономике, Атырауский государственный университет имени Халела Досмухамедова. Владеет казахским и русским языками.\n\nКарьера: 1987–1993 — работа в комсомольских органах; председатель Комитета по делам молодёжи Карагандинской области; 1999–2009 — заместитель акима города Атырау, затем аким города Кульсары (Атырауская область); 2009–2011 — заместитель акима города Караганды; 2011–2019 — аким Каркаралинского района; 2019–2021 — руководитель Управления земельных отношений Карагандинской области.\n\nТакже возглавляет Карагандинский областной филиал партии.',
  },
];

function LeaderSkeleton() {
  return (
    <div className="bg-surface rounded-card p-6 border border-line">
      <div className="w-16 h-16 rounded-full bg-surface-2 mb-4" />
      <div className="h-4 w-1/2 bg-surface-2 rounded mb-2" />
      <div className="h-3 w-1/3 bg-surface-2 rounded mb-3" />
      <div className="h-3 w-full bg-surface-2 rounded" />
    </div>
  );
}

function ChairmanSkeleton() {
  return (
    <div className="bg-surface rounded-card p-6 md:p-8 border border-line mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-surface-2 shrink-0" />
      <div className="w-full">
        <div className="h-5 w-1/3 bg-surface-2 rounded mb-2 mx-auto sm:mx-0" />
        <div className="h-3 w-1/4 bg-surface-2 rounded mb-3 mx-auto sm:mx-0" />
        <div className="h-3 w-full bg-surface-2 rounded" />
      </div>
    </div>
  );
}

function LeaderAvatar({ leader, size }: { leader: PublicTeamMember; size: number }) {
  return (
    <div
      className="rounded-full bg-surface-2 overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {leader.photoUrl ? (
        <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-accent-brand" style={{ fontSize: size / 3 }}>{leader.name[0]}</span>
      )}
    </div>
  );
}

export function LeadershipPage() {
  const [leaders, setLeaders] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTeam('LEADERSHIP')
      .then((data) => { if (!cancelled) setLeaders(data.length > 0 ? data : FALLBACK); })
      .catch(() => { if (!cancelled) setLeaders(FALLBACK); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Первый по sortOrder — председатель партии, выносим его отдельной карточкой сверху.
  const [chairman, ...deputies] = leaders;
  const selected = leaders.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Руководство" bold="партии" />

        {loading ? (
          <>
            <ChairmanSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <LeaderSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {chairman && (
              <ScrollReveal>
                <button
                  onClick={() => setSelectedId(chairman.id)}
                  className="w-full text-center sm:text-left bg-surface rounded-card p-6 md:p-8 border border-line mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-text-muted transition-colors"
                >
                  <LeaderAvatar leader={chairman} size={112} />
                  <div>
                    <h3 className="text-heading font-bold text-text-base mb-1">{chairman.name}</h3>
                    <p className="text-label text-accent-brand font-medium mb-3">{chairman.position}</p>
                    <p className="text-body text-text-muted">{chairman.bio}</p>
                  </div>
                </button>
              </ScrollReveal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deputies.map((leader, index) => (
                <ScrollReveal key={leader.id} delay={index * 0.08}>
                  <button
                    onClick={() => setSelectedId(leader.id)}
                    className="w-full text-left bg-surface rounded-card p-6 border border-line hover:border-text-muted transition-colors"
                  >
                    <LeaderAvatar leader={leader} size={64} />
                    <h3 className="text-heading-sm font-bold text-text-base mb-1 mt-4">{leader.name}</h3>
                    <p className="text-label text-accent-brand font-medium mb-3">{leader.position}</p>
                    <p className="text-body text-text-muted">{leader.bio}</p>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </>
        )}

        {/* Модалка с полным резюме — открывается по клику на карточку */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <div
              className="bg-surface rounded-card p-6 md:p-8 border border-line max-w-lg w-full relative max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-base transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-5 pr-8">
                <LeaderAvatar leader={selected} size={72} />
                <div>
                  <h4 className="text-heading-sm font-bold text-text-base">{selected.name}</h4>
                  <p className="text-label text-accent-brand font-medium">{selected.position}</p>
                </div>
              </div>

              {selected.fullBio ? (
                <div className="space-y-3">
                  {selected.fullBio.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-body text-text-muted leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-body text-text-muted leading-relaxed">{selected.bio}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
