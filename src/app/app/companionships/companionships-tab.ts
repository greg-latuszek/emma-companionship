export const companionshipsTabs = [
  'created',
  'missing',
  'find',
  'history',
  'new',
] as const;
export type CompanionshipsTab = (typeof companionshipsTabs)[number];

export const companionshipsTabTitles: Record<CompanionshipsTab, string> = {
  created: 'Utworzone Akompaniamenty',
  missing: 'Brakujące Akompaniamenty',
  find: 'Znajdź Akompaniatora',
  history: 'Historia Akompaniamentów',
  new: '+ Dodaj Akompaniament',
};

export function companionshipsTabFrom(
  tab: string | string[] | undefined
): CompanionshipsTab {
  if (tab === 'missing') return 'missing';
  if (tab === 'find') return 'find';
  if (tab === 'history') return 'history';
  if (tab === 'new') return 'new';
  return 'created';
}

export function companionshipsTabHref(tab: CompanionshipsTab): string {
  if (tab === 'missing') return '/app/companionships?tab=missing';
  if (tab === 'find') return '/app/companionships?tab=find';
  if (tab === 'history') return '/app/companionships?tab=history';
  if (tab === 'new') return '/app/companionships?tab=new';
  return '/app/companionships';
}
