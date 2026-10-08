import { describe, expect, it, vi } from 'vitest';
import {
  updateCompanionshipRelation,
  CompanionAndAccompaniedAreSamePerson,
  CompanionAndAccompaniedHaveDifferentGenders,
  CompanionshipRelationNotFound,
} from '@/application/update-companionship-relation';
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
    findCompanionshipRelationById: vi
      .fn()
      .mockResolvedValue(aCompanionshipRelation()),
    addCompanionshipRelation: vi.fn().mockResolvedValue(aCompanionshipRelation()),
    updateCompanionshipRelation: vi
      .fn()
      .mockResolvedValue(aCompanionshipRelation()),
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

describe('updateCompanionshipRelation', () => {
  it('updateCompanionshipRelation updates the relation when it exists', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const relationId = 'relation-1';

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite(),
      relations,
      members
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({ status: 'active' })
    );
  });

  it('updateCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const relationId = 'relation-1';
    const samePerson = 'member-1';

    await expect(
      updateCompanionshipRelation(
        relationId,
        aCompanionshipRelationWrite({
          companion_id: samePerson,
          accompanied_id: samePerson,
        }),
        relations,
        members
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSamePerson);

    expect(relations.updateCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('updateCompanionshipRelation refuses when companion and accompanied have different genders', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) => {
        if (id === MemberId('companion-1')) {
          return aCommunityMember({ id, gender: 'male' });
        }
        return aCommunityMember({ id, gender: 'female' });
      }),
    });
    const relationId = 'relation-1';

    await expect(
      updateCompanionshipRelation(
        relationId,
        aCompanionshipRelationWrite(),
        relations,
        members
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedHaveDifferentGenders);

    expect(relations.updateCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('updateCompanionshipRelation refuses when relation does not exist', async () => {
    const relations = aCompanionshipRelationRepository({
      findCompanionshipRelationById: vi.fn().mockResolvedValue(null),
    });
    const members = aCommunityMemberRepository();
    const relationId = 'non-existent';

    await expect(
      updateCompanionshipRelation(
        relationId,
        aCompanionshipRelationWrite(),
        relations,
        members
      )
    ).rejects.toBeInstanceOf(CompanionshipRelationNotFound);

    expect(relations.updateCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('updateCompanionshipRelation defaults start date to today when omitted', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const relationId = 'relation-1';
    const today = new Date().toISOString().slice(0, 10);

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite(),
      relations,
      members
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({ start_date: today })
    );
  });

  it('updateCompanionshipRelation accepts when Delegate provides explicit values', async () => {
    const relations = aCompanionshipRelationRepository();
    const members = aCommunityMemberRepository();
    const relationId = 'relation-1';
    const explicitDate = '2024-02-15';

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite({
        start_date: explicitDate,
        status: 'archived',
        notes: 'Ended early',
      }),
      relations,
      members
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({
        start_date: explicitDate,
        status: 'archived',
        notes: 'Ended early',
      })
    );
  });
});
