/**
 * How many people each Companion accompanies, for the Statistics chart.
 * Counts active relations only. A Companion couple is one row when both
 * spouses accompany someone; an Accompanied couple is one unit when both
 * spouses are accompanied by the row.
 */

import { formatCompanionshipCoupleOptionLabel } from '@/application/companionship-add-participant-options';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import { listCouples } from '@/application/list-couples';
import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type {
  CompanionshipRelationListItem,
  CompanionshipRelationParticipant,
} from '@/types/companionship-relation';
import type { CoupleListItem } from '@/types/couple';

/** From this many Accompanied a Companion counts as overwhelmed; 3 is still acceptable. */
export const OVERWHELMED_COMPANION_LOAD = 4;

export type AccompaniedUnit = {
  label: string;
  lastName: string;
};

export type CompanionLoad = {
  kind: 'person' | 'couple';
  label: string;
  lastName: string;
  firstName: string;
  accompanied: AccompaniedUnit[];
  load: number;
  isOverwhelmed: boolean;
};

type CompanionWithAccompanied = {
  companion: CompanionshipRelationParticipant;
  accompanied: CompanionshipRelationParticipant[];
};

function personLabel(person: CompanionshipRelationParticipant): string {
  return `${person.last_name} ${person.first_name}`;
}

function groupAccompaniedByCompanion(
  activeRelations: readonly CompanionshipRelationListItem[]
): Map<string, CompanionWithAccompanied> {
  const byCompanionId = new Map<string, CompanionWithAccompanied>();
  for (const relation of activeRelations) {
    const entry = byCompanionId.get(relation.companion.id) ?? {
      companion: relation.companion,
      accompanied: [],
    };
    entry.accompanied.push(relation.accompanied);
    byCompanionId.set(relation.companion.id, entry);
  }
  return byCompanionId;
}

function accompaniedUnitsOf(
  accompaniedPeople: readonly CompanionshipRelationParticipant[],
  couples: readonly CoupleListItem[]
): AccompaniedUnit[] {
  const peopleById = new Map(
    accompaniedPeople.map((person) => [person.id as string, person])
  );
  const units: AccompaniedUnit[] = [];

  for (const couple of couples) {
    if (peopleById.has(couple.husband.id) && peopleById.has(couple.wife.id)) {
      units.push({
        label: formatCompanionshipCoupleOptionLabel(couple),
        lastName: couple.husband.last_name,
      });
      peopleById.delete(couple.husband.id);
      peopleById.delete(couple.wife.id);
    }
  }
  for (const person of peopleById.values()) {
    units.push({ label: personLabel(person), lastName: person.last_name });
  }

  return units.sort(
    (left, right) =>
      left.lastName.localeCompare(right.lastName, 'pl') ||
      left.label.localeCompare(right.label, 'pl')
  );
}

function aCompanionLoad(
  row: Pick<CompanionLoad, 'kind' | 'label' | 'lastName' | 'firstName'>,
  accompaniedPeople: readonly CompanionshipRelationParticipant[],
  couples: readonly CoupleListItem[],
  limit: number
): CompanionLoad {
  const accompanied = accompaniedUnitsOf(accompaniedPeople, couples);
  return {
    ...row,
    accompanied,
    load: accompanied.length,
    isOverwhelmed: accompanied.length >= limit,
  };
}

function distinctPeople(
  people: readonly CompanionshipRelationParticipant[]
): CompanionshipRelationParticipant[] {
  return [...new Map(people.map((person) => [person.id as string, person])).values()];
}

export function groupCompanionLoads(
  relations: readonly CompanionshipRelationListItem[],
  couples: readonly CoupleListItem[],
  limit: number = OVERWHELMED_COMPANION_LOAD
): CompanionLoad[] {
  const activeRelations = relations.filter(
    (relation) => relation.status === 'active'
  );
  const byCompanionId = groupAccompaniedByCompanion(activeRelations);
  const loads: CompanionLoad[] = [];
  const listedAsCouple = new Set<string>();

  for (const couple of couples) {
    const husband = byCompanionId.get(couple.husband.id);
    const wife = byCompanionId.get(couple.wife.id);
    if (!husband || !wife) {
      continue;
    }
    listedAsCouple.add(couple.husband.id);
    listedAsCouple.add(couple.wife.id);
    loads.push(
      aCompanionLoad(
        {
          kind: 'couple',
          label: formatCompanionshipCoupleOptionLabel(couple),
          lastName: couple.husband.last_name,
          firstName: couple.husband.first_name,
        },
        distinctPeople([...husband.accompanied, ...wife.accompanied]),
        couples,
        limit
      )
    );
  }

  for (const [companionId, entry] of byCompanionId) {
    if (listedAsCouple.has(companionId)) {
      continue;
    }
    loads.push(
      aCompanionLoad(
        {
          kind: 'person',
          label: personLabel(entry.companion),
          lastName: entry.companion.last_name,
          firstName: entry.companion.first_name,
        },
        distinctPeople(entry.accompanied),
        couples,
        limit
      )
    );
  }

  return loads.sort(
    (left, right) =>
      right.load - left.load ||
      left.lastName.localeCompare(right.lastName, 'pl') ||
      left.firstName.localeCompare(right.firstName, 'pl')
  );
}

export async function listCompanionLoads(
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  couples: ICoupleRepository = openRegistry().getCoupleRepository()
): Promise<CompanionLoad[]> {
  const [activeRelations, registeredCouples] = await Promise.all([
    listCompanionshipRelations(relations),
    listCouples(couples),
  ]);
  return groupCompanionLoads(activeRelations, registeredCouples);
}
