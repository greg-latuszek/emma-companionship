/**
 * Activates a chosen Find Companion proposal and drops leftover proposals.
 * Archives any current active relation for the Accompanied (change-companion path).
 */

import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class ProposedCompanionshipNotFound extends Error {
  constructor() {
    super('The proposed companionship was not found');
    this.name = 'ProposedCompanionshipNotFound';
  }
}

export function isProposedCompanionshipNotFound(
  error: unknown
): error is ProposedCompanionshipNotFound {
  return error instanceof ProposedCompanionshipNotFound;
}

function reportFailedProposedCompanionshipActivate(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot activate a proposed companionship. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(
    '[emma] The registry failed while activating a proposed companionship.',
    error
  );
}

export type ProposedCompanionshipActivation = {
  start_date: string | null;
  notes: string | null;
};

export async function activateProposedCompanionshipRelation(
  proposedRelationId: string,
  activation: ProposedCompanionshipActivation,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<CompanionshipRelation> {
  try {
    return await relations.activateProposedCompanionshipRelation(
      proposedRelationId,
      activation
    );
  } catch (error) {
    reportFailedProposedCompanionshipActivate(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}

export async function activateProposedCoupleCompanionshipRelations(
  husbandProposedRelationId: string,
  wifeProposedRelationId: string,
  activation: ProposedCompanionshipActivation,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<[CompanionshipRelation, CompanionshipRelation]> {
  try {
    return await relations.activateProposedCompanionshipRelationPair(
      husbandProposedRelationId,
      wifeProposedRelationId,
      activation
    );
  } catch (error) {
    reportFailedProposedCompanionshipActivate(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
