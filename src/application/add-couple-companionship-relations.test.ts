import { describe, expect, it } from 'vitest';
import { addCoupleCompanionshipRelations } from '@/application/add-couple-companionship-relations';
import { InMemoryCompanionshipRegistry } from '@/application/in-memory-companionship-registry';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';

const companionCoupleId = '550e8400-e29b-41d4-a716-446655440010';
const accompaniedCoupleId = '550e8400-e29b-41d4-a716-446655440020';
const companionHusbandId = '550e8400-e29b-41d4-a716-446655440001';
const companionWifeId = '550e8400-e29b-41d4-a716-446655440002';
const accompaniedHusbandId = '550e8400-e29b-41d4-a716-446655440003';
const accompaniedWifeId = '550e8400-e29b-41d4-a716-446655440004';

function aCoupleCompanionshipWrite(
  overrides: Partial<CoupleCompanionshipWrite> = {}
): CoupleCompanionshipWrite {
  return {
    companion_couple_id: companionCoupleId,
    accompanied_couple_id: accompaniedCoupleId,
    status: undefined,
    start_date: '2024-01-15',
    end_date: null,
    notes: 'notes',
    ...overrides,
  };
}

function aRegistryWithBothCouples(
  peopleWithoutCompanion: string[] = [accompaniedHusbandId, accompaniedWifeId]
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
    peopleWithoutCompanion,
  });
}

describe('addCoupleCompanionshipRelations', () => {
  it('addCoupleCompanionshipRelations writes husband-to-husband and wife-to-wife rows with the shared fields', async () => {
    const registry = aRegistryWithBothCouples();

    await addCoupleCompanionshipRelations(aCoupleCompanionshipWrite(), registry, registry);

    expect(registry.relations).toEqual([
      expect.objectContaining({
        companion_id: MemberId(companionHusbandId),
        accompanied_id: MemberId(accompaniedHusbandId),
        status: 'active',
        start_date: '2024-01-15',
        end_date: null,
        notes: 'notes',
      }),
      expect.objectContaining({
        companion_id: MemberId(companionWifeId),
        accompanied_id: MemberId(accompaniedWifeId),
        status: 'active',
        start_date: '2024-01-15',
        end_date: null,
        notes: 'notes',
      }),
    ]);
  });

  it('addCoupleCompanionshipRelations refuses when the companion couple is the accompanied couple', async () => {
    const registry = aRegistryWithBothCouples();

    await expect(
      addCoupleCompanionshipRelations(
        aCoupleCompanionshipWrite({
          companion_couple_id: companionCoupleId,
          accompanied_couple_id: companionCoupleId,
        }),
        registry,
        registry
      )
    ).rejects.toThrow('The companion couple and the accompanied couple cannot be the same');

    expect(registry.relations).toEqual([]);
  });

  it('addCoupleCompanionshipRelations refuses when either couple is missing from the registry', async () => {
    const registry = new InMemoryCompanionshipRegistry();

    await expect(
      addCoupleCompanionshipRelations(aCoupleCompanionshipWrite(), registry, registry)
    ).rejects.toThrow('Both the companion couple and the accompanied couple must exist');

    expect(registry.relations).toEqual([]);
  });

  it('addCoupleCompanionshipRelations refuses when either accompanied spouse already has a companion', async () => {
    const registry = aRegistryWithBothCouples([accompaniedHusbandId]);

    await expect(
      addCoupleCompanionshipRelations(aCoupleCompanionshipWrite(), registry, registry)
    ).rejects.toThrow('Both spouses of the accompanied couple must still need a companion');

    expect(registry.relations).toEqual([]);
  });
});
