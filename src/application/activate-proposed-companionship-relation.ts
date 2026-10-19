/**
 * Activates a chosen Find Companion proposal and drops leftover proposals.
 * Archives any current active relation for the Accompanied (change-companion path).
 */

import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  ProposedCompanionshipNotFound,
  isProposedCompanionshipNotFound,
} from '@/application/companionship-refusals';

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
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'activate a proposed companionship',
      failedWhile: 'activating a proposed companionship',
    });
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
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'activate a proposed companionship',
      failedWhile: 'activating a proposed companionship',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
