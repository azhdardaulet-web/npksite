import type { PublicTeamMember } from '@/lib/api';
import { LEADERSHIP_FALLBACK } from '../../../shared/leadershipData';
import { LEADERSHIP_KZ_BY_SLUG } from '../../../shared/leadershipDataKz';
import type { Language } from '@/i18n/LanguageContext';

export const leadershipFallback: PublicTeamMember[] = LEADERSHIP_FALLBACK;

type LeadershipKz = (typeof LEADERSHIP_KZ_BY_SLUG)[keyof typeof LEADERSHIP_KZ_BY_SLUG];
const leadershipKzBySlug: Record<string, LeadershipKz> = LEADERSHIP_KZ_BY_SLUG;

function localizeLeader(leader: PublicTeamMember, language: Language): PublicTeamMember {
  if (language !== 'kz' || !leader.slug) return leader;
  const localized = leadershipKzBySlug[leader.slug];
  return localized ? { ...leader, ...localized } : leader;
}

export function getLeadershipFallback(language: Language) {
  return leadershipFallback.map((leader) => localizeLeader(leader, language));
}

// Серверные записи имеют приоритет, а новые локальные профили дополняют список
// до следующей синхронизации seed с рабочей базой данных.
export function mergeLeadership(remote: PublicTeamMember[], language: Language = 'ru') {
  const remoteSlugs = new Set(remote.map((leader) => leader.slug).filter(Boolean));
  return [
    ...remote,
    ...leadershipFallback.filter((leader) => !remoteSlugs.has(leader.slug)),
  ].map((leader) => localizeLeader(leader, language)).sort((a, b) => a.sortOrder - b.sortOrder);
}
