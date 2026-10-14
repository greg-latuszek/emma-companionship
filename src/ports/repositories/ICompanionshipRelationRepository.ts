import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
  PersonWithoutCompanion,
} from '@/types/companionship-relation';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';

export interface ICompanionshipRelationRepository {
  listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]>;
  listPeopleWithoutCompanion(): Promise<PersonWithoutCompanion[]>;
  findCompanionshipRelationById(
    id: string
  ): Promise<CompanionshipRelation | null>;
  addCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation>;
  /** Husband→husband and wife→wife inserts in one transaction. */
  addCompanionshipRelationPair(
    husbandWrite: CompanionshipRelationWriteWithDefaults,
    wifeWrite: CompanionshipRelationWriteWithDefaults
  ): Promise<[CompanionshipRelation, CompanionshipRelation]>;
  updateCompanionshipRelation(
    id: string,
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation>;
  deleteCompanionshipRelation(id: string): Promise<void>;
}
