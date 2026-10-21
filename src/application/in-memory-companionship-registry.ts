import { AtomicBlockAlreadyOpen, type IAtomicWork } from '@/ports/repositories/IAtomicWork';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CommunityMember, Gender } from '@/types/community-member';
import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
  CompanionshipRelationStatus,
  PersonWithoutCompanion,
} from '@/types/companionship-relation';
import type { Couple, CoupleListItem, MarriedPersonWithoutCouple } from '@/types/couple';

export type SeededCommunityMember = {
  id: string;
  gender: Gender | null;
};

export type SeededCouple = {
  id: string;
  husbandId: string;
  wifeId: string;
};

export type SeededCompanionshipRelation = {
  id: string;
  companionId: string;
  accompaniedId: string;
  status: CompanionshipRelationStatus;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
};

/**
 * Test double for the companionship write scenarios.
 * Rows live on `relations`. The scenario seeds members, couples, and who is
 * still waiting; this store does not infer the waiting list from rows.
 */
export class InMemoryCompanionshipRegistry
  implements
    ICompanionshipRelationRepository,
    ICommunityMemberRepository,
    ICoupleRepository,
    IAtomicWork
{
  readonly relations: CompanionshipRelation[] = [];

  private nextRelationNumber = 1;
  private isAtomicBlockOpen = false;
  private readonly members = new Map<string, Gender | null>();
  private readonly couples = new Map<string, Couple>();
  private readonly peopleWithoutCompanion: string[];

  constructor(
    seed: {
      members?: SeededCommunityMember[];
      couples?: SeededCouple[];
      peopleWithoutCompanion?: string[];
      relations?: SeededCompanionshipRelation[];
    } = {}
  ) {
    for (const member of seed.members ?? []) {
      this.members.set(member.id, member.gender);
    }
    for (const couple of seed.couples ?? []) {
      this.couples.set(couple.id, {
        id: couple.id,
        member1_id: MemberId(couple.husbandId),
        member2_id: MemberId(couple.wifeId),
      });
    }
    this.peopleWithoutCompanion = [...(seed.peopleWithoutCompanion ?? [])];
    for (const relation of seed.relations ?? []) {
      this.relations.push({
        id: relation.id,
        companion_id: MemberId(relation.companionId),
        accompanied_id: MemberId(relation.accompaniedId),
        status: relation.status,
        start_date: relation.startDate ?? null,
        end_date: relation.endDate ?? null,
        notes: relation.notes ?? null,
      });
      this.noteSeededRelationId(relation.id);
    }
  }

  async listPeopleWithoutCompanion(): Promise<PersonWithoutCompanion[]> {
    return this.peopleWithoutCompanion.map(personWithoutCompanion);
  }

  async findCompanionshipRelationById(id: string): Promise<CompanionshipRelation | null> {
    return this.relations.find((relation) => relation.id === id) ?? null;
  }

  async findActiveCompanionshipRelationByAccompaniedId(): Promise<CompanionshipRelation | null> {
    scenarioDoesNotUse('findActiveCompanionshipRelationByAccompaniedId');
  }

  async addCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    return this.rememberCompanionshipRelation(write);
  }

  async findCommunityMemberById(id: MemberId): Promise<CommunityMember | null> {
    if (!this.members.has(id)) {
      return null;
    }
    return communityMember(id, this.members.get(id) ?? null);
  }

  async findCoupleById(id: string): Promise<Couple | null> {
    return this.couples.get(id) ?? null;
  }

  listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]> {
    scenarioDoesNotUse('listCompanionshipRelations');
  }

  listArchivedCompanionshipRelations(): Promise<CompanionshipRelationListItem[]> {
    scenarioDoesNotUse('listArchivedCompanionshipRelations');
  }

  async listProposedCompanionshipRelationsForAccompanied(
    accompaniedIds: string[]
  ): Promise<CompanionshipRelationListItem[]> {
    if (accompaniedIds.length === 0) {
      return [];
    }
    const accompanied = new Set(accompaniedIds);
    return this.relations
      .filter(
        (relation) => relation.status === 'proposed' && accompanied.has(relation.accompanied_id)
      )
      .map((relation) => ({
        id: relation.id,
        companion: companionshipParticipant(relation.companion_id),
        accompanied: companionshipParticipant(relation.accompanied_id),
        status: relation.status,
        start_date: relation.start_date,
        end_date: relation.end_date,
        notes: relation.notes,
      }));
  }

  async updateCompanionshipRelation(
    id: string,
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    return this.replaceCompanionshipRelationFields(id, write);
  }

  async deleteProposedCompanionshipRelation(id: string): Promise<void> {
    const index = this.relations.findIndex(
      (row) => row.id === id && row.status === 'proposed'
    );
    if (index === -1) {
      throw new Error('Failed to delete proposed companionship relation');
    }
    this.relations.splice(index, 1);
  }

  activateProposedCompanionshipRelation(): Promise<CompanionshipRelation> {
    scenarioDoesNotUse('activateProposedCompanionshipRelation');
  }

  activateProposedCompanionshipRelationPair(): Promise<
    [CompanionshipRelation, CompanionshipRelation]
  > {
    scenarioDoesNotUse('activateProposedCompanionshipRelationPair');
  }

  async deleteCompanionshipRelation(id: string): Promise<void> {
    const index = this.relations.findIndex((relation) => relation.id === id);
    if (index === -1) {
      return;
    }
    this.relations.splice(index, 1);
  }

  listCommunityMembers(): Promise<CommunityMember[]> {
    scenarioDoesNotUse('listCommunityMembers');
  }

  findCommunityMemberByEmail(): Promise<CommunityMember | null> {
    scenarioDoesNotUse('findCommunityMemberByEmail');
  }

  addCommunityMember(): Promise<CommunityMember> {
    scenarioDoesNotUse('addCommunityMember');
  }

  updateCommunityMember(): Promise<CommunityMember | null> {
    scenarioDoesNotUse('updateCommunityMember');
  }

  removeCommunityMember(): Promise<boolean> {
    scenarioDoesNotUse('removeCommunityMember');
  }

  listCouples(): Promise<CoupleListItem[]> {
    scenarioDoesNotUse('listCouples');
  }

  listMarriedPeopleWithoutCouple(): Promise<MarriedPersonWithoutCouple[]> {
    scenarioDoesNotUse('listMarriedPeopleWithoutCouple');
  }

  addCouple(): Promise<Couple> {
    scenarioDoesNotUse('addCouple');
  }

  removeCouple(): Promise<void> {
    scenarioDoesNotUse('removeCouple');
  }

  private rememberCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): CompanionshipRelation {
    const relation: CompanionshipRelation = {
      id: `relation-${this.nextRelationNumber}`,
      companion_id: MemberId(write.companion_id),
      accompanied_id: MemberId(write.accompanied_id),
      status: write.status,
      start_date: write.start_date,
      end_date: write.end_date,
      notes: write.notes,
    };
    this.nextRelationNumber += 1;
    this.relations.push(relation);
    return relation;
  }

  private replaceCompanionshipRelationFields(
    id: string,
    write: CompanionshipRelationWriteWithDefaults
  ): CompanionshipRelation {
    const relation = this.relations.find((row) => row.id === id);
    if (!relation) {
      throw new Error('Failed to update companionship relation');
    }
    relation.companion_id = MemberId(write.companion_id);
    relation.accompanied_id = MemberId(write.accompanied_id);
    relation.status = write.status;
    relation.start_date = write.start_date;
    relation.end_date = write.end_date;
    relation.notes = write.notes;
    return relation;
  }

  async runAsAtomic<T>(work: () => Promise<T>): Promise<T> {
    if (this.isAtomicBlockOpen) {
      throw new AtomicBlockAlreadyOpen();
    }

    const storedRelations = this.relations.map((relation) => ({ ...relation }));
    const storedNextRelationNumber = this.nextRelationNumber;
    this.isAtomicBlockOpen = true;
    try {
      return await work();
    } catch (error) {
      this.relations.splice(0, this.relations.length, ...storedRelations);
      this.nextRelationNumber = storedNextRelationNumber;
      throw error;
    } finally {
      this.isAtomicBlockOpen = false;
    }
  }

  async archiveActiveCompanionshipRelation(id: string): Promise<void> {
    const relation = this.relations.find((row) => row.id === id);
    if (!relation || relation.status !== 'active') {
      throw new Error('Failed to archive companionship relation');
    }
    relation.status = 'archived';
    relation.end_date = new Date().toISOString().slice(0, 10);
  }

  private noteSeededRelationId(id: string): void {
    const match = /^relation-(\d+)$/.exec(id);
    if (!match) {
      return;
    }
    const number = Number(match[1]);
    if (number >= this.nextRelationNumber) {
      this.nextRelationNumber = number + 1;
    }
  }
}

function scenarioDoesNotUse(methodName: string): never {
  throw new Error(`${methodName} is not used by this scenario`);
}

function communityMember(id: string, gender: Gender | null): CommunityMember {
  return {
    id: MemberId(id),
    first_name: '',
    last_name: '',
    gender,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
    accompanying_readiness: null,
    email: null,
    phone: null,
    notes: null,
    profile_picture: null,
    hasLoginIdentity: false,
  };
}

function personWithoutCompanion(id: string): PersonWithoutCompanion {
  return companionshipParticipant(id);
}

function companionshipParticipant(id: string): PersonWithoutCompanion {
  return {
    id: MemberId(id),
    first_name: '',
    last_name: '',
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}
