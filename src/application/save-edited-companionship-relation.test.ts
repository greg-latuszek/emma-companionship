import { describe, expect, it, vi } from 'vitest';
import {
  saveEditedCompanionshipRelation,
  CompanionAndAccompaniedAreSamePerson,
  CompanionshipRelationNotFound,
} from '@/application/save-edited-companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { CompanionshipRelation } from '@/types/companionship-relation';

function aWrite(
  overrides: Partial<CompanionshipRelationWrite> = {}
): CompanionshipRelationWrite {
  return {
    companion_id: '550e8400-e29b-41d4-a716-446655440010',
    accompanied_id: '550e8400-e29b-41d4-a716-446655440020',
    status: undefined,
    start_date: '2024-06-01',
    end_date: null,
    notes: 'ok',
    ...overrides,
  };
}

function aRelation(
  overrides: Partial<CompanionshipRelation> = {}
): CompanionshipRelation {
  return {
    id: 'relation-1',
    companion_id: MemberId('550e8400-e29b-41d4-a716-446655440010'),
    accompanied_id: MemberId('550e8400-e29b-41d4-a716-446655440020'),
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aMember(overrides: Partial<CommunityMember> = {}): CommunityMember {
  return {
    id: MemberId('550e8400-e29b-41d4-a716-446655440010'),
    first_name: 'Ada',
    last_name: 'Lovelace',
    gender: 'female',
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
    accompanying_readiness: 'Not Candidate',
    email: null,
    phone: null,
    notes: null,
    profile_picture: null,
    hasLoginIdentity: false,
    ...overrides,
  };
}

function aRelationsRepo(
  stubs: Partial<ICompanionshipRelationRepository> = {}
): ICompanionshipRelationRepository {
  return {
    listCompanionshipRelations: vi.fn(),
    listArchivedCompanionshipRelations: vi.fn(),
    listProposedCompanionshipRelationsForAccompanied: vi.fn(),
    deleteProposedCompanionshipRelation: vi.fn(),
    deleteProposedCompanionshipRelationPair: vi.fn(),
    activateProposedCompanionshipRelation: vi.fn(),
    activateProposedCompanionshipRelationPair: vi.fn(),
    listPeopleWithoutCompanion: vi.fn(),
    findCompanionshipRelationById: vi.fn().mockResolvedValue(aRelation()),
    findActiveCompanionshipRelationByAccompaniedId: vi.fn(),
    addCompanionshipRelation: vi.fn(),
    addCompanionshipRelationPair: vi.fn(),
    updateCompanionshipRelation: vi.fn().mockResolvedValue(aRelation()),
    updateCompanionshipRelationPair: vi.fn(),
    archiveCompanionshipRelationAndAddReplacement: vi
      .fn()
      .mockResolvedValue(aRelation({ id: 'relation-2' })),
    archiveCompanionshipRelationPairAndAddReplacement: vi.fn(),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

function aMembersRepo(
  stubs: Partial<ICommunityMemberRepository> = {}
): ICommunityMemberRepository {
  return {
    listCommunityMembers: vi.fn(),
    findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) =>
      aMember({ id, gender: 'female' })
    ),
    findCommunityMemberByEmail: vi.fn(),
    addCommunityMember: vi.fn(),
    updateCommunityMember: vi.fn(),
    removeCommunityMember: vi.fn(),
    ...stubs,
  };
}

describe('saveEditedCompanionshipRelation', () => {
  it('saveEditedCompanionshipRelation updates the active row in place when the Companion stays the same', async () => {
    const relations = aRelationsRepo();
    const members = aMembersRepo();

    await saveEditedCompanionshipRelation(
      'relation-1',
      aWrite({ notes: 'works well' }),
      relations,
      members
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      'relation-1',
      expect.objectContaining({
        companion_id: '550e8400-e29b-41d4-a716-446655440010',
        notes: 'works well',
        status: 'active',
      })
    );
    expect(
      relations.archiveCompanionshipRelationAndAddReplacement
    ).not.toHaveBeenCalled();
  });

  it('saveEditedCompanionshipRelation archives the active row and adds a replacement when the Companion changes', async () => {
    const relations = aRelationsRepo();
    const members = aMembersRepo();
    const newCompanion = '550e8400-e29b-41d4-a716-446655440099';

    await saveEditedCompanionshipRelation(
      'relation-1',
      aWrite({ companion_id: newCompanion }),
      relations,
      members
    );

    expect(
      relations.archiveCompanionshipRelationAndAddReplacement
    ).toHaveBeenCalledWith(
      'relation-1',
      expect.objectContaining({
        companion_id: newCompanion,
        accompanied_id: '550e8400-e29b-41d4-a716-446655440020',
        status: 'active',
      })
    );
    expect(relations.updateCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('saveEditedCompanionshipRelation refuses when the relation is missing or not active', async () => {
    const relations = aRelationsRepo({
      findCompanionshipRelationById: vi.fn().mockResolvedValue(
        aRelation({ status: 'archived' })
      ),
    });

    await expect(
      saveEditedCompanionshipRelation('relation-1', aWrite(), relations, aMembersRepo())
    ).rejects.toBeInstanceOf(CompanionshipRelationNotFound);
  });

  it('saveEditedCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const same = '550e8400-e29b-41d4-a716-446655440020';
    await expect(
      saveEditedCompanionshipRelation(
        'relation-1',
        aWrite({ companion_id: same, accompanied_id: same }),
        aRelationsRepo(),
        aMembersRepo()
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSamePerson);
  });
});
