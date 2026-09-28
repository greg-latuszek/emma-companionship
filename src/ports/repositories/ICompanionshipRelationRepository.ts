import type { CompanionshipRelation } from '@/types/companionship-relation';

export interface ICompanionshipRelationRepository {
  listCompanionshipRelations(): Promise<CompanionshipRelation[]>;
}
