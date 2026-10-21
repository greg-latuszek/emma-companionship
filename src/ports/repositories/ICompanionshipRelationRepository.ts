import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
  PersonWithoutCompanion,
} from '@/types/companionship-relation';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';

export interface ICompanionshipRelationRepository {
  /** Active relations only (Created Companionships). */
  listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]>;
  /** Archived relations only (Companionship History). */
  listArchivedCompanionshipRelations(): Promise<CompanionshipRelationListItem[]>;
  /**
   * Proposed drafts for Find Companion (one or more accompanied ids —
   * pass both spouses for a couple).
   */
  listProposedCompanionshipRelationsForAccompanied(
    accompaniedIds: string[]
  ): Promise<CompanionshipRelationListItem[]>;
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
  updateCompanionshipRelation(
    id: string,
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation>;
  /** Archive one active row (end_date = today); refuses a row that is not active. */
  archiveActiveCompanionshipRelation(id: string): Promise<void>;
  /** Delete only when status is proposed (Find Companion remove). */
  deleteProposedCompanionshipRelation(id: string): Promise<void>;
  /**
   * Activate one proposed row: archive any current active for that accompanied,
   * set chosen to active with start_date/notes, delete other proposed for them.
   */
  activateProposedCompanionshipRelation(
    proposedRelationId: string,
    activation: { start_date: string | null; notes: string | null }
  ): Promise<CompanionshipRelation>;
  /**
   * Activate husband+wife proposed pair; archive actives; drop other proposals
   * for both accompanied spouses.
   */
  activateProposedCompanionshipRelationPair(
    husbandProposedRelationId: string,
    wifeProposedRelationId: string,
    activation: { start_date: string | null; notes: string | null }
  ): Promise<[CompanionshipRelation, CompanionshipRelation]>;
  deleteCompanionshipRelation(id: string): Promise<void>;
}
