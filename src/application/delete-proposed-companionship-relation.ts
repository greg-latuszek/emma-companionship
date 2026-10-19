/**
 * Removes a Find Companion proposal (person or couple pair). Only proposed rows.
 */

import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export async function deleteProposedCompanionshipRelation(
  relationId: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<void> {
  try {
    await relations.deleteProposedCompanionshipRelation(relationId);
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'delete a proposed companionship',
      failedWhile: 'deleting a proposed companionship',
    });
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
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'delete a proposed companionship',
      failedWhile: 'deleting a proposed companionship',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
