import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

export interface ICompanionshipRelationRepository {
  listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]>;
}
