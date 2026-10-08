export const membersPageTabs = [
  'list',
  'couples',
  'build-couples',
  'new',
] as const;

export type MembersPageTab = (typeof membersPageTabs)[number];

export function membersPageTabFrom(
  tab: string | string[] | undefined
): MembersPageTab {
  if (tab === 'couples') {
    return 'couples';
  }
  if (tab === 'build-couples') {
    return 'build-couples';
  }
  if (tab === 'new') {
    return 'new';
  }
  return 'list';
}

export function membersPageTabHref(tab: MembersPageTab): string {
  switch (tab) {
    case 'couples':
      return '/app/members?tab=couples';
    case 'build-couples':
      return '/app/members?tab=build-couples';
    case 'new':
      return '/app/members?tab=new';
    default:
      return '/app/members';
  }
}
