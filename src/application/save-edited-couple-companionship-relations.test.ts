import { describe, expect, it, vi } from 'vitest';
import {
  saveEditedCoupleCompanionshipRelations,
  CompanionAndAccompaniedAreSameCouple,
} from '@/application/save-edited-couple-companionship-relations';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import type { Couple } from '@/types/couple';

const accompaniedCoupleId = '550e8400-e29b-41d4-a716-446655440020';
const companionCoupleId = '550e8400-e29b-41d4-a716-446655440010';
const husbandId = MemberId('550e8400-e29b-41d4-a716-446655440001');
const wifeId = MemberId('550e8400-e29b-41d4-a716-446655440002');
const companionHusbandId = MemberId('550e8400-e29b-41d4-a716-446655440003');
const companionWifeId = MemberId('550e8400-e29b-41d4-a716-446655440004');

function aWrite(
  overrides: Partial<CoupleCompanionshipWrite> = {}
): CoupleCompanionshipWrite {
  return {
    companion_couple_id: companionCoupleId,
    accompanied_couple_id: accompaniedCoupleId,
    status: undefined,
    start_date: '2024-06-01',
    end_date: null,
    notes: 'ok',
    ...overrides,
  };
}

function aCouple(id: string): Couple {
  if (id === companionCoupleId) {
    return {
      id: companionCoupleId,
      member1_id: companionHusbandId,
      member2_id: companionWifeId,
    };
  }
  return {
    id: accompaniedCoupleId,
    member1_id: husbandId,
    member2_id: wifeId,
  };
}

function aRelation(
  overrides: Partial<CompanionshipRelation> = {}
): CompanionshipRelation {
  return {
    id: 'rel-h',
    companion_id: companionHusbandId,
    accompanied_id: husbandId,
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aRelationsRepo(
  stubs: Partial<ICompanionshipRelationRepository> = {}
): ICompanionshipRelationRepository {
  const husband = aRelation({ id: 'rel-h' });
  const wife = aRelation({
    id: 'rel-w',
    companion_id: companionWifeId,
    accompanied_id: wifeId,
  });
  return {
    listCompanionshipRelations: vi.fn(),
    listPeopleWithoutCompanion: vi.fn(),
    findCompanionshipRelationById: vi.fn().mockImplementation(async (id: string) => {
      if (id === 'rel-h') return husband;
      if (id === 'rel-w') return wife;
      return null;
    }),
    findActiveCompanionshipRelationByAccompaniedId: vi.fn(),
    addCompanionshipRelation: vi.fn(),
    addCompanionshipRelationPair: vi.fn(),
    updateCompanionshipRelation: vi.fn(),
    updateCompanionshipRelationPair: vi.fn().mockResolvedValue([husband, wife]),
    archiveCompanionshipRelationAndAddReplacement: vi.fn(),
    archiveCompanionshipRelationPairAndAddReplacement: vi
      .fn()
      .mockResolvedValue([husband, wife]),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

function aCouplesRepo(): ICoupleRepository {
  return {
    listCouples: vi.fn(),
    listMarriedPeopleWithoutCouple: vi.fn(),
    findCoupleById: vi.fn().mockImplementation(async (id: string) => aCouple(id)),
    addCouple: vi.fn(),
    removeCouple: vi.fn(),
  };
}

describe('saveEditedCoupleCompanionshipRelations', () => {
  it('saveEditedCoupleCompanionshipRelations updates both rows in place when the Companion couple stays the same', async () => {
    const relations = aRelationsRepo();

    await saveEditedCoupleCompanionshipRelations(
      'rel-h',
      'rel-w',
      aWrite({ notes: 'smooth' }),
      relations,
      aCouplesRepo()
    );

    expect(relations.updateCompanionshipRelationPair).toHaveBeenCalled();
    expect(
      relations.archiveCompanionshipRelationPairAndAddReplacement
    ).not.toHaveBeenCalled();
  });

  it('saveEditedCoupleCompanionshipRelations archives both rows and inserts replacements when the Companion couple changes', async () => {
    const relations = aRelationsRepo();
    const newCompanionCoupleId = '550e8400-e29b-41d4-a716-446655440030';
    const couples = aCouplesRepo();
    vi.mocked(couples.findCoupleById).mockImplementation(async (id: string) => {
      if (id === newCompanionCoupleId) {
        return {
          id: newCompanionCoupleId,
          member1_id: MemberId('550e8400-e29b-41d4-a716-446655440005'),
          member2_id: MemberId('550e8400-e29b-41d4-a716-446655440006'),
        };
      }
      return aCouple(id);
    });

    await saveEditedCoupleCompanionshipRelations(
      'rel-h',
      'rel-w',
      aWrite({ companion_couple_id: newCompanionCoupleId }),
      relations,
      couples
    );

    expect(
      relations.archiveCompanionshipRelationPairAndAddReplacement
    ).toHaveBeenCalled();
    expect(relations.updateCompanionshipRelationPair).not.toHaveBeenCalled();
  });

  it('saveEditedCoupleCompanionshipRelations refuses when both sides are the same couple', async () => {
    await expect(
      saveEditedCoupleCompanionshipRelations(
        'rel-h',
        'rel-w',
        aWrite({
          companion_couple_id: accompaniedCoupleId,
          accompanied_couple_id: accompaniedCoupleId,
        }),
        aRelationsRepo(),
        aCouplesRepo()
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSameCouple);
  });
});
