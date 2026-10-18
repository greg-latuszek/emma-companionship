import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelation } from '@/types/companionship-relation';

function currentCompanionshipRelationRepository(): ICompanionshipRelationRepository {
  startDatabasePool();
  return getRepositoryContainer().getCompanionshipRelationRepository();
}

export async function findActiveCompanionshipRelationByAccompaniedId(
  accompaniedId: string,
  relations: ICompanionshipRelationRepository = currentCompanionshipRelationRepository()
): Promise<CompanionshipRelation | null> {
  return relations.findActiveCompanionshipRelationByAccompaniedId(accompaniedId);
}
