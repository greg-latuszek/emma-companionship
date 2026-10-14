import { describe, expect, it, vi } from 'vitest';
import {
  addCoupleCompanionshipRelations,
  CompanionAndAccompaniedAreSameCouple,
  CoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/add-couple-companionship-relations';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import type { Couple } from '@/types/couple';

function aCoupleCompanionshipWrite(
  overrides: Partial<CoupleCompanionshipWrite> = {}
): CoupleCompanionshipWrite {
  return {
    companion_couple_id: '550e8400-e29b-41d4-a716-446655440010',
    accompanied_couple_id: '550e8400-e29b-41d4-a716-446655440020',
    status: undefined,
    start_date: '2024-01-15',
    end_date: null,
    notes: 'notes',
    ...overrides,
  };
}

function aCouple(overrides: Partial<Couple> = {}): Couple {
  return {
    id: '550e8400-e29b-41d4-a716-446655440010',
    member1_id: MemberId('550e8400-e29b-41d4-a716-446655440001'),
    member2_id: MemberId('550e8400-e29b-41d4-a716-446655440002'),
    ...overrides,
  };
}

function aCompanionshipRelation(
  overrides: Partial<CompanionshipRelation> = {}
): CompanionshipRelation {
  return {
    id: 'relation-1',
    companion_id: MemberId('550e8400-e29b-41d4-a716-446655440001'),
    accompanied_id: MemberId('550e8400-e29b-41d4-a716-446655440003'),
    status: 'active',
    start_date: '2024-01-15',
    end_date: null,
    notes: 'notes',
    ...overrides,
  };
}

function aCompanionshipRelationRepository(
  stubs: Partial<ICompanionshipRelationRepository> = {}
): ICompanionshipRelationRepository {
  return {
    listCompanionshipRelations: vi.fn(),
    listPeopleWithoutCompanion: vi.fn().mockResolvedValue([
      { id: MemberId('550e8400-e29b-41d4-a716-446655440003') },
      { id: MemberId('550e8400-e29b-41d4-a716-446655440004') },
    ]),
    findCompanionshipRelationById: vi.fn(),
    addCompanionshipRelation: vi.fn(),
    findActiveCompanionshipRelationByAccompaniedId: vi.fn(),
    addCompanionshipRelationPair: vi.fn().mockResolvedValue([
      aCompanionshipRelation({ id: 'husband-relation' }),
      aCompanionshipRelation({
        id: 'wife-relation',
        companion_id: MemberId('550e8400-e29b-41d4-a716-446655440002'),
        accompanied_id: MemberId('550e8400-e29b-41d4-a716-446655440004'),
      }),
    ]),
    updateCompanionshipRelation: vi.fn(),
    updateCompanionshipRelationPair: vi.fn(),
    archiveCompanionshipRelationAndAddReplacement: vi.fn(),
    archiveCompanionshipRelationPairAndAddReplacement: vi.fn(),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

function aCoupleRepository(
  stubs: Partial<ICoupleRepository> = {}
): ICoupleRepository {
  const companionCouple = aCouple({
    id: '550e8400-e29b-41d4-a716-446655440010',
    member1_id: MemberId('550e8400-e29b-41d4-a716-446655440001'),
    member2_id: MemberId('550e8400-e29b-41d4-a716-446655440002'),
  });
  const accompaniedCouple = aCouple({
    id: '550e8400-e29b-41d4-a716-446655440020',
    member1_id: MemberId('550e8400-e29b-41d4-a716-446655440003'),
    member2_id: MemberId('550e8400-e29b-41d4-a716-446655440004'),
  });

  return {
    listCouples: vi.fn(),
    listMarriedPeopleWithoutCouple: vi.fn(),
    findCoupleById: vi.fn().mockImplementation(async (id: string) => {
      if (id === companionCouple.id) {
        return companionCouple;
      }
      if (id === accompaniedCouple.id) {
        return accompaniedCouple;
      }
      return null;
    }),
    addCouple: vi.fn(),
    removeCouple: vi.fn(),
    ...stubs,
  };
}

describe('addCoupleCompanionshipRelations', () => {
  it('addCoupleCompanionshipRelations writes husband-to-husband and wife-to-wife rows with the shared fields', async () => {
    const relations = aCompanionshipRelationRepository();
    const couples = aCoupleRepository();

    await addCoupleCompanionshipRelations(
      aCoupleCompanionshipWrite(),
      relations,
      couples
    );

    expect(relations.addCompanionshipRelationPair).toHaveBeenCalledWith(
      {
        companion_id: '550e8400-e29b-41d4-a716-446655440001',
        accompanied_id: '550e8400-e29b-41d4-a716-446655440003',
        status: 'active',
        start_date: '2024-01-15',
        end_date: null,
        notes: 'notes',
      },
      {
        companion_id: '550e8400-e29b-41d4-a716-446655440002',
        accompanied_id: '550e8400-e29b-41d4-a716-446655440004',
        status: 'active',
        start_date: '2024-01-15',
        end_date: null,
        notes: 'notes',
      }
    );
  });

  it('addCoupleCompanionshipRelations refuses when the companion couple is the accompanied couple', async () => {
    const relations = aCompanionshipRelationRepository();
    const couples = aCoupleRepository();

    await expect(
      addCoupleCompanionshipRelations(
        aCoupleCompanionshipWrite({
          companion_couple_id: '550e8400-e29b-41d4-a716-446655440010',
          accompanied_couple_id: '550e8400-e29b-41d4-a716-446655440010',
        }),
        relations,
        couples
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSameCouple);

    expect(relations.addCompanionshipRelationPair).not.toHaveBeenCalled();
  });

  it('addCoupleCompanionshipRelations refuses when either couple is missing from the registry', async () => {
    const relations = aCompanionshipRelationRepository();
    const couples = aCoupleRepository({
      findCoupleById: vi.fn().mockResolvedValue(null),
    });

    await expect(
      addCoupleCompanionshipRelations(
        aCoupleCompanionshipWrite(),
        relations,
        couples
      )
    ).rejects.toBeInstanceOf(CoupleCompanionshipParticipantsAreNotEligible);

    expect(relations.addCompanionshipRelationPair).not.toHaveBeenCalled();
  });

  it('addCoupleCompanionshipRelations refuses when either accompanied spouse already has a companion', async () => {
    const relations = aCompanionshipRelationRepository({
      listPeopleWithoutCompanion: vi.fn().mockResolvedValue([
        { id: MemberId('550e8400-e29b-41d4-a716-446655440003') },
      ]),
    });
    const couples = aCoupleRepository();

    await expect(
      addCoupleCompanionshipRelations(
        aCoupleCompanionshipWrite(),
        relations,
        couples
      )
    ).rejects.toBeInstanceOf(CoupleCompanionshipParticipantsAreNotEligible);

    expect(relations.addCompanionshipRelationPair).not.toHaveBeenCalled();
  });
});
