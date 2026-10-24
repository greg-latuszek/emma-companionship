/**
 * Visible detail fields on Find Companion — same set as Members (Community Members).
 */

import {
  communityMemberFieldText,
  communityMemberListExtraFields,
  communityMemberListExtraFieldsFromStoredValue,
  communityMemberListFieldLabelKeys,
  defaultCommunityMemberListExtraFields,
  toggleCommunityMemberListExtraField,
  type CommunityMemberListExtraField,
} from '@/app/app/members/community-member-list-state';
import type { CommunityMember } from '@/types/community-member';
import type { CoupleListItem } from '@/types/couple';
import type { CompanionshipParticipantOption } from '@/application/companionship-add-participant-options';

export type CompanionshipFindVisibleField = CommunityMemberListExtraField;

export const companionshipFindVisibleFields = communityMemberListExtraFields;
export const companionshipFindVisibleFieldLabelKeys =
  communityMemberListFieldLabelKeys;
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
  titleKey:
    | 'companionships.find.detail.person'
    | 'companionships.find.detail.husband'
    | 'companionships.find.detail.wife';
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
    return member ? [{ titleKey: 'companionships.find.detail.person', member }] : [];
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
    people.push({ titleKey: 'companionships.find.detail.husband', member: husband });
  }
  const wife = members.find((candidate) => candidate.id === couple.wife.id);
  if (wife) {
    people.push({ titleKey: 'companionships.find.detail.wife', member: wife });
  }
  return people;
}

export const companionshipFindDetailFoldsStorageKey =
  'emma.companionship-find.detail-folds';

const defaultCompanionshipFindDetailFoldOpen = true;

function companionshipFindDetailFoldsFromStoredValue(
  stored: string | null
): Record<string, boolean> {
  if (stored == null) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const folds: Record<string, boolean> = {};
    for (const [foldKey, open] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (typeof open === 'boolean') {
        folds[foldKey] = open;
      }
    }
    return folds;
  } catch {
    return {};
  }
}

export function readCompanionshipFindDetailFoldOpen(
  foldKey: string,
  storage: Pick<Storage, 'getItem'> | null
): boolean {
  if (!storage) {
    return defaultCompanionshipFindDetailFoldOpen;
  }
  const folds = companionshipFindDetailFoldsFromStoredValue(
    storage.getItem(companionshipFindDetailFoldsStorageKey)
  );
  return folds[foldKey] ?? defaultCompanionshipFindDetailFoldOpen;
}

export function storeCompanionshipFindDetailFoldOpen(
  foldKey: string,
  open: boolean,
  storage: Pick<Storage, 'getItem' | 'setItem'> | null
): void {
  if (!storage) {
    return;
  }
  const folds = companionshipFindDetailFoldsFromStoredValue(
    storage.getItem(companionshipFindDetailFoldsStorageKey)
  );
  folds[foldKey] = open;
  storage.setItem(
    companionshipFindDetailFoldsStorageKey,
    JSON.stringify(folds)
  );
}
