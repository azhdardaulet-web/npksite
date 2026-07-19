import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { fetchTeam, type PublicTeamMember } from '@/lib/api';

// Данные сверены с halykpartiyasy.kz/ru/rukovodstvo-partii (19.07.2026).
// bio — короткая подпись в карточке, fullBio — резюме (образование/карьера) на персональной странице.
// Экспортируется — переиспользуется в LeadershipDetailPage как запасной источник.
export const FALLBACK: PublicTeamMember[] = [
  {
    id: '1', photoUrl: '/images/leader-shokanov.jpg', slug: 'shokanov-nursultan', group: 'LEADERSHIP', sortOrder: 0,
    name: 'Нурсултан Шоканов', position: 'Председатель партии',
    bio: 'Возглавляет партию с 2026 года. Ранее руководил Алматинским городским и областным филиалами НПК, депутат Маслихата города Алматы VIII созыва.',
    fullBio: 'ОБРАЗОВАНИЕ\n• Казахстанский институт менеджмента, экономики и прогнозирования — специальность «Финансы» (2007)\n• IMD Business School, Швейцария — Executive MBA (2018)\n\nКАРЬЕРА\n• 2006–2007 — аудитор нефтегазовых компаний, Ernst & Young\n• 2007–2008 — консультант «Казахстан Девелопмент Груп»\n• 2008–2009 — руководящие должности, «СанДриллинг»\n• 2009–2010 — генеральный директор, ТОО «Центр Развития Карьеры»\n• 2010–2019 — руководитель Allies Industrial\n• 2020–2022 — председатель Правления Ассоциации поставщиков промышленных предприятий\n• 2022–2025 — руководитель Алматинского городского филиала партии\n• 2024–2025 — председатель Алматинского областного филиала\n\nТАКЖЕ\n• Депутат Маслихата города Алматы VIII созыва\n• Президент Федерации альпинизма и спортивного скалолазания Казахстана',
  },
  {
    id: '2', photoUrl: '/images/leader-kusainov.jpg', slug: 'kusainov-bejbut-bulatovich', group: 'LEADERSHIP', sortOrder: 1,
    name: 'Бейбит Кусаинов', position: 'Заместитель Председателя партии',
    bio: 'Председатель Алматинского городского филиала НПК, депутат Маслихата города Алматы VIII созыва, председатель комиссии по культуре, спорту и молодёжи.',
    fullBio: 'ДОЛЖНОСТИ\n• Заместитель Председателя Народной партии Казахстана (с 2026 года)\n• Председатель Алматинского городского филиала партии (с 2025 года)\n• Депутат Маслихата города Алматы VIII созыва\n• Председатель постоянной комиссии по культуре, спорту, внутренней политике, религии и молодёжи\n\nОБРАЗОВАНИЕ\n• Казахский национальный университет имени аль-Фараби — факультет международных отношений, специальность «Международное право» (2008)\n• МГУ имени М.В. Ломоносова — MBA, «Деловое администрирование» (2019)\n\nКАРЬЕРА\n• С 2006 года — Министерство юстиции РК\n• Консалтинг, Ernst & Young\n• Генеральный директор нескольких компаний: АКА Транс, Vendor Holding, ADVANTA INDUSTRIES\n• Работа в Евразийском экономическом сообществе и на коммерческих должностях',
  },
  {
    id: '3', photoUrl: '/images/leader-aukenov.jpg', slug: 'aukenov-miras', group: 'LEADERSHIP', sortOrder: 2,
    name: 'Мирас Аукенов', position: 'Заместитель Председателя партии',
    bio: 'В партии с 2022 года, ранее — исполнительный директор аналитического центра TALAP. Награждён медалями «Ерен еңбегі үшін» и «Халық алғысы».',
    fullBio: 'ДОЛЖНОСТЬ\n• Заместитель Председателя Народной партии Казахстана (с 2023 года)\n\nОБРАЗОВАНИЕ\n• Карагандинский государственный университет имени Е.А. Букетова — юридический факультет, специальность «Юриспруденция»\n• РАНХиГС при Президенте РФ — MBA, «Международный бизнес»\n\nКАРЬЕРА\n• 2006–2009 — юрист, затем главный юрист, АО «Цеснабанк»\n• 2009–2011 — заместитель директора юридического департамента строительной компании (Астана)\n• 2011–2013 — начальник отдела таможенно-правового обеспечения Казахстанской промышленной корпорации\n• 2013–2015 — юридический руководитель, АО «Кокшетауские минеральные воды»\n• 2015–2022 — исполнительный директор аналитического центра TALAP\n• 2022 — советник Председателя партии\n• 2022–2023 — руководитель Аппарата партии\n• С 2023 года — заместитель Председателя партии\n\nНАГРАДЫ\n• Медаль «Ерен еңбегі үшін»\n• Медаль «Халық алғысы»',
  },
  {
    id: '4', photoUrl: '/images/leader-kurmanbaev.jpg', slug: 'kurmanbaev-zhandos', group: 'LEADERSHIP', sortOrder: 3,
    name: 'Жандос Курманбаев', position: 'Заместитель Председателя партии по стратегии и идеологии',
    bio: 'Отвечает за стратегию и идеологию партии с 2026 года, советник по медиа с 2023 года. Опыт работы в маркетинге, PR и на телевидении.',
    fullBio: 'ДОЛЖНОСТЬ\n• Заместитель Председателя Народной партии Казахстана по стратегии и идеологии (с 2026 года)\n\nОБРАЗОВАНИЕ\n• Республиканская музыкальная школа-интернат имени Куляш Байсеитовой — специализация «гобой»\n• Национальный университет искусств\n• University of International Business — MBA, корпоративный менеджмент\n• Institute of Metacognitive Programming, Торонто, Канада\n• Академия экспоненциального коучинга Михаила Саидова\n\nКАРЬЕРА\n• 2004–2006 — арт-директор Западно-Казахстанского филармонического оркестра\n• 2006–2010 — руководитель маркетинга, АО «Астана Финанс»\n• 2011–2012 — главный менеджер медиапроектов, «Самрук-Казына»\n• 2012–2013 — директор по PR, «Союз Атамекен»\n• 2015–2016 — советник по коммуникациям при Председателе «Атамекен»\n• 2016–2017 — директор по развитию телеканала «Алматы»\n• С 2023 года — советник по медиа Народной партии',
  },
  {
    id: '5', photoUrl: '/images/leader-maksutov.jpg', slug: 'maksutov-kalel-mukataevich', group: 'LEADERSHIP', sortOrder: 4,
    name: 'Калел Максутов', position: 'Заместитель Председателя партии',
    bio: 'Также возглавляет Карагандинский областной филиал НПК. Ранее — аким Каркаралинского района, работал в акиматах Атырауской области.',
    fullBio: 'ДОЛЖНОСТИ\n• Заместитель Председателя Народной партии Казахстана (с 2026 года)\n• Председатель Карагандинского областного филиала партии\n\nОБРАЗОВАНИЕ\n• Атырауский государственный университет имени Халела Досмухамедова — диплом по юриспруденции\n• Атырауский государственный университет имени Халела Досмухамедова — диплом по экономике\n• Владеет казахским и русским языками\n\nКАРЬЕРА\n• 1987–1993 — работа в комсомольских органах\n• Председатель Комитета по делам молодёжи Карагандинской области\n• 1999–2009 — заместитель акима города Атырау, затем аким города Кульсары (Атырауская область)\n• 2009–2011 — заместитель акима города Караганды\n• 2011–2019 — аким Каркаралинского района\n• 2019–2021 — руководитель Управления земельных отношений Карагандинской области',
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

// slug может отсутствовать (старая запись из CMS без персональной страницы) —
// тогда карточка просто не кликабельна, а не ведёт на 404.
function leaderHref(leader: PublicTeamMember) {
  return leader.slug ? `/rukovodstvo/${leader.slug}` : undefined;
}

export function LeadershipPage() {
  const [leaders, setLeaders] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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
                <Link
                  to={leaderHref(chairman) ?? '#'}
                  className="w-full text-center sm:text-left bg-surface rounded-card p-6 md:p-8 border border-line mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-text-muted transition-colors"
                >
                  <LeaderAvatar leader={chairman} size={112} />
                  <div>
                    <h3 className="text-heading font-bold text-text-base mb-1">{chairman.name}</h3>
                    <p className="text-label text-accent-brand font-medium mb-3">{chairman.position}</p>
                    <p className="text-body text-text-muted">{chairman.bio}</p>
                  </div>
                </Link>
              </ScrollReveal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deputies.map((leader, index) => (
                <ScrollReveal key={leader.id} delay={index * 0.08}>
                  <Link
                    to={leaderHref(leader) ?? '#'}
                    className="block bg-surface rounded-card p-6 border border-line hover:border-text-muted transition-colors"
                  >
                    <LeaderAvatar leader={leader} size={64} />
                    <h3 className="text-heading-sm font-bold text-text-base mb-1 mt-4">{leader.name}</h3>
                    <p className="text-label text-accent-brand font-medium mb-3">{leader.position}</p>
                    <p className="text-body text-text-muted">{leader.bio}</p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
