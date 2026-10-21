import { describe, expect, it } from 'vitest';
import { addProposedCompanionshipRelation } from '@/application/add-proposed-companionship-relation';
import { InMemoryCompanionshipRegistry } from '@/adapters/db/in-memory/InMemoryCompanionshipRegistry';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';

const companionId = 'c1';
const accompaniedId = 'a1';

function aRegistryOfTwoMen(): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    members: [
      { id: companionId, gender: 'male' },
      { id: accompaniedId, gender: 'male' },
    ],
  });
}

function theProposedRow(overrides: Partial<CompanionshipRelation> = {}): CompanionshipRelation {
  return {
    id: 'relation-1',
    companion_id: MemberId(companionId),
    accompanied_id: MemberId(accompaniedId),
    status: 'proposed',
    start_date: null,
    end_date: null,
    notes: null,
    ...overrides,
  };
}

describe('addProposedCompanionshipRelation', () => {
  it('addProposedCompanionshipRelation writes a proposed row without start or end dates', async () => {
    const registry = aRegistryOfTwoMen();

    await addProposedCompanionshipRelation(
      {
        companion_id: companionId,
        accompanied_id: accompaniedId,
        start_date: null,
        end_date: null,
        notes: 'candidate',
      },
      registry,
      registry
    );

    expect(registry.relations).toEqual([theProposedRow({ notes: 'candidate' })]);
  });

  it('addProposedCompanionshipRelation refuses when the companion and accompanied are the same person', async () => {
    const samePerson = '550e8400-e29b-41d4-a716-446655440001';
    const registry = new InMemoryCompanionshipRegistry({
      members: [{ id: samePerson, gender: 'male' }],
    });

    await expect(
      addProposedCompanionshipRelation(
        {
          companion_id: samePerson,
          accompanied_id: samePerson,
          start_date: null,
          end_date: null,
          notes: null,
        },
        registry,
        registry
      )
    ).rejects.toThrow('The companion and the accompanied person cannot be the same');

    expect(registry.relations).toEqual([]);
  });

  it('addProposedCompanionshipRelation refuses when genders differ', async () => {
    const registry = new InMemoryCompanionshipRegistry({
      members: [
        { id: companionId, gender: 'male' },
        { id: accompaniedId, gender: 'female' },
      ],
    });

    await expect(
      addProposedCompanionshipRelation(
        {
          companion_id: companionId,
          accompanied_id: accompaniedId,
          start_date: null,
          end_date: null,
          notes: null,
        },
        registry,
        registry
      )
    ).rejects.toThrow('The companion and the accompanied person must share the same gender');

    expect(registry.relations).toEqual([]);
  });

  it('addProposedCompanionshipRelation refuses when the same companion is already proposed', async () => {
    const registry = new InMemoryCompanionshipRegistry({
      members: [
        { id: companionId, gender: 'male' },
        { id: accompaniedId, gender: 'male' },
      ],
      relations: [
        {
          id: 'existing',
          companionId,
          accompaniedId,
          status: 'proposed',
          startDate: null,
          endDate: null,
          notes: null,
        },
      ],
    });

    await expect(
      addProposedCompanionshipRelation(
        {
          companion_id: companionId,
          accompanied_id: accompaniedId,
          start_date: null,
          end_date: null,
          notes: null,
        },
        registry,
        registry
      )
    ).rejects.toThrow(
      'A proposed companionship already exists for this companion and accompanied person'
    );

    expect(registry.relations).toEqual([theProposedRow({ id: 'existing' })]);
  });
});
