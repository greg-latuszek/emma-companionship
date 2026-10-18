/**
 * Collapses proposed husband→husband + wife→wife rows into one Find radio
 * choice when both sides are registered couples.
 */

import {
  formatCompanionshipCoupleOptionLabel,
  formatCompanionshipPersonOptionLabel,
} from '@/application/companionship-add-participant-options';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import type { CoupleListItem } from '@/types/couple';

export type ProposedCompanionshipPersonChoice = {
  kind: 'person';
  relationId: string;
  label: string;
  companionId: string;
};

export type ProposedCompanionshipCoupleChoice = {
  kind: 'couple';
  husbandRelationId: string;
  wifeRelationId: string;
  label: string;
  companionCoupleId: string;
};

export type ProposedCompanionshipChoice =
  | ProposedCompanionshipPersonChoice
  | ProposedCompanionshipCoupleChoice;

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

function proposalsByAccompaniedId(
  proposals: readonly CompanionshipRelationListItem[]
): Map<string, CompanionshipRelationListItem[]> {
  const byAccompanied = new Map<string, CompanionshipRelationListItem[]>();
  for (const proposal of proposals) {
    const existing = byAccompanied.get(proposal.accompanied.id) ?? [];
    existing.push(proposal);
    byAccompanied.set(proposal.accompanied.id, existing);
  }
  return byAccompanied;
}

function sortProposedCompanionshipChoices(
  choices: ProposedCompanionshipChoice[]
): ProposedCompanionshipChoice[] {
  return [...choices].sort((left, right) =>
    left.label.localeCompare(right.label, 'pl')
  );
}

/**
 * Groups proposed list items for Find Companion radios: couple↔couple when
 * both accompanied and companion sides are registered couples; otherwise one
 * person radio each.
 */
export function groupProposedCompanionshipChoices(
  proposals: readonly CompanionshipRelationListItem[],
  couples: readonly CoupleListItem[]
): ProposedCompanionshipChoice[] {
  const couplesBySpouse = coupleBySpouseId(couples);
  const byAccompanied = proposalsByAccompaniedId(proposals);
  const usedRelationIds = new Set<string>();
  const choices: ProposedCompanionshipChoice[] = [];

  for (const proposal of proposals) {
    if (usedRelationIds.has(proposal.id)) {
      continue;
    }

    const accompaniedCouple = couplesBySpouse.get(proposal.accompanied.id);
    if (!accompaniedCouple) {
      usedRelationIds.add(proposal.id);
      choices.push({
        kind: 'person',
        relationId: proposal.id,
        label: formatCompanionshipPersonOptionLabel(proposal.companion),
        companionId: proposal.companion.id,
      });
      continue;
    }

    const isHusbandRow =
      proposal.accompanied.id === accompaniedCouple.husband.id;
    const spouseId = isHusbandRow
      ? accompaniedCouple.wife.id
      : accompaniedCouple.husband.id;
    const spouseProposals = byAccompanied.get(spouseId) ?? [];
    const companionCouple = couplesBySpouse.get(proposal.companion.id);
    const expectedSpouseCompanionId = companionCouple
      ? isHusbandRow
        ? companionCouple.wife.id
        : companionCouple.husband.id
      : null;

    const spouseProposal =
      expectedSpouseCompanionId === null
        ? undefined
        : spouseProposals.find(
            (candidate) =>
              !usedRelationIds.has(candidate.id) &&
              candidate.companion.id === expectedSpouseCompanionId
          );

    if (
      !companionCouple ||
      !spouseProposal ||
      (isHusbandRow &&
        companionCouple.husband.id !== proposal.companion.id) ||
      (!isHusbandRow && companionCouple.wife.id !== proposal.companion.id)
    ) {
      usedRelationIds.add(proposal.id);
      choices.push({
        kind: 'person',
        relationId: proposal.id,
        label: formatCompanionshipPersonOptionLabel(proposal.companion),
        companionId: proposal.companion.id,
      });
      continue;
    }

    const husbandProposal = isHusbandRow ? proposal : spouseProposal;
    const wifeProposal = isHusbandRow ? spouseProposal : proposal;

    usedRelationIds.add(husbandProposal.id);
    usedRelationIds.add(wifeProposal.id);
    choices.push({
      kind: 'couple',
      husbandRelationId: husbandProposal.id,
      wifeRelationId: wifeProposal.id,
      label: formatCompanionshipCoupleOptionLabel(companionCouple),
      companionCoupleId: companionCouple.id,
    });
  }

  return sortProposedCompanionshipChoices(choices);
}
