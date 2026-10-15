/**
 * Visible detail fields on Find Companion — same set as Members (Członkowie).
 */

import {
  communityMemberFieldText,
  communityMemberListExtraFields,
  communityMemberListExtraFieldsFromStoredValue,
  communityMemberListFieldLabels,
  defaultCommunityMemberListExtraFields,
  toggleCommunityMemberListExtraField,
  type CommunityMemberListExtraField,
} from '@/app/app/members/community-member-list-state';
import type { CommunityMember } from '@/types/community-member';
import type { CoupleListItem } from '@/types/couple';
import type { CompanionshipParticipantOption } from '@/application/companionship-add-participant-options';

export type CompanionshipFindVisibleField = CommunityMemberListExtraField;

export const companionshipFindVisibleFields = communityMemberListExtraFields;
export const companionshipFindVisibleFieldLabels = communityMemberListFieldLabels;
export const defaultCompanionshipFindVisibleFields =
  defaultCommunityMemberListExtraFields;
export const toggleCompanionshipFindVisibleField =
  toggleCommunityMemberListExtraField;
export const companionshipFindParticipantFieldText = communityMemberFieldText;

export const companionshipFindVisibleFieldsStorageKey =
  'emma.companionship-find.visible-fields';

export function readStoredCompanionshipFindVisibleFields(
  storage: Pick<Storage, 'getItem'> | null
): CompanionshipFindVisibleField[] {
  if (!storage) {
    return defaultCompanionshipFindVisibleFields;
  }
  return communityMemberListExtraFieldsFromStoredValue(
    storage.getItem(companionshipFindVisibleFieldsStorageKey)
  );
}

export function storeCompanionshipFindVisibleFields(
  fields: CompanionshipFindVisibleField[],
  storage: Pick<Storage, 'setItem'> | null
): void {
  storage?.setItem(
    companionshipFindVisibleFieldsStorageKey,
    JSON.stringify(fields)
  );
}

export type CompanionshipFindDetailPerson = {
  /** Fold title shown above the visible fields. */
  title: 'Detale osoby' | 'Detale męża' | 'Detale żony';
  member: CommunityMember;
};

export function companionshipFindDetailPeople(
  option: CompanionshipParticipantOption | undefined,
  members: readonly CommunityMember[],
  couples: readonly CoupleListItem[]
): CompanionshipFindDetailPerson[] {
  if (!option) {
    return [];
  }
  if (option.kind === 'person') {
    const member = members.find((candidate) => candidate.id === option.id);
    return member ? [{ title: 'Detale osoby', member }] : [];
  }
  const couple = couples.find((candidate) => candidate.id === option.id);
  if (!couple) {
    return [];
  }
  const people: CompanionshipFindDetailPerson[] = [];
  const husband = members.find(
    (candidate) => candidate.id === couple.husband.id
  );
  if (husband) {
    people.push({ title: 'Detale męża', member: husband });
  }
  const wife = members.find((candidate) => candidate.id === couple.wife.id);
  if (wife) {
    people.push({ title: 'Detale żony', member: wife });
  }
  return people;
}
