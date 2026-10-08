import { describe, expect, it, vi } from 'vitest';
import {
  addCompanionshipRelation,
  CompanionAndAccompaniedAreSamePerson,
  CompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/add-companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { CompanionshipRelation } from '@/types/companionship-relation';

function aCompanionshipRelationWrite(
  overrides: Partial<CompanionshipRelationWrite> = {}
): CompanionshipRelationWrite {
  return {
    companion_id: 'companion-1',
    accompanied_id: 'accompanied-1',
    status: undefined,
    start_date: null,
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aCompanionshipRelation(
  overrides: Partial<CompanionshipRelation> = {}
): CompanionshipRelation {
  return {
    id: 'relation-1',
    companion_id: MemberId('companion-1'),
    accompanied_id: MemberId('accompanied-1'),
    status: 'active',
    start_date: '2024-01-15',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aCommunityMember(
  overrides: Partial<CommunityMember> = {}
): CommunityMember {
  return {
    id: MemberId('companion-1'),
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

function aCompanionshipRelationRepository(
  stubs: Partial<ICompanionshipRelationRepository> = {}
): ICompanionshipRelationRepository {
  return {
    listCompanionshipRelations: vi.fn(),
    listPeopleWithoutCompanion: vi.fn(),
    findCompanionshipRelationById: vi.fn(),
    addCompanionshipRelation: vi.fn().mockResolvedValue(aCompanionshipRelation()),
    updateCompanionshipRelation: vi.fn(),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

function aCommunityMemberRepository(
  stubs: Partial<ICommunityMemberRepository> = {}
): ICommunityMemberRepository {
  return {
    listCommunityMembers: vi.fn(),
    findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) =>
      aCommunityMember({ id, gender: 'female' })
    ),
    findCommunityMemberByEmail: vi.fn(),
    addCommunityMember: vi.fn(),
    updateCommunityMember: vi.fn(),
    removeCommunityMember: vi.fn(),
    ...stubs,
  };
}

describe('addCompanionshipRelation', () => {
  it('addCompanionshipRelation stores active status when the Delegate omits status', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();

    await addCompanionshipRelation(aCompanionshipRelationWrite(), relations, members);

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' })
    );
  });

  it('addCompanionshipRelation defaults start date to today when the Delegate omits it', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const today = new Date().toISOString().slice(0, 10);

    await addCompanionshipRelation(aCompanionshipRelationWrite(), relations, members);

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ start_date: today })
    );
  });

  it('addCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const samePerson = 'member-1';

    await expect(
      addCompanionshipRelation(
        aCompanionshipRelationWrite({
          companion_id: samePerson,
          accompanied_id: samePerson,
        }),
        relations,
        members
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSamePerson);

    expect(relations.addCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('addCompanionshipRelation refuses when companion and accompanied have different genders', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) => {
        if (id === MemberId('companion-1')) {
          return aCommunityMember({ id, gender: 'male' });
        }
        return aCommunityMember({ id, gender: 'female' });
      }),
    });

    await expect(
      addCompanionshipRelation(aCompanionshipRelationWrite(), relations, members)
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedHaveDifferentGenders);

    expect(relations.addCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('addCompanionshipRelation accepts when either participant has no gender yet', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) => {
        if (id === MemberId('companion-1')) {
          return aCommunityMember({ id, gender: 'male' });
        }
        return aCommunityMember({ id, gender: null });
      }),
    });

    await addCompanionshipRelation(aCompanionshipRelationWrite(), relations, members);

    expect(relations.addCompanionshipRelation).toHaveBeenCalled();
  });

  it('addCompanionshipRelation accepts when Delegate provides explicit start date', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const explicitDate = '2024-02-15';

    await addCompanionshipRelation(
      aCompanionshipRelationWrite({ start_date: explicitDate }),
      relations,
      members
    );

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ start_date: explicitDate })
    );
  });

  it('addCompanionshipRelation accepts archived status when explicitly provided', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();

    await addCompanionshipRelation(
      aCompanionshipRelationWrite({ status: 'archived' }),
      relations,
      members
    );

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'archived' })
    );
  });
});
