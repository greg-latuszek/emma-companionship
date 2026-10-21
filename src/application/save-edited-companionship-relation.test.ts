import { describe, expect, it, vi } from 'vitest';
import { saveEditedCompanionshipRelation } from '@/application/save-edited-companionship-relation';
import {
  InMemoryCompanionshipRegistry,
  type SeededCompanionshipRelation,
} from '@/adapters/db/in-memory/InMemoryCompanionshipRegistry';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';

const relationId = 'relation-1';
const companionId = '550e8400-e29b-41d4-a716-446655440010';
const accompaniedId = '550e8400-e29b-41d4-a716-446655440020';

function aWrite(overrides: Partial<CompanionshipRelationWrite> = {}): CompanionshipRelationWrite {
  return {
    companion_id: companionId,
    accompanied_id: accompaniedId,
    status: undefined,
    start_date: '2024-06-01',
    end_date: null,
    notes: 'ok',
    ...overrides,
  };
}

function theActiveRelation(
  overrides: Partial<SeededCompanionshipRelation> = {}
): SeededCompanionshipRelation {
  return {
    id: relationId,
    companionId,
    accompaniedId,
    status: 'active',
    startDate: '2024-01-01',
    endDate: null,
    notes: null,
    ...overrides,
  };
}

function storedRelation(overrides: Partial<CompanionshipRelation> = {}): CompanionshipRelation {
  return {
    id: relationId,
    companion_id: MemberId(companionId),
    accompanied_id: MemberId(accompaniedId),
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aRegistryWith(
  relation: SeededCompanionshipRelation,
  memberIds: string[] = [companionId, accompaniedId]
): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    members: memberIds.map((id) => ({ id, gender: 'female' })),
    relations: [relation],
  });
}

describe('saveEditedCompanionshipRelation', () => {
  it('saveEditedCompanionshipRelation updates the active row in place when the Companion stays the same', async () => {
    const registry = aRegistryWith(theActiveRelation());

    await saveEditedCompanionshipRelation(
      relationId,
      aWrite({ notes: 'works well' }),
      registry,
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      storedRelation({
        start_date: '2024-06-01',
        notes: 'works well',
      }),
    ]);
  });

  it('saveEditedCompanionshipRelation archives the active row and adds a replacement when the Companion changes', async () => {
    const newCompanionId = '550e8400-e29b-41d4-a716-446655440099';
    const registry = aRegistryWith(theActiveRelation(), [
      companionId,
      accompaniedId,
      newCompanionId,
    ]);
    const today = new Date().toISOString().slice(0, 10);

    await saveEditedCompanionshipRelation(
      relationId,
      aWrite({ companion_id: newCompanionId }),
      registry,
      registry,
      registry
    );

    expect(registry.relations).toEqual([
      storedRelation({
        status: 'archived',
        end_date: today,
      }),
      {
        id: 'relation-2',
        companion_id: MemberId(newCompanionId),
        accompanied_id: MemberId(accompaniedId),
        status: 'active',
        start_date: '2024-06-01',
        end_date: null,
        notes: 'ok',
      },
    ]);
  });

  it('saveEditedCompanionshipRelation refuses when the relation is missing or not active', async () => {
    const archived = aRegistryWith(
      theActiveRelation({ status: 'archived', endDate: '2024-05-01' })
    );

    await expect(
      saveEditedCompanionshipRelation(relationId, aWrite(), archived, archived)
    ).rejects.toThrow(`Companionship relation with id ${relationId} not found`);

    expect(archived.relations).toEqual([
      storedRelation({ status: 'archived', end_date: '2024-05-01' }),
    ]);

    const missing = new InMemoryCompanionshipRegistry({
      members: [
        { id: companionId, gender: 'female' },
        { id: accompaniedId, gender: 'female' },
      ],
    });

    await expect(
      saveEditedCompanionshipRelation(relationId, aWrite(), missing, missing)
    ).rejects.toThrow(`Companionship relation with id ${relationId} not found`);

    expect(missing.relations).toEqual([]);
  });

  it('saveEditedCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const registry = aRegistryWith(theActiveRelation());

    await expect(
      saveEditedCompanionshipRelation(
        relationId,
        aWrite({ companion_id: accompaniedId, accompanied_id: accompaniedId }),
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('The companion and the accompanied person cannot be the same');

    expect(registry.relations).toEqual([storedRelation()]);
  });

  it('saveEditedCompanionshipRelation keeps the active row when the replacement cannot be stored', async () => {
    const registry = aRegistryWith(theActiveRelation());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(registry, 'addCompanionshipRelation').mockRejectedValueOnce(
      new Error('replacement failed')
    );

    await expect(
      saveEditedCompanionshipRelation(
        relationId,
        aWrite({ companion_id: '550e8400-e29b-41d4-a716-446655440011' }),
        registry,
        registry,
        registry
      )
    ).rejects.toThrow('replacement failed');

    expect(registry.relations).toEqual([storedRelation()]);
  });
});
