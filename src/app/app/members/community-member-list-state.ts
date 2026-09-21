import type { CommunityMember } from '@/types/community-member';
import {
  accompanyingReadinessLabels,
  communityEngagementLabels,
  consecratedStatusLabels,
  genderLabels,
  maritalStatusLabels,
} from './community-member-labels';

export const communityMemberListExtraFields = [
  'email',
  'phone',
  'gender',
  'marital_status',
  'consecrated_status',
  'community_engagement_status',
  'accompanying_readiness',
] as const;

export type CommunityMemberListExtraField =
  (typeof communityMemberListExtraFields)[number];

export const defaultCommunityMemberListExtraFields: CommunityMemberListExtraField[] =
  ['email'];

export const communityMemberListSortFields = [
  'last_name',
  'first_name',
  ...communityMemberListExtraFields,
] as const;

export type CommunityMemberListSortField =
  (typeof communityMemberListSortFields)[number];

export type CommunityMemberListSortDirection = 'asc' | 'desc';

export const communityMemberListFieldLabels: Record<
  CommunityMemberListSortField,
  string
> = {
  first_name: 'Imię',
  last_name: 'Nazwisko',
  email: 'E-mail',
  phone: 'Telefon',
  gender: 'Płeć',
  marital_status: 'Stan cywilny',
  consecrated_status: 'Typ osoby konsekrowanej',
  community_engagement_status: 'Zaangażowanie we wspólnocie',
  accompanying_readiness: 'Gotowość do akompaniamentu',
};

export function communityMemberThumbnail(
  member: Pick<CommunityMember, 'profile_picture'>
): string | null {
  return member.profile_picture;
}

export function communityMemberName(member: CommunityMember): string {
  return `${member.first_name} ${member.last_name}`;
}

export function communityMemberFieldText(
  member: CommunityMember,
  field: CommunityMemberListExtraField
): string {
  if (field === 'gender') {
    return member.gender ? genderLabels[member.gender] : '';
  }
  if (field === 'marital_status') {
    return member.marital_status ? maritalStatusLabels[member.marital_status] : '';
  }
  if (field === 'consecrated_status') {
    return member.consecrated_status
      ? consecratedStatusLabels[member.consecrated_status]
      : '';
  }
  if (field === 'community_engagement_status') {
    return member.community_engagement_status
      ? communityEngagementLabels[member.community_engagement_status]
      : '';
  }
  if (field === 'accompanying_readiness') {
    return member.accompanying_readiness
      ? accompanyingReadinessLabels[member.accompanying_readiness]
      : '';
  }

  return member[field] ?? '';
}

function communityMemberSortKey(
  member: CommunityMember,
  field: CommunityMemberListSortField
): string {
  if (field === 'first_name') {
    return member.first_name;
  }
  if (field === 'last_name') {
    return member.last_name;
  }
  return communityMemberFieldText(member, field);
}

export function compareCommunityMembers(
  left: CommunityMember,
  right: CommunityMember,
  sortField: CommunityMemberListSortField,
  direction: CommunityMemberListSortDirection = 'asc'
): number {
  const leftKey = communityMemberSortKey(left, sortField);
  const rightKey = communityMemberSortKey(right, sortField);

  if (leftKey === '' && rightKey !== '') {
    return 1;
  }
  if (rightKey === '' && leftKey !== '') {
    return -1;
  }

  const byField = leftKey.localeCompare(rightKey, 'pl');
  const directed = direction === 'desc' ? -byField : byField;
  if (directed !== 0) {
    return directed;
  }

  return communityMemberName(left).localeCompare(communityMemberName(right), 'pl');
}

export function sortCommunityMembers(
  members: CommunityMember[],
  sortField: CommunityMemberListSortField,
  direction: CommunityMemberListSortDirection = 'asc'
): CommunityMember[] {
  return [...members].sort((left, right) =>
    compareCommunityMembers(left, right, sortField, direction)
  );
}

export function nextCommunityMemberListSort(
  currentField: CommunityMemberListSortField,
  currentDirection: CommunityMemberListSortDirection,
  nextField: CommunityMemberListSortField
): {
  sortField: CommunityMemberListSortField;
  sortDirection: CommunityMemberListSortDirection;
} {
  if (currentField === nextField) {
    return {
      sortField: currentField,
      sortDirection: currentDirection === 'asc' ? 'desc' : 'asc',
    };
  }

  return { sortField: nextField, sortDirection: 'asc' };
}

export function toggleCommunityMemberListExtraField(
  extras: CommunityMemberListExtraField[],
  field: CommunityMemberListExtraField
): CommunityMemberListExtraField[] {
  if (extras.includes(field)) {
    return extras.filter((extra) => extra !== field);
  }
  return [...extras, field];
}
