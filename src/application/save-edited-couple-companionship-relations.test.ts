import { describe, expect, it, vi } from 'vitest';
import { saveEditedCoupleCompanionshipRelations } from '@/application/save-edited-couple-companionship-relations';
import {
  InMemoryCompanionshipRegistry,
  type SeededCouple,
} from '@/adapters/db/in-memory/InMemoryCompanionshipRegistry';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';

const accompaniedCoupleId = '550e8400-e29b-41d4-a716-446655440020';
const companionCoupleId = '550e8400-e29b-41d4-a716-446655440010';
const accompaniedHusbandId = '550e8400-e29b-41d4-a716-446655440001';
const accompaniedWifeId = '550e8400-e29b-41d4-a716-446655440002';
const companionHusbandId = '550e8400-e29b-41d4-a716-446655440003';
const companionWifeId = '550e8400-e29b-41d4-a716-446655440004';
const husbandRelationId = 'rel-h';
const wifeRelationId = 'rel-w';

function aWrite(overrides: Partial<CoupleCompanionshipWrite> = {}): CoupleCompanionshipWrite {
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

function aRegistryWithTheActiveCouple(
  extraCouples: SeededCouple[] = []
): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    couples: [
      {
        id: companionCoupleId,
        husbandId: companionHusbandId,
        wifeId: companionWifeId,
      },
      {
        id: accompaniedCoupleId,
        husbandId: accompaniedHusbandId,
        wifeId: accompaniedWifeId,
      },
      ...extraCouples,
    ],
    relations: [
      {
        id: husbandRelationId,
        companionId: companionHusbandId,
        accompaniedId: accompaniedHusbandId,
        status: 'active',
        startDate: '2024-01-01',
        notes: null,
      },
      {
        id: wifeRelationId,
        companionId: companionWifeId,
        accompaniedId: accompaniedWifeId,
        status: 'active',
        startDate: '2024-01-01',
        notes: null,
      },
    ],
  });
}

function theHusbandRow(overrides: Partial<CompanionshipRelation> = {}): CompanionshipRelation {
  return {
    id: husbandRelationId,
    companion_id: MemberId(companionHusbandId),
    accompanied_id: MemberId(accompaniedHusbandId),
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function theWifeRow(overrides: Partial<CompanionshipRelation> = {}): CompanionshipRelation {
  return {
    id: wifeRelationId,
    companion_id: MemberId(companionWifeId),
    accompanied_id: MemberId(accompaniedWifeId),
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

describe('saveEditedCoupleCompanionshipRelations', () => {
  it('saveEditedCoupleCompanionshipRelations updates both rows in place when the Companion couple stays the same', async () => {
    const registry = aRegistryWithTheActiveCouple();

    await saveEditedCoupleCompanionshipRelations(
      husbandRelationId,
      wifeRelationId,
      aWrite({ notes: 'smooth' }),
      registry,
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      theHusbandRow({ start_date: '2024-06-01', notes: 'smooth' }),
      theWifeRow({ start_date: '2024-06-01', notes: 'smooth' }),
    ]);
  });

  it('saveEditedCoupleCompanionshipRelations archives both rows and inserts replacements when the Companion couple changes', async () => {
    const newCompanionCoupleId = '550e8400-e29b-41d4-a716-446655440030';
    const newCompanionHusbandId = '550e8400-e29b-41d4-a716-446655440005';
    const newCompanionWifeId = '550e8400-e29b-41d4-a716-446655440006';
    const registry = aRegistryWithTheActiveCouple([
      {
        id: newCompanionCoupleId,
        husbandId: newCompanionHusbandId,
        wifeId: newCompanionWifeId,
      },
    ]);
    const today = new Date().toISOString().slice(0, 10);

    await saveEditedCoupleCompanionshipRelations(
      husbandRelationId,
      wifeRelationId,
      aWrite({ companion_couple_id: newCompanionCoupleId }),
      registry,
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      theHusbandRow({ status: 'archived', end_date: today }),
      theWifeRow({ status: 'archived', end_date: today }),
      {
        id: 'relation-1',
        companion_id: MemberId(newCompanionHusbandId),
        accompanied_id: MemberId(accompaniedHusbandId),
        status: 'active',
        start_date: '2024-06-01',
        end_date: null,
        notes: 'ok',
      },
      {
        id: 'relation-2',
        companion_id: MemberId(newCompanionWifeId),
        accompanied_id: MemberId(accompaniedWifeId),
        status: 'active',
        start_date: '2024-06-01',
        end_date: null,
        notes: 'ok',
      },
    ]);
  });

  it('saveEditedCoupleCompanionshipRelations refuses when both sides are the same couple', async () => {
    const registry = aRegistryWithTheActiveCouple();

    await expect(
      saveEditedCoupleCompanionshipRelations(
        husbandRelationId,
        wifeRelationId,
        aWrite({
          companion_couple_id: accompaniedCoupleId,
          accompanied_couple_id: accompaniedCoupleId,
        }),
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('The companion couple and the accompanied couple cannot be the same');

    expect(registry.relations).toEqual([theHusbandRow(), theWifeRow()]);
  });

  it('saveEditedCoupleCompanionshipRelations changes no row when the wife update fails', async () => {
    const registry = aRegistryWithTheActiveCouple();
    const updateFirst = registry.updateCompanionshipRelation.bind(registry);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(registry, 'updateCompanionshipRelation')
      .mockImplementationOnce(updateFirst)
      .mockRejectedValueOnce(new Error('wife update failed'));

    await expect(
      saveEditedCoupleCompanionshipRelations(
        husbandRelationId,
        wifeRelationId,
        aWrite({ notes: 'smooth' }),
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('wife update failed');

    expect(registry.relations).toEqual([theHusbandRow(), theWifeRow()]);
  });

  it('saveEditedCoupleCompanionshipRelations changes no row when the wife replacement fails', async () => {
    const newCompanionCoupleId = '550e8400-e29b-41d4-a716-446655440030';
    const registry = aRegistryWithTheActiveCouple([
      {
        id: newCompanionCoupleId,
        husbandId: '550e8400-e29b-41d4-a716-446655440005',
        wifeId: '550e8400-e29b-41d4-a716-446655440006',
      },
    ]);
    const addFirst = registry.addCompanionshipRelation.bind(registry);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(registry, 'addCompanionshipRelation')
      .mockImplementationOnce(addFirst)
      .mockRejectedValueOnce(new Error('wife replacement failed'));

    await expect(
      saveEditedCoupleCompanionshipRelations(
        husbandRelationId,
        wifeRelationId,
        aWrite({ companion_couple_id: newCompanionCoupleId }),
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('wife replacement failed');

    expect(registry.relations).toEqual([theHusbandRow(), theWifeRow()]);
  });
});
