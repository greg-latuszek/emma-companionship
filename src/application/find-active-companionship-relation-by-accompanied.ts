import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelation } from '@/types/companionship-relation';

export async function findActiveCompanionshipRelationByAccompaniedId(
  accompaniedId: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<CompanionshipRelation | null> {
  return relations.findActiveCompanionshipRelationByAccompaniedId(accompaniedId);
}
