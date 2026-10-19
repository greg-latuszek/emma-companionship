import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

function reportFailedCompanionshipRelationFind(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot find a companionship relation. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(
    '[emma] The registry failed while finding a companionship relation.',
    error
  );
}

export async function findCompanionshipRelation(
  id: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<CompanionshipRelation | null> {
  try {
    return await relations.findCompanionshipRelationById(id);
  } catch (error) {
    reportFailedCompanionshipRelationFind(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
