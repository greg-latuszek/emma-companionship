import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';

function currentCompanionshipRelationRepository(): ICompanionshipRelationRepository {
  startDatabasePool();
  return getRepositoryContainer().getCompanionshipRelationRepository();
}

export async function listPeopleWithoutCompanion(
  relations: ICompanionshipRelationRepository = currentCompanionshipRelationRepository()
): Promise<PersonWithoutCompanion[]> {
  return relations.listPeopleWithoutCompanion();
}
