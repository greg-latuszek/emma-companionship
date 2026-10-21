import { describe, expect, it } from 'vitest';
import { addCompanionshipRelation } from '@/application/add-companionship-relation';
import { InMemoryCompanionshipRegistry } from '@/adapters/db/in-memory/InMemoryCompanionshipRegistry';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';

const companionId = 'companion-1';
const accompaniedId = 'accompanied-1';

function aCompanionshipRelationWrite(
  overrides: Partial<CompanionshipRelationWrite> = {}
): CompanionshipRelationWrite {
  return {
    companion_id: companionId,
    accompanied_id: accompaniedId,
    status: undefined,
    start_date: null,
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aRegistryOfCompanionAndAccompanied(
  companionGender: 'female' | 'male' | null = 'female',
  accompaniedGender: 'female' | 'male' | null = 'female'
): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    members: [
      { id: companionId, gender: companionGender },
      { id: accompaniedId, gender: accompaniedGender },
    ],
  });
}

describe('addCompanionshipRelation', () => {
  it('addCompanionshipRelation stores active status when the Delegate omits status', async () => {
    const registry = aRegistryOfCompanionAndAccompanied();
    const today = new Date().toISOString().slice(0, 10);

    await addCompanionshipRelation(aCompanionshipRelationWrite(), registry, registry);

    expect(registry.relations).toEqual([
      expect.objectContaining({
        companion_id: MemberId(companionId),
        accompanied_id: MemberId(accompaniedId),
        status: 'active',
        start_date: today,
        end_date: null,
        notes: null,
      }),
    ]);
  });

  it('addCompanionshipRelation defaults start date to today when the Delegate omits it', async () => {
    const registry = aRegistryOfCompanionAndAccompanied();
    const today = new Date().toISOString().slice(0, 10);

    await addCompanionshipRelation(aCompanionshipRelationWrite(), registry, registry);

    expect(registry.relations).toEqual([
      expect.objectContaining({
        companion_id: MemberId(companionId),
        accompanied_id: MemberId(accompaniedId),
        status: 'active',
        start_date: today,
        end_date: null,
        notes: null,
      }),
    ]);
  });

  it('addCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const samePerson = 'member-1';
    const registry = new InMemoryCompanionshipRegistry({
      members: [{ id: samePerson, gender: 'female' }],
    });

    await expect(
      addCompanionshipRelation(
        aCompanionshipRelationWrite({
          companion_id: samePerson,
          accompanied_id: samePerson,
        }),
        registry,
        registry
      )
    ).rejects.toThrow('The companion and the accompanied person cannot be the same');

    expect(registry.relations).toEqual([]);
  });

  it('addCompanionshipRelation refuses when companion and accompanied have different genders', async () => {
    const registry = aRegistryOfCompanionAndAccompanied('male', 'female');

    await expect(
      addCompanionshipRelation(aCompanionshipRelationWrite(), registry, registry)
    ).rejects.toThrow('The companion and the accompanied person must share the same gender');

    expect(registry.relations).toEqual([]);
  });

  it('addCompanionshipRelation accepts when either participant has no gender yet', async () => {
    const registry = aRegistryOfCompanionAndAccompanied('male', null);
    const today = new Date().toISOString().slice(0, 10);

    await addCompanionshipRelation(aCompanionshipRelationWrite(), registry, registry);

    expect(registry.relations).toEqual([
      expect.objectContaining({
        companion_id: MemberId(companionId),
        accompanied_id: MemberId(accompaniedId),
        status: 'active',
        start_date: today,
        end_date: null,
        notes: null,
      }),
    ]);
  });

  it('addCompanionshipRelation accepts when Delegate provides explicit start date', async () => {
    const registry = aRegistryOfCompanionAndAccompanied();
    const explicitDate = '2024-02-15';

    await addCompanionshipRelation(
      aCompanionshipRelationWrite({ start_date: explicitDate }),
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      expect.objectContaining({
        companion_id: MemberId(companionId),
        accompanied_id: MemberId(accompaniedId),
        status: 'active',
        start_date: explicitDate,
        end_date: null,
        notes: null,
      }),
    ]);
  });

  it('addCompanionshipRelation accepts archived status when explicitly provided', async () => {
    const registry = aRegistryOfCompanionAndAccompanied();
    const today = new Date().toISOString().slice(0, 10);

    await addCompanionshipRelation(
      aCompanionshipRelationWrite({ status: 'archived' }),
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      expect.objectContaining({
        companion_id: MemberId(companionId),
        accompanied_id: MemberId(accompaniedId),
        status: 'archived',
        start_date: today,
        end_date: null,
        notes: null,
      }),
    ]);
  });
});
