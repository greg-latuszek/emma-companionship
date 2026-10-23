export function companionshipsPanelCard(missingCount: number): {
  href: '/app/companionships';
  titleKey: 'panel.companionships.title';
  missingCount: number;
} {
  return {
    href: '/app/companionships',
    titleKey: 'panel.companionships.title',
    missingCount,
  };
}
