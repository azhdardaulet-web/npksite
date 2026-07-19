import branchMigration from '../../../supabase/migrations/202607190004_kz_branches.sql?raw';
import type { BranchProfile } from '@/lib/branchProfiles';

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
  if (language !== 'kz' || !approved) return profile;
  return {
    ...profile,
    title: approved.fullName || profile.title,
    chairman: approved.chairman || profile.chairman,
    address: approved.address || profile.address,
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
