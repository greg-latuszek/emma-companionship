import { describe, expect, it, vi } from 'vitest';
import {
  deleteProposedCompanionshipRelation,
  deleteProposedCoupleCompanionshipRelations,
} from '@/application/delete-proposed-companionship-relation';
import { InMemoryCompanionshipRegistry } from '@/adapters/db/in-memory/InMemoryCompanionshipRegistry';
import type { CompanionshipRelationStatus } from '@/types/companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';

function aRegistryWithTheCoupleProposals(
  wifeStatus: CompanionshipRelationStatus = 'proposed'
): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    relations: [
      { id: 'husband-proposal', companionId: 'ch', accompaniedId: 'ah', status: 'proposed' },
      { id: 'wife-proposal', companionId: 'cw', accompaniedId: 'aw', status: wifeStatus },
    ],
  });
}

describe('deleteProposedCompanionshipRelation', () => {
  it('deleteProposedCompanionshipRelation asks the repository to delete that proposed row', async () => {
    const relations = {
      deleteProposedCompanionshipRelation: vi.fn().mockResolvedValue(undefined),
    } as unknown as ICompanionshipRelationRepository;

    await deleteProposedCompanionshipRelation('proposal-1', relations);

    expect(relations.deleteProposedCompanionshipRelation).toHaveBeenCalledWith(
      'proposal-1'
    );
  });

  it('deleteProposedCoupleCompanionshipRelations removes both spouse proposed rows', async () => {
    const registry = aRegistryWithTheCoupleProposals();

    await deleteProposedCoupleCompanionshipRelations(
      'husband-proposal',
      'wife-proposal',
      registry,
      registry
    );

    expect(registry.relations).toEqual([]);
  });

  it('deleteProposedCoupleCompanionshipRelations keeps the husband proposal when the wife row is not proposed', async () => {
    const registry = aRegistryWithTheCoupleProposals('active');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      deleteProposedCoupleCompanionshipRelations(
        'husband-proposal',
        'wife-proposal',
        registry,
        registry
      )
    ).rejects.toThrow('Failed to delete proposed companionship relation');

    expect(registry.relations.map((relation) => relation.id)).toEqual([
      'husband-proposal',
      'wife-proposal',
    ]);
    expect(registry.relations[0].status).toBe('proposed');
  });
});
