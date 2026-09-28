import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
} from '@/types/companionship-relation';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';

export interface ICompanionshipRelationRepository {
  listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]>;
  addCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation>;
}
