import { describe, expect, it } from 'vitest';
import { deleteCompanionshipRelation } from '@/application/delete-companionship-relation';
import { InMemoryCompanionshipRegistry } from '@/application/in-memory-companionship-registry';
import { MemberId } from '@/types/auth';

const relationId = 'relation-1';

describe('deleteCompanionshipRelation', () => {
  it('deleteCompanionshipRelation removes the relation when it exists', async () => {
    const registry = new InMemoryCompanionshipRegistry({
      relations: [
        {
          id: relationId,
          companionId: 'companion-1',
          accompaniedId: 'accompanied-1',
          status: 'active',
          startDate: '2024-01-15',
          notes: null,
        },
      ],
    });

    await deleteCompanionshipRelation(relationId, registry);

    expect(registry.relations).toEqual([]);
  });

  it('deleteCompanionshipRelation refuses when relation does not exist', async () => {
    const registry = new InMemoryCompanionshipRegistry({
      relations: [
        {
          id: relationId,
          companionId: 'companion-1',
          accompaniedId: 'accompanied-1',
          status: 'active',
          startDate: '2024-01-15',
          notes: null,
        },
      ],
    });
    const missingId = 'non-existent';

    await expect(deleteCompanionshipRelation(missingId, registry)).rejects.toThrow(
      `Companionship relation with id ${missingId} not found`
    );

    expect(registry.relations).toEqual([
      {
        id: relationId,
        companion_id: MemberId('companion-1'),
        accompanied_id: MemberId('accompanied-1'),
        status: 'active',
        start_date: '2024-01-15',
        end_date: null,
        notes: null,
      },
    ]);
  });
});
