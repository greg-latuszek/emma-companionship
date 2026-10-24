import type { MessageKey } from '@/i18n/translator';

export const companionshipsTabs = [
  'created',
  'missing',
  'statistics',
  'find',
  'history',
  'new',
] as const;
export type CompanionshipsTab = (typeof companionshipsTabs)[number];

export const companionshipsTabTitleKeys: Record<CompanionshipsTab, MessageKey> = {
  created: 'companionships.tab.created',
  missing: 'companionships.tab.missing',
  statistics: 'companionships.tab.statistics',
  find: 'companionships.tab.find',
  history: 'companionships.tab.history',
  new: 'companionships.tab.new',
};

export function companionshipsTabFrom(
  tab: string | string[] | undefined
): CompanionshipsTab {
  if (tab === 'missing') return 'missing';
  if (tab === 'statistics') return 'statistics';
  if (tab === 'find') return 'find';
  if (tab === 'history') return 'history';
  if (tab === 'new') return 'new';
  return 'created';
}

export function companionshipsTabHref(tab: CompanionshipsTab): string {
  if (tab === 'missing') return '/app/companionships?tab=missing';
  if (tab === 'statistics') return '/app/companionships?tab=statistics';
  if (tab === 'find') return '/app/companionships?tab=find';
  if (tab === 'history') return '/app/companionships?tab=history';
  if (tab === 'new') return '/app/companionships?tab=new';
  return '/app/companionships';
}
