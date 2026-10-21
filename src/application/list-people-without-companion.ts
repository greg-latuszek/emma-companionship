import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';

export async function listPeopleWithoutCompanion(
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<PersonWithoutCompanion[]> {
  return relations.listPeopleWithoutCompanion();
}
