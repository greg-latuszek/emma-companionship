import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export async function findCompanionshipRelation(
  id: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<CompanionshipRelation | null> {
  try {
    return await relations.findCompanionshipRelationById(id);
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'find a companionship relation',
      failedWhile: 'finding a companionship relation',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
