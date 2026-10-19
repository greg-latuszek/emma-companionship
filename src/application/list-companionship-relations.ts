import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

export async function listCompanionshipRelations(
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<CompanionshipRelationListItem[]> {
  return relations.listCompanionshipRelations();
}
