/**
 * Removes a Find Companion proposal (person or couple pair). Only proposed rows.
 */

import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

function reportFailedProposedCompanionshipDelete(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot delete a proposed companionship. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(
    '[emma] The registry failed while deleting a proposed companionship.',
    error
  );
}

export async function deleteProposedCompanionshipRelation(
  relationId: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<void> {
  try {
    await relations.deleteProposedCompanionshipRelation(relationId);
  } catch (error) {
    reportFailedProposedCompanionshipDelete(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}

export async function deleteProposedCoupleCompanionshipRelations(
  husbandRelationId: string,
  wifeRelationId: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<void> {
  try {
    await relations.deleteProposedCompanionshipRelationPair(
      husbandRelationId,
      wifeRelationId
    );
  } catch (error) {
    reportFailedProposedCompanionshipDelete(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
