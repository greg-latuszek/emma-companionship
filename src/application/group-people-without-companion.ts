/**
 * Groups Missing into couple rows (both spouses waiting) or single people
 * not in the couple registry — same eligibility as Add Companion options.
 */

import { formatCompanionshipCoupleOptionLabel } from '@/application/companionship-add-participant-options';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';
import type { CoupleListItem } from '@/types/couple';

export type PersonWithoutCompanionPersonRow = {
  kind: 'person';
  person: PersonWithoutCompanion;
  label: string;
};

export type PersonWithoutCompanionCoupleRow = {
  kind: 'couple';
  couple: CoupleListItem;
  label: string;
};

export type PersonWithoutCompanionRow =
  | PersonWithoutCompanionPersonRow
  | PersonWithoutCompanionCoupleRow;

function personWithoutCompanionLabel(person: PersonWithoutCompanion): string {
  return `${person.last_name} ${person.first_name}`;
}

/**
 * Collapses waiting people into couple / person rows for the Missing tab.
 */
export function groupPeopleWithoutCompanion(
  peopleWithoutCompanion: readonly PersonWithoutCompanion[],
  couples: readonly CoupleListItem[]
): PersonWithoutCompanionRow[] {
  const waitingById = new Map(
    peopleWithoutCompanion.map((person) => [person.id as string, person])
  );
  const pairedIds = new Set<string>();
  for (const couple of couples) {
    pairedIds.add(couple.husband.id);
    pairedIds.add(couple.wife.id);
  }

  const rows: PersonWithoutCompanionRow[] = [];

  for (const couple of couples) {
    const husbandWaiting = waitingById.has(couple.husband.id);
    const wifeWaiting = waitingById.has(couple.wife.id);
    if (!husbandWaiting || !wifeWaiting) {
      continue;
    }
    rows.push({
      kind: 'couple',
      couple,
      label: formatCompanionshipCoupleOptionLabel(couple),
    });
  }

  for (const person of peopleWithoutCompanion) {
    if (pairedIds.has(person.id)) {
      continue;
    }
    rows.push({
      kind: 'person',
      person,
      label: personWithoutCompanionLabel(person),
    });
  }

  return rows.sort((left, right) =>
    left.label.localeCompare(right.label, 'pl')
  );
}
