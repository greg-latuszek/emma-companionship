/**
 * Lists proposed companionship drafts for one Accompanied person or both spouses.
 */

import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

export async function listProposedCompanionshipRelationsForAccompanied(
  accompaniedIds: string[],
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<CompanionshipRelationListItem[]> {
  return relations.listProposedCompanionshipRelationsForAccompanied(
    accompaniedIds
  );
}
