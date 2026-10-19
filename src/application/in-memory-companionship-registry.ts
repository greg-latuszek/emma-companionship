import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CommunityMember, Gender } from '@/types/community-member';
import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
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

/**
 * Test double for the companionship write scenarios.
 * Rows live on `relations`. The scenario seeds members, couples, and who is
 * still waiting; this store does not infer the waiting list from rows.
 */
export class InMemoryCompanionshipRegistry
  implements ICompanionshipRelationRepository, ICommunityMemberRepository, ICoupleRepository
{
  readonly relations: CompanionshipRelation[] = [];

  private nextRelationNumber = 1;
  private readonly members = new Map<string, Gender | null>();
  private readonly couples = new Map<string, Couple>();
  private readonly peopleWithoutCompanion: string[];

  constructor(
    seed: {
      members?: SeededCommunityMember[];
      couples?: SeededCouple[];
      peopleWithoutCompanion?: string[];
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
  }

  async listPeopleWithoutCompanion(): Promise<PersonWithoutCompanion[]> {
    return this.peopleWithoutCompanion.map(personWithoutCompanion);
  }

  async findCompanionshipRelationById(): Promise<CompanionshipRelation | null> {
    scenarioDoesNotUse('findCompanionshipRelationById');
  }

  async findActiveCompanionshipRelationByAccompaniedId(): Promise<CompanionshipRelation | null> {
    scenarioDoesNotUse('findActiveCompanionshipRelationByAccompaniedId');
  }

  async addCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    return this.rememberCompanionshipRelation(write);
  }

  async addCompanionshipRelationPair(
    husbandWrite: CompanionshipRelationWriteWithDefaults,
    wifeWrite: CompanionshipRelationWriteWithDefaults
  ): Promise<[CompanionshipRelation, CompanionshipRelation]> {
    return [
      this.rememberCompanionshipRelation(husbandWrite),
      this.rememberCompanionshipRelation(wifeWrite),
    ];
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

  listProposedCompanionshipRelationsForAccompanied(): Promise<CompanionshipRelationListItem[]> {
    scenarioDoesNotUse('listProposedCompanionshipRelationsForAccompanied');
  }

  updateCompanionshipRelation(): Promise<CompanionshipRelation> {
    scenarioDoesNotUse('updateCompanionshipRelation');
  }

  updateCompanionshipRelationPair(): Promise<[CompanionshipRelation, CompanionshipRelation]> {
    scenarioDoesNotUse('updateCompanionshipRelationPair');
  }

  archiveCompanionshipRelationAndAddReplacement(): Promise<CompanionshipRelation> {
    scenarioDoesNotUse('archiveCompanionshipRelationAndAddReplacement');
  }

  archiveCompanionshipRelationPairAndAddReplacement(): Promise<
    [CompanionshipRelation, CompanionshipRelation]
  > {
    scenarioDoesNotUse('archiveCompanionshipRelationPairAndAddReplacement');
  }

  deleteProposedCompanionshipRelation(): Promise<void> {
    scenarioDoesNotUse('deleteProposedCompanionshipRelation');
  }

  deleteProposedCompanionshipRelationPair(): Promise<void> {
    scenarioDoesNotUse('deleteProposedCompanionshipRelationPair');
  }

  activateProposedCompanionshipRelation(): Promise<CompanionshipRelation> {
    scenarioDoesNotUse('activateProposedCompanionshipRelation');
  }

  activateProposedCompanionshipRelationPair(): Promise<
    [CompanionshipRelation, CompanionshipRelation]
  > {
    scenarioDoesNotUse('activateProposedCompanionshipRelationPair');
  }

  deleteCompanionshipRelation(): Promise<void> {
    scenarioDoesNotUse('deleteCompanionshipRelation');
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
  return {
    id: MemberId(id),
    first_name: '',
    last_name: '',
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}
