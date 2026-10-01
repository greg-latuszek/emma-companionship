export const companionshipsTabs = ['created', 'missing'] as const;
export type CompanionshipsTab = (typeof companionshipsTabs)[number];

export const companionshipsTabTitles: Record<CompanionshipsTab, string> = {
  created: 'Utworzone Akompaniamenty',
  missing: 'Brakujące Akompaniamenty',
};

export function companionshipsTabFrom(
  tab: string | string[] | undefined
): CompanionshipsTab {
  return tab === 'missing' ? 'missing' : 'created';
}

export function companionshipsTabHref(tab: CompanionshipsTab): string {
  return tab === 'missing'
    ? '/app/companionships?tab=missing'
    : '/app/companionships';
}
