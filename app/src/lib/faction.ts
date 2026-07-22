import type { Language } from '@/i18n/LanguageContext';
import type { PublicTeamMember } from '@/lib/api';

export const FACTION_FALLBACK: PublicTeamMember[] = [
  { id: 'f-smirnova', slug: 'irina-smirnova', group: 'FACTION', sortOrder: 0, name: 'Смирнова Ирина Владимировна', position: 'Депутат Мажилиса Парламента Республики Казахстан', bio: 'Член Комитета по финансам и бюджету Мажилиса Парламента Республики Казахстан', fullBio: null, photoUrl: '/images/faction/irina-smirnova.jpg' },
  { id: 'f-seitzhan', slug: 'kenzhegul-seitzhan', group: 'FACTION', sortOrder: 1, name: 'Сейтжан Кенжеғұл Социалұлы', position: 'Депутат Мажилиса Парламента Республики Казахстан', bio: 'Член Комитета по вопросам экологии и природопользованию Мажилиса Парламента Республики Казахстан', fullBio: null, photoUrl: '/images/faction/kenzhegul-seitzhan.jpg' },
  { id: 'f-sunkar', slug: 'islam-sunkar', group: 'FACTION', sortOrder: 2, name: 'Сұңқар Ислам Еркінұлы', position: 'Депутат Мажилиса Парламента Республики Казахстан', bio: 'Член Комитета по аграрным вопросам Мажилиса Парламента Республики Казахстан', fullBio: null, photoUrl: '/images/faction/islam-sunkar.jpg' },
  { id: 'f-nuralin', slug: 'asylbek-nuralin', group: 'FACTION', sortOrder: 3, name: 'Нұралин Асылбек Жамашұлы', position: 'Депутат Мажилиса Парламента Республики Казахстан', bio: 'Член Комитета по социально-культурному развитию Мажилиса Парламента Республики Казахстан', fullBio: null, photoUrl: '/images/faction/asylbek-nuralin.jpg' },
];

const FACTION_FALLBACK_KZ: PublicTeamMember[] = FACTION_FALLBACK.map((member) => ({
  ...member,
  position: 'Қазақстан Республикасы Парламенті Мәжілісінің депутаты',
  bio: ({
    'irina-smirnova': 'Қазақстан Республикасы Парламенті Мәжілісінің Қаржы және бюджет комитетінің мүшесі',
    'kenzhegul-seitzhan': 'Қазақстан Республикасы Парламенті Мәжілісінің Экология мәселелері және табиғат пайдалану комитетінің мүшесі',
    'islam-sunkar': 'Қазақстан Республикасы Парламенті Мәжілісінің Аграрлық мәселелер комитетінің мүшесі',
    'asylbek-nuralin': 'Қазақстан Республикасы Парламенті Мәжілісінің Әлеуметтік-мәдени даму комитетінің мүшесі',
  } as Record<string, string>)[member.slug ?? ''] ?? member.bio,
}));

export function getFactionFallback(language: Language) {
  return language === 'kz' ? FACTION_FALLBACK_KZ : FACTION_FALLBACK;
}

function factionMemberKey(name: string) {
  const normalized = name.toLocaleLowerCase('ru-RU');
  if (normalized.includes('смирнова')) return 'irina-smirnova';
  if (normalized.includes('сейтжан') || normalized.includes('сейітжан')) return 'kenzhegul-seitzhan';
  if (normalized.includes('сұңқар') || normalized.includes('сункар')) return 'islam-sunkar';
  if (normalized.includes('нұралин') || normalized.includes('нуралин')) return 'asylbek-nuralin';
  return null;
}

export function mergeFactionMembers(remote: PublicTeamMember[], language: Language) {
  const fallback = getFactionFallback(language);
  const remoteByKey = new Map<string, PublicTeamMember>();
  remote.forEach((member) => {
    const key = factionMemberKey(member.name);
    if (key) remoteByKey.set(key, member);
  });
  return fallback.map((member) => {
    const remoteMember = remoteByKey.get(member.slug ?? '');
    if (!remoteMember) return member;
    return {
      ...remoteMember,
      ...member,
      id: remoteMember.id,
      fullBio: remoteMember.fullBio ?? member.fullBio,
    };
  });
}
