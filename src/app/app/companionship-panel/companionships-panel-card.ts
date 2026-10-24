export function companionshipsPanelCard(
  missingCount: number,
  overwhelmedCount: number
): {
  href: '/app/companionships';
  titleKey: 'panel.companionships.title';
  missingCount: number;
  overwhelmedCount: number;
} {
  return {
    href: '/app/companionships',
    titleKey: 'panel.companionships.title',
    missingCount,
    overwhelmedCount,
  };
}
