/**
 * Detects when an edit screen should treat an active person-row as part of a
 * couple↔couple accompaniment (both spouses actively accompanied and registered).
 */

import type { CompanionshipRelation } from '@/types/companionship-relation';
import type { CoupleListItem } from '@/types/couple';
import { formatCompanionshipCoupleOptionLabel } from '@/application/companionship-add-participant-options';

export type CoupleCompanionshipEditContext = {
  accompaniedCouple: CoupleListItem;
  accompaniedLabel: string;
  husbandRelation: CompanionshipRelation;
  wifeRelation: CompanionshipRelation;
  /** Registered couple formed by the current companions, if any. */
  companionCoupleId: string | null;
};

export function findCoupleContainingMember(
  couples: readonly CoupleListItem[],
  memberId: string
): CoupleListItem | undefined {
  return couples.find(
    (couple) =>
      couple.husband.id === memberId || couple.wife.id === memberId
  );
}

export function findCoupleMatchingSpouses(
  couples: readonly CoupleListItem[],
  husbandId: string,
  wifeId: string
): CoupleListItem | undefined {
  return couples.find(
    (couple) =>
      couple.husband.id === husbandId && couple.wife.id === wifeId
  );
}

/**
 * Returns couple-edit context when the opened relation's accompanied person is
 * in a registered couple and both spouses have an active accompanied relation.
 */
export function resolveCoupleCompanionshipEditContext(
  openedRelation: CompanionshipRelation,
  couples: readonly CoupleListItem[],
  husbandActiveRelation: CompanionshipRelation | null,
  wifeActiveRelation: CompanionshipRelation | null
): CoupleCompanionshipEditContext | null {
  if (openedRelation.status !== 'active') {
    return null;
  }

  const accompaniedCouple = findCoupleContainingMember(
    couples,
    openedRelation.accompanied_id
  );
  if (!accompaniedCouple) {
    return null;
  }

  if (
    !husbandActiveRelation ||
    !wifeActiveRelation ||
    husbandActiveRelation.status !== 'active' ||
    wifeActiveRelation.status !== 'active' ||
    husbandActiveRelation.accompanied_id !== accompaniedCouple.husband.id ||
    wifeActiveRelation.accompanied_id !== accompaniedCouple.wife.id
  ) {
    return null;
  }

  const companionCouple = findCoupleMatchingSpouses(
    couples,
    husbandActiveRelation.companion_id,
    wifeActiveRelation.companion_id
  );

  return {
    accompaniedCouple,
    accompaniedLabel: formatCompanionshipCoupleOptionLabel(accompaniedCouple),
    husbandRelation: husbandActiveRelation,
    wifeRelation: wifeActiveRelation,
    companionCoupleId: companionCouple?.id ?? null,
  };
}
