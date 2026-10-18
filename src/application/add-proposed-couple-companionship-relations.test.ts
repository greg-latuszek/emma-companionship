import { describe, expect, it, vi } from 'vitest';
import { addProposedCoupleCompanionshipRelations } from '@/application/add-proposed-couple-companionship-relations';
import { CompanionAndAccompaniedAreSameCouple } from '@/application/add-couple-companionship-relations';
import { ProposedCompanionshipAlreadyExists } from '@/application/add-proposed-companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import { MemberId } from '@/types/auth';
import type { Couple } from '@/types/couple';

function aCouple(overrides: Partial<Couple> & Pick<Couple, 'id'>): Couple {
  return {
    member1_id: MemberId('h1'),
    member2_id: MemberId('w1'),
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
    addCompanionshipRelation: vi.fn(),
    addCompanionshipRelationPair: vi.fn().mockResolvedValue([
      {
        id: 'ph',
        companion_id: MemberId('ch'),
        accompanied_id: MemberId('ah'),
        status: 'proposed',
        start_date: null,
        end_date: null,
        notes: null,
      },
      {
        id: 'pw',
        companion_id: MemberId('cw'),
        accompanied_id: MemberId('aw'),
        status: 'proposed',
        start_date: null,
        end_date: null,
        notes: null,
      },
    ]),
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

describe('addProposedCoupleCompanionshipRelations', () => {
  it('addProposedCoupleCompanionshipRelations writes husband and wife proposed rows without requiring missing companions', async () => {
    const companionCouple = aCouple({
      id: 'cc',
      member1_id: MemberId('ch'),
      member2_id: MemberId('cw'),
    });
    const accompaniedCouple = aCouple({
      id: 'ac',
      member1_id: MemberId('ah'),
      member2_id: MemberId('aw'),
    });
    const relations = aRelationsMock();
    const couples = {
      findCoupleById: vi
        .fn()
        .mockResolvedValueOnce(companionCouple)
        .mockResolvedValueOnce(accompaniedCouple),
    } as unknown as ICoupleRepository;

    await addProposedCoupleCompanionshipRelations(
      {
        companion_couple_id: companionCouple.id,
        accompanied_couple_id: accompaniedCouple.id,
        start_date: null,
        end_date: null,
        notes: null,
      },
      relations,
      couples
    );

    expect(relations.listPeopleWithoutCompanion).not.toHaveBeenCalled();
    expect(relations.addCompanionshipRelationPair).toHaveBeenCalledWith(
      {
        companion_id: companionCouple.member1_id,
        accompanied_id: accompaniedCouple.member1_id,
        status: 'proposed',
        start_date: null,
        end_date: null,
        notes: null,
      },
      {
        companion_id: companionCouple.member2_id,
        accompanied_id: accompaniedCouple.member2_id,
        status: 'proposed',
        start_date: null,
        end_date: null,
        notes: null,
      }
    );
  });

  it('addProposedCoupleCompanionshipRelations refuses when both sides are the same couple', async () => {
    const relations = aRelationsMock();
    const couples = {
      findCoupleById: vi.fn(),
    } as unknown as ICoupleRepository;

    await expect(
      addProposedCoupleCompanionshipRelations(
        {
          companion_couple_id: '550e8400-e29b-41d4-a716-446655440010',
          accompanied_couple_id: '550e8400-e29b-41d4-a716-446655440010',
          start_date: null,
          end_date: null,
          notes: null,
        },
        relations,
        couples
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSameCouple);
  });

  it('addProposedCoupleCompanionshipRelations refuses when that companion couple is already proposed', async () => {
    const companionCouple = aCouple({
      id: 'cc',
      member1_id: MemberId('ch'),
      member2_id: MemberId('cw'),
    });
    const accompaniedCouple = aCouple({
      id: 'ac',
      member1_id: MemberId('ah'),
      member2_id: MemberId('aw'),
    });
    const relations = aRelationsMock({
      listProposedCompanionshipRelationsForAccompanied: vi
        .fn()
        .mockResolvedValue([
          {
            id: 'existing',
            companion: {
              id: MemberId('ch'),
              first_name: 'Jan',
              last_name: 'Kowalski',
              marital_status: null,
              consecrated_status: null,
              community_engagement_status: null,
            },
            accompanied: {
              id: MemberId('ah'),
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
          },
        ]),
    });
    const couples = {
      findCoupleById: vi
        .fn()
        .mockResolvedValueOnce(companionCouple)
        .mockResolvedValueOnce(accompaniedCouple),
    } as unknown as ICoupleRepository;

    await expect(
      addProposedCoupleCompanionshipRelations(
        {
          companion_couple_id: companionCouple.id,
          accompanied_couple_id: accompaniedCouple.id,
          start_date: null,
          end_date: null,
          notes: null,
        },
        relations,
        couples
      )
    ).rejects.toBeInstanceOf(ProposedCompanionshipAlreadyExists);
  });
});
