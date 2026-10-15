import { describe, expect, it, vi } from 'vitest';
import {
  addProposedCompanionshipRelation,
  ProposedCompanionshipAlreadyExists,
} from '@/application/add-proposed-companionship-relation';
import { CompanionAndAccompaniedAreSamePerson } from '@/application/add-companionship-relation';
import { CompanionAndAccompaniedHaveDifferentGenders } from '@/application/companionship-participant-genders';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

function aMember(overrides: Partial<CommunityMember>): CommunityMember {
  return {
    id: MemberId('member-1'),
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

function aRelationsMock(
  overrides: Partial<ICompanionshipRelationRepository> = {}
): ICompanionshipRelationRepository {
  return {
    listCompanionshipRelations: vi.fn(),
    listArchivedCompanionshipRelations: vi.fn(),
    listProposedCompanionshipRelationsForAccompanied: vi
      .fn()
      .mockResolvedValue([]),
    listPeopleWithoutCompanion: vi.fn(),
    findCompanionshipRelationById: vi.fn(),
    findActiveCompanionshipRelationByAccompaniedId: vi.fn(),
    addCompanionshipRelation: vi.fn().mockResolvedValue({
      id: 'proposed-1',
      companion_id: MemberId('c1'),
      accompanied_id: MemberId('a1'),
      status: 'proposed',
      start_date: null,
      end_date: null,
      notes: null,
    }),
    addCompanionshipRelationPair: vi.fn(),
    updateCompanionshipRelation: vi.fn(),
    updateCompanionshipRelationPair: vi.fn(),
    archiveCompanionshipRelationAndAddReplacement: vi.fn(),
    archiveCompanionshipRelationPairAndAddReplacement: vi.fn(),
    deleteProposedCompanionshipRelation: vi.fn(),
    deleteProposedCompanionshipRelationPair: vi.fn(),
    activateProposedCompanionshipRelation: vi.fn(),
    activateProposedCompanionshipRelationPair: vi.fn(),
    deleteCompanionshipRelation: vi.fn(),
    ...overrides,
  } as ICompanionshipRelationRepository;
}

describe('addProposedCompanionshipRelation', () => {
  it('addProposedCompanionshipRelation writes a proposed row without start or end dates', async () => {
    const companion = aMember({
      id: MemberId('c1'),
      gender: 'male',
      first_name: 'Jan',
      last_name: 'Kowalski',
    });
    const accompanied = aMember({
      id: MemberId('a1'),
      gender: 'male',
      first_name: 'Piotr',
      last_name: 'Nowak',
    });
    const relations = aRelationsMock();
    const members = {
      findCommunityMemberById: vi
        .fn()
        .mockResolvedValueOnce(companion)
        .mockResolvedValueOnce(accompanied),
    } as unknown as ICommunityMemberRepository;

    await addProposedCompanionshipRelation(
      {
        companion_id: companion.id,
        accompanied_id: accompanied.id,
        start_date: null,
        end_date: null,
        notes: 'candidate',
      },
      relations,
      members
    );

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith({
      companion_id: companion.id,
      accompanied_id: accompanied.id,
      status: 'proposed',
      start_date: null,
      end_date: null,
      notes: 'candidate',
    });
  });

  it('addProposedCompanionshipRelation refuses when the companion and accompanied are the same person', async () => {
    const relations = aRelationsMock();
    const members = {
      findCommunityMemberById: vi.fn(),
    } as unknown as ICommunityMemberRepository;

    await expect(
      addProposedCompanionshipRelation(
        {
          companion_id: '550e8400-e29b-41d4-a716-446655440001',
          accompanied_id: '550e8400-e29b-41d4-a716-446655440001',
          start_date: null,
          end_date: null,
          notes: null,
        },
        relations,
        members
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSamePerson);
  });

  it('addProposedCompanionshipRelation refuses when genders differ', async () => {
    const companion = aMember({ id: MemberId('c1'), gender: 'male' });
    const accompanied = aMember({ id: MemberId('a1'), gender: 'female' });
    const relations = aRelationsMock();
    const members = {
      findCommunityMemberById: vi
        .fn()
        .mockResolvedValueOnce(companion)
        .mockResolvedValueOnce(accompanied),
    } as unknown as ICommunityMemberRepository;

    await expect(
      addProposedCompanionshipRelation(
        {
          companion_id: companion.id,
          accompanied_id: accompanied.id,
          start_date: null,
          end_date: null,
          notes: null,
        },
        relations,
        members
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedHaveDifferentGenders);
  });

  it('addProposedCompanionshipRelation refuses when the same companion is already proposed', async () => {
    const companion = aMember({ id: MemberId('c1'), gender: 'male' });
    const accompanied = aMember({ id: MemberId('a1'), gender: 'male' });
    const existing: CompanionshipRelationListItem = {
      id: 'existing',
      companion: {
        id: companion.id,
        first_name: 'Jan',
        last_name: 'Kowalski',
        marital_status: null,
        consecrated_status: null,
        community_engagement_status: null,
      },
      accompanied: {
        id: accompanied.id,
        first_name: 'Piotr',
        last_name: 'Nowak',
        marital_status: null,
        consecrated_status: null,
        community_engagement_status: null,
      },
      status: 'proposed',
      start_date: null,
      end_date: null,
      notes: null,
    };
    const relations = aRelationsMock({
      listProposedCompanionshipRelationsForAccompanied: vi
        .fn()
        .mockResolvedValue([existing]),
    });
    const members = {
      findCommunityMemberById: vi
        .fn()
        .mockResolvedValueOnce(companion)
        .mockResolvedValueOnce(accompanied),
    } as unknown as ICommunityMemberRepository;

    await expect(
      addProposedCompanionshipRelation(
        {
          companion_id: companion.id,
          accompanied_id: accompanied.id,
          start_date: null,
          end_date: null,
          notes: null,
        },
        relations,
        members
      )
    ).rejects.toBeInstanceOf(ProposedCompanionshipAlreadyExists);
  });
});
