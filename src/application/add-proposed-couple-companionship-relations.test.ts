import { describe, expect, it, vi } from 'vitest';
import { addProposedCoupleCompanionshipRelations } from '@/application/add-proposed-couple-companionship-relations';
import {
  InMemoryCompanionshipRegistry,
  type SeededCompanionshipRelation,
} from '@/application/in-memory-companionship-registry';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';

const companionCoupleId = 'cc';
const accompaniedCoupleId = 'ac';
const companionHusbandId = 'ch';
const companionWifeId = 'cw';
const accompaniedHusbandId = 'ah';
const accompaniedWifeId = 'aw';

function aRegistryWithBothCouples(
  relations: SeededCompanionshipRelation[] = []
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
    ],
    relations,
  });
}

function aProposedRow(
  id: string,
  companionId: string,
  accompaniedId: string
): CompanionshipRelation {
  return {
    id,
    companion_id: MemberId(companionId),
    accompanied_id: MemberId(accompaniedId),
    status: 'proposed',
    start_date: null,
    end_date: null,
    notes: null,
  };
}

describe('addProposedCoupleCompanionshipRelations', () => {
  it('addProposedCoupleCompanionshipRelations writes husband and wife proposed rows without requiring missing companions', async () => {
    const registry = aRegistryWithBothCouples();

    await addProposedCoupleCompanionshipRelations(
      {
        companion_couple_id: companionCoupleId,
        accompanied_couple_id: accompaniedCoupleId,
        start_date: null,
        end_date: null,
        notes: null,
      },
      registry,
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      aProposedRow('relation-1', companionHusbandId, accompaniedHusbandId),
      aProposedRow('relation-2', companionWifeId, accompaniedWifeId),
    ]);
  });

  it('addProposedCoupleCompanionshipRelations refuses when both sides are the same couple', async () => {
    const registry = aRegistryWithBothCouples();

    await expect(
      addProposedCoupleCompanionshipRelations(
        {
          companion_couple_id: '550e8400-e29b-41d4-a716-446655440010',
          accompanied_couple_id: '550e8400-e29b-41d4-a716-446655440010',
          start_date: null,
          end_date: null,
          notes: null,
        },
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('The companion couple and the accompanied couple cannot be the same');

    expect(registry.relations).toEqual([]);
  });

  it('addProposedCoupleCompanionshipRelations refuses when that companion couple is already proposed', async () => {
    const registry = aRegistryWithBothCouples([
      {
        id: 'existing',
        companionId: companionHusbandId,
        accompaniedId: accompaniedHusbandId,
        status: 'proposed',
        startDate: null,
        endDate: null,
        notes: null,
      },
    ]);

    await expect(
      addProposedCoupleCompanionshipRelations(
        {
          companion_couple_id: companionCoupleId,
          accompanied_couple_id: accompaniedCoupleId,
          start_date: null,
          end_date: null,
          notes: null,
        },
        registry,
        registry,
        registry
      )
    ).rejects.toThrow(
      'A proposed companionship already exists for this companion and accompanied person'
    );

    expect(registry.relations).toEqual([
      aProposedRow('existing', companionHusbandId, accompaniedHusbandId),
    ]);
  });

  it('addProposedCoupleCompanionshipRelations stores no row when the wife row fails', async () => {
    const registry = aRegistryWithBothCouples();
    const addFirst = registry.addCompanionshipRelation.bind(registry);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(registry, 'addCompanionshipRelation')
      .mockImplementationOnce(addFirst)
      .mockRejectedValueOnce(new Error('wife row failed'));

    await expect(
      addProposedCoupleCompanionshipRelations(
        {
          companion_couple_id: companionCoupleId,
          accompanied_couple_id: accompaniedCoupleId,
          start_date: null,
          end_date: null,
          notes: null,
        },
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('wife row failed');

    expect(registry.relations).toEqual([]);
  });
});
