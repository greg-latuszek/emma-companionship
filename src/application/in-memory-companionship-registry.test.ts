import { describe, expect, it } from 'vitest';

import { InMemoryCompanionshipRegistry } from '@/application/in-memory-companionship-registry';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';

function aWrite(
  overrides: Partial<CompanionshipRelationWriteWithDefaults> = {}
): CompanionshipRelationWriteWithDefaults {
  return {
    companion_id: 'companion-1',
    accompanied_id: 'accompanied-1',
    status: 'active',
    start_date: null,
    end_date: null,
    notes: null,
    ...overrides,
  } as CompanionshipRelationWriteWithDefaults;
}

describe('InMemoryCompanionshipRegistry', () => {
  it('runAsAtomic keeps the rows written inside the block when the work succeeds', async () => {
    const registry = new InMemoryCompanionshipRegistry();

    await registry.runAsAtomic(async () => {
      await registry.addCompanionshipRelation(aWrite({ accompanied_id: 'husband-1' }));
      await registry.addCompanionshipRelation(aWrite({ accompanied_id: 'wife-1' }));
    });

    expect(registry.relations.map((relation) => relation.accompanied_id)).toEqual([
      'husband-1',
      'wife-1',
    ]);
  });

  it('runAsAtomic restores the rows when the work throws', async () => {
    const registry = new InMemoryCompanionshipRegistry({
      relations: [
        { id: 'relation-1', companionId: 'companion-1', accompaniedId: 'husband-1', status: 'active' },
      ],
    });
    const failure = new Error('wife row failed');

    await expect(
      registry.runAsAtomic(async () => {
        await registry.archiveActiveCompanionshipRelation('relation-1');
        await registry.addCompanionshipRelation(aWrite({ accompanied_id: 'husband-1' }));
        throw failure;
      })
    ).rejects.toBe(failure);

    expect(registry.relations).toHaveLength(1);
    expect(registry.relations[0]).toMatchObject({ id: 'relation-1', status: 'active', end_date: null });
  });

  it('runAsAtomic refuses a second block opened inside the first', async () => {
    const registry = new InMemoryCompanionshipRegistry();

    await expect(
      registry.runAsAtomic(async () => {
        await registry.runAsAtomic(async () => 'inner');
      })
    ).rejects.toThrow('An atomic block is already open');
  });
});
