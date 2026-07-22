import branchMigration from '../../../supabase/migrations/202607190004_kz_branches.sql?raw';
import type { BranchProfile } from '@/lib/branchProfiles';
import { BRANCH_PROFILES_KZ } from './branchProfilesKz';

export interface ApprovedBranchKz {
  city: string;
  fullName: string;
  chairman: string;
  address: string;
}

function unescapeSql(value: string): string {
  return value.replace(/''/g, "'");
}

// SQL этапа 2 сформирован из вычитанного файла. Читаем те же значения здесь,
// чтобы не поддерживать вторую вручную скопированную таблицу из 20 филиалов.
export const approvedBranchesKz: ApprovedBranchKz[] = branchMigration
  .split('\n')
  .filter((line) => /^\s*\('[^']+'/.test(line))
  .map((line) => [...line.matchAll(/'((?:''|[^'])*)'/g)].map((match) => unescapeSql(match[1] ?? '')))
  .filter((values) => values.length >= 4)
  .map((values) => ({
    city: values[1] ?? '',
    fullName: values[2] ?? '',
    chairman: values.length >= 5 ? values[3] ?? '' : '',
    address: values.length >= 5 ? values[4] ?? '' : values[3] ?? '',
  }));

export function localizeBranchProfile(profile: BranchProfile, index: number, language: 'ru' | 'kz'): BranchProfile {
  const approved = approvedBranchesKz[index];
  const official = BRANCH_PROFILES_KZ[profile.slug];
  if (language !== 'kz') return profile;
  let personIndex = 0;
  const sectionTitleFallback: Record<string, string> = {
    'Депутаты маслихатов': 'Мәслихат депутаттары',
    'Депутаты областных маслихатов': 'Облыстық мәслихат депутаттары',
    'Депутаты маслихата': 'Мәслихат депутаттары',
    'Акимы сельских округов': 'Ауылдық округ әкімдері',
    'Районные Акимы': 'Аудан әкімдері',
    'Районные акимы': 'Аудан әкімдері',
  };
  const sections = profile.sections.map((section, sectionIndex) => ({
    ...section,
    title: official?.sectionTitles[sectionIndex] || sectionTitleFallback[section.title] || section.title,
    people: section.people.map((person) => {
      const translated = official?.people[personIndex++];
      return translated ? {
        ...person,
        name: translated.name || person.name,
        position: translated.position || person.position,
      } : person;
    }),
  }));
  return {
    ...profile,
    title: approved?.fullName || official?.title || profile.title,
    chairman: approved?.chairman || official?.chairman || profile.chairman,
    address: approved?.address || official?.address || profile.address,
    sections,
  };
}

export function localizeBranchMapItem<T extends { name: string; short: string; chairman: string; address: string }>(
  item: T,
  index: number,
  language: 'ru' | 'kz',
): T {
  const approved = approvedBranchesKz[index];
  if (language !== 'kz' || !approved) return item;
  return {
    ...item,
    name: approved.fullName || item.name,
    short: approved.city || item.short,
    chairman: approved.chairman || item.chairman,
    address: approved.address || item.address,
  };
}
