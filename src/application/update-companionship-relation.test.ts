import { describe, expect, it } from 'vitest';
import { updateCompanionshipRelation } from '@/application/update-companionship-relation';
import { InMemoryCompanionshipRegistry } from '@/adapters/db/in-memory/InMemoryCompanionshipRegistry';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { Gender } from '@/types/community-member';
import type { CompanionshipRelation } from '@/types/companionship-relation';

const relationId = 'relation-1';
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

function aRegistry(
  companionGender: Gender | null = 'female',
  accompaniedGender: Gender | null = 'female',
  seeded = true
): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    members: [
      { id: companionId, gender: companionGender },
      { id: accompaniedId, gender: accompaniedGender },
    ],
    relations: seeded
      ? [
          {
            id: relationId,
            companionId,
            accompaniedId,
            status: 'active',
            startDate: '2024-01-15',
            notes: null,
          },
        ]
      : [],
  });
}

function theStoredRelation(overrides: Partial<CompanionshipRelation> = {}): CompanionshipRelation {
  return {
    id: relationId,
    companion_id: MemberId(companionId),
    accompanied_id: MemberId(accompaniedId),
    status: 'active',
    start_date: '2024-01-15',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

describe('updateCompanionshipRelation', () => {
  it('updateCompanionshipRelation updates the relation when it exists', async () => {
    const registry = aRegistry();
    const today = new Date().toISOString().slice(0, 10);

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite(),
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      theStoredRelation({ status: 'active', start_date: today }),
    ]);
  });

  it('updateCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const registry = aRegistry();
    const samePerson = 'member-1';

    await expect(
      updateCompanionshipRelation(
        relationId,
        aCompanionshipRelationWrite({
          companion_id: samePerson,
          accompanied_id: samePerson,
        }),
        registry,
        registry
      )
    ).rejects.toThrow('The companion and the accompanied person cannot be the same');

    expect(registry.relations).toEqual([theStoredRelation()]);
  });

  it('updateCompanionshipRelation refuses when companion and accompanied have different genders', async () => {
    const registry = aRegistry('male', 'female');

    await expect(
      updateCompanionshipRelation(relationId, aCompanionshipRelationWrite(), registry, registry)
    ).rejects.toThrow('The companion and the accompanied person must share the same gender');

    expect(registry.relations).toEqual([theStoredRelation()]);
  });

  it('updateCompanionshipRelation refuses when relation does not exist', async () => {
    const registry = aRegistry('female', 'female', false);
    const missingId = 'non-existent';

    await expect(
      updateCompanionshipRelation(missingId, aCompanionshipRelationWrite(), registry, registry)
    ).rejects.toThrow(`Companionship relation with id ${missingId} not found`);

    expect(registry.relations).toEqual([]);
  });

  it('updateCompanionshipRelation defaults start date to today when omitted', async () => {
    const registry = aRegistry();
    const today = new Date().toISOString().slice(0, 10);

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite(),
      registry,
      registry
    );

    expect(registry.relations).toEqual([theStoredRelation({ start_date: today })]);
  });

  it('updateCompanionshipRelation accepts when Delegate provides explicit values', async () => {
    const registry = aRegistry();
    const explicitDate = '2024-02-15';

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite({
        start_date: explicitDate,
        status: 'archived',
        notes: 'Ended early',
      }),
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      theStoredRelation({
        start_date: explicitDate,
        status: 'archived',
        notes: 'Ended early',
      }),
    ]);
  });
});
