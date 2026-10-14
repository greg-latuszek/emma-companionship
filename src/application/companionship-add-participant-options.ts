/**
 * Participant options for Add Companionship: singles and eligible couples.
 * Couples appear only when neither spouse has an active accompanied relation;
 * paired people never appear as single Accompanied rows.
 */

import type { CommunityMember, Gender } from '@/types/community-member';
import type { CoupleListItem } from '@/types/couple';

export type CompanionshipPersonOption = {
  kind: 'person';
  id: string;
  label: string;
  gender: Gender | null;
};

export type CompanionshipCoupleOption = {
  kind: 'couple';
  id: string;
  label: string;
};

export type CompanionshipParticipantOption =
  | CompanionshipPersonOption
  | CompanionshipCoupleOption;

export function formatCompanionshipPersonOptionLabel(
  member: Pick<CommunityMember, 'first_name' | 'last_name'>
): string {
  return `${member.last_name}, ${member.first_name}`;
}

export function formatCompanionshipCoupleOptionLabel(
  couple: CoupleListItem
): string {
  return `${couple.husband.last_name}, ${couple.husband.first_name} + ${couple.wife.first_name}`;
}

function memberIdsInCouples(couples: readonly CoupleListItem[]): Set<string> {
  const ids = new Set<string>();
  for (const couple of couples) {
    ids.add(couple.husband.id);
    ids.add(couple.wife.id);
  }
  return ids;
}

function sortCompanionshipParticipantOptions(
  options: CompanionshipParticipantOption[]
): CompanionshipParticipantOption[] {
  return [...options].sort((left, right) =>
    left.label.localeCompare(right.label, 'pl')
  );
}

/**
 * Akompaniowany choices: Brakujące singles not in a couple, plus couples where
 * both spouses still need a companion.
 */
export function proposeAccompaniedCompanionshipOptions(
  peopleWithoutCompanion: ReadonlyArray<{ id: string }>,
  members: readonly CommunityMember[],
  couples: readonly CoupleListItem[]
): CompanionshipParticipantOption[] {
  const waitingIds = new Set(
    peopleWithoutCompanion.map((person) => person.id as string)
  );
  const pairedIds = memberIdsInCouples(couples);
  const membersById = new Map(
    members.map((member) => [member.id as string, member])
  );

  const personOptions: CompanionshipPersonOption[] = [];
  for (const waitingId of waitingIds) {
    if (pairedIds.has(waitingId)) {
      continue;
    }
    const member = membersById.get(waitingId);
    if (!member) {
      continue;
    }
    personOptions.push({
      kind: 'person',
      id: member.id,
      label: formatCompanionshipPersonOptionLabel(member),
      gender: member.gender,
    });
  }

  const coupleOptions: CompanionshipCoupleOption[] = [];
  for (const couple of couples) {
    if (
      !waitingIds.has(couple.husband.id) ||
      !waitingIds.has(couple.wife.id)
    ) {
      continue;
    }
    coupleOptions.push({
      kind: 'couple',
      id: couple.id,
      label: formatCompanionshipCoupleOptionLabel(couple),
    });
  }

  return sortCompanionshipParticipantOptions([
    ...personOptions,
    ...coupleOptions,
  ]);
}

function findCompanionshipParticipantOption(
  options: readonly CompanionshipParticipantOption[],
  id: string
): CompanionshipParticipantOption | undefined {
  return options.find((option) => option.id === id);
}

/**
 * Akompaniator choices after Akompaniowany is known.
 * Person → same-gender people from the full registry (keep current selection).
 * Couple → every other couple.
 */
export function proposeCompanionCompanionshipOptions(
  accompanied: CompanionshipParticipantOption | undefined,
  members: readonly CommunityMember[],
  couples: readonly CoupleListItem[],
  selectedCompanionId: string = ''
): CompanionshipParticipantOption[] {
  if (accompanied?.kind === 'couple') {
    const coupleOptions = couples
      .filter((couple) => couple.id !== accompanied.id)
      .map((couple) => ({
        kind: 'couple' as const,
        id: couple.id,
        label: formatCompanionshipCoupleOptionLabel(couple),
      }));
    return sortCompanionshipParticipantOptions(coupleOptions);
  }

  const partnerGender =
    accompanied?.kind === 'person' ? accompanied.gender : null;

  const personOptions: CompanionshipPersonOption[] = [];
  for (const member of members) {
    const isSelected = member.id === selectedCompanionId;
    if (
      partnerGender != null &&
      member.gender !== partnerGender &&
      !isSelected
    ) {
      continue;
    }
    personOptions.push({
      kind: 'person',
      id: member.id,
      label: formatCompanionshipPersonOptionLabel(member),
      gender: member.gender,
    });
  }

  return sortCompanionshipParticipantOptions(personOptions);
}

export function findAccompaniedCompanionshipOption(
  accompaniedOptions: readonly CompanionshipParticipantOption[],
  accompaniedId: string
): CompanionshipParticipantOption | undefined {
  return findCompanionshipParticipantOption(accompaniedOptions, accompaniedId);
}
