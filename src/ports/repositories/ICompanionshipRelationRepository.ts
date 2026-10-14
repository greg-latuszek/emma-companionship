import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
  PersonWithoutCompanion,
} from '@/types/companionship-relation';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';

export interface ICompanionshipRelationRepository {
  /** Active relations only (Created Companionships). Archived history is a later tab. */
  listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]>;
  listPeopleWithoutCompanion(): Promise<PersonWithoutCompanion[]>;
  findCompanionshipRelationById(
    id: string
  ): Promise<CompanionshipRelation | null>;
  findActiveCompanionshipRelationByAccompaniedId(
    accompaniedId: string
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
  /** In-place update of both spouse rows (dates/notes) in one transaction. */
  updateCompanionshipRelationPair(
    husbandRelationId: string,
    wifeRelationId: string,
    husbandWrite: CompanionshipRelationWriteWithDefaults,
    wifeWrite: CompanionshipRelationWriteWithDefaults
  ): Promise<[CompanionshipRelation, CompanionshipRelation]>;
  /**
   * Archive the existing active row (end_date = today) and insert the
   * replacement in one transaction when the Companion changes.
   */
  archiveCompanionshipRelationAndAddReplacement(
    existingId: string,
    replacement: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation>;
  /**
   * Archive both spouses' active rows and insert the new husband/wife pair
   * in one transaction when the Companion couple changes.
   */
  archiveCompanionshipRelationPairAndAddReplacement(
    husbandRelationId: string,
    wifeRelationId: string,
    husbandReplacement: CompanionshipRelationWriteWithDefaults,
    wifeReplacement: CompanionshipRelationWriteWithDefaults
  ): Promise<[CompanionshipRelation, CompanionshipRelation]>;
  deleteCompanionshipRelation(id: string): Promise<void>;
}
