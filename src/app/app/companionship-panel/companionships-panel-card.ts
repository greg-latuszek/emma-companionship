export function companionshipsPanelCard(missingCount: number): {
  href: '/app/companionships';
  title: 'Akompaniamenty';
  missingCount: number;
} {
  return {
    href: '/app/companionships',
    title: 'Akompaniamenty',
    missingCount,
  };
}
