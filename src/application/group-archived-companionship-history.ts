/**
 * Collapses archived husband→husband + wife→wife rows into one History display
 * row when both sides are registered couples today and the rows share dates.
 */

import { formatCompanionshipCoupleOptionLabel } from '@/application/companionship-add-participant-options';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import type { CoupleListItem } from '@/types/couple';

export type ArchivedCompanionshipHistoryPersonRow = {
  kind: 'person';
  relation: CompanionshipRelationListItem;
};

export type ArchivedCompanionshipHistoryCoupleRow = {
  kind: 'couple';
  accompaniedLabel: string;
  companionLabel: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  husbandRelationId: string;
  wifeRelationId: string;
};

export type ArchivedCompanionshipHistoryRow =
  | ArchivedCompanionshipHistoryPersonRow
  | ArchivedCompanionshipHistoryCoupleRow;

function sameOptionalDate(
  left: string | null,
  right: string | null
): boolean {
  return left === right;
}

function coupleBySpouseId(
  couples: readonly CoupleListItem[]
): Map<string, CoupleListItem> {
  const bySpouse = new Map<string, CoupleListItem>();
  for (const couple of couples) {
    bySpouse.set(couple.husband.id, couple);
    bySpouse.set(couple.wife.id, couple);
  }
  return bySpouse;
}

function archivedRelationsByAccompaniedId(
  relations: readonly CompanionshipRelationListItem[]
): Map<string, CompanionshipRelationListItem[]> {
  const byAccompanied = new Map<string, CompanionshipRelationListItem[]>();
  for (const relation of relations) {
    const existing = byAccompanied.get(relation.accompanied.id) ?? [];
    existing.push(relation);
    byAccompanied.set(relation.accompanied.id, existing);
  }
  return byAccompanied;
}

function findMatchingSpouseArchivedRelation(
  spouseRelations: readonly CompanionshipRelationListItem[] | undefined,
  seed: CompanionshipRelationListItem,
  usedRelationIds: ReadonlySet<string>
): CompanionshipRelationListItem | undefined {
  if (!spouseRelations) {
    return undefined;
  }

  return spouseRelations.find(
    (relation) =>
      !usedRelationIds.has(relation.id) &&
      sameOptionalDate(relation.start_date, seed.start_date) &&
      sameOptionalDate(relation.end_date, seed.end_date)
  );
}

/**
 * Groups archived companionship list items for Historia: couple↔couple when
 * both accompanied and both companions are registered couples and rows share
 * start_date / end_date; otherwise one person row each.
 */
export function groupArchivedCompanionshipHistory(
  archivedRelations: readonly CompanionshipRelationListItem[],
  couples: readonly CoupleListItem[]
): ArchivedCompanionshipHistoryRow[] {
  const couplesBySpouse = coupleBySpouseId(couples);
  const relationsByAccompanied =
    archivedRelationsByAccompaniedId(archivedRelations);
  const usedRelationIds = new Set<string>();
  const rows: ArchivedCompanionshipHistoryRow[] = [];

  for (const relation of archivedRelations) {
    if (usedRelationIds.has(relation.id)) {
      continue;
    }

    const accompaniedCouple = couplesBySpouse.get(relation.accompanied.id);
    if (!accompaniedCouple) {
      usedRelationIds.add(relation.id);
      rows.push({ kind: 'person', relation });
      continue;
    }

    const isHusbandRow =
      relation.accompanied.id === accompaniedCouple.husband.id;
    const spouseId = isHusbandRow
      ? accompaniedCouple.wife.id
      : accompaniedCouple.husband.id;
    const spouseRelation = findMatchingSpouseArchivedRelation(
      relationsByAccompanied.get(spouseId),
      relation,
      usedRelationIds
    );

    if (!spouseRelation) {
      usedRelationIds.add(relation.id);
      rows.push({ kind: 'person', relation });
      continue;
    }

    const husbandRelation = isHusbandRow ? relation : spouseRelation;
    const wifeRelation = isHusbandRow ? spouseRelation : relation;

    if (
      husbandRelation.accompanied.id !== accompaniedCouple.husband.id ||
      wifeRelation.accompanied.id !== accompaniedCouple.wife.id
    ) {
      usedRelationIds.add(relation.id);
      rows.push({ kind: 'person', relation });
      continue;
    }

    const companionCouple = couplesBySpouse.get(husbandRelation.companion.id);
    if (
      !companionCouple ||
      companionCouple.husband.id !== husbandRelation.companion.id ||
      companionCouple.wife.id !== wifeRelation.companion.id
    ) {
      usedRelationIds.add(relation.id);
      rows.push({ kind: 'person', relation });
      continue;
    }

    usedRelationIds.add(husbandRelation.id);
    usedRelationIds.add(wifeRelation.id);
    rows.push({
      kind: 'couple',
      accompaniedLabel: formatCompanionshipCoupleOptionLabel(accompaniedCouple),
      companionLabel: formatCompanionshipCoupleOptionLabel(companionCouple),
      start_date: husbandRelation.start_date,
      end_date: husbandRelation.end_date,
      notes: husbandRelation.notes ?? wifeRelation.notes,
      husbandRelationId: husbandRelation.id,
      wifeRelationId: wifeRelation.id,
    });
  }

  return rows;
}
