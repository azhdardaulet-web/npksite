import type { PublicTeamMember } from '@/lib/api';
import { LEADERSHIP_FALLBACK } from '../../../shared/leadershipData';

export const leadershipFallback: PublicTeamMember[] = LEADERSHIP_FALLBACK;

// Серверные записи имеют приоритет, а новые локальные профили дополняют список
// до следующей синхронизации seed с рабочей базой данных.
export function mergeLeadership(remote: PublicTeamMember[]) {
  const remoteSlugs = new Set(remote.map((leader) => leader.slug).filter(Boolean));
  return [
    ...remote,
    ...leadershipFallback.filter((leader) => !remoteSlugs.has(leader.slug)),
  ].sort((a, b) => a.sortOrder - b.sortOrder);
}
