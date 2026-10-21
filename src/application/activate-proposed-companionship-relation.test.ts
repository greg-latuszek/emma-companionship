import { describe, expect, it, vi } from 'vitest';
import {
  activateProposedCompanionshipRelation,
  activateProposedCoupleCompanionshipRelations,
} from '@/application/activate-proposed-companionship-relation';
import { InMemoryCompanionshipRegistry } from '@/application/in-memory-companionship-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';

function aRegistryWithCoupleProposals(
  { withWifeProposal = true }: { withWifeProposal?: boolean } = {}
): InMemoryCompanionshipRegistry {
  return new InMemoryCompanionshipRegistry({
    relations: [
      { id: 'previous-h', companionId: 'old-ch', accompaniedId: 'ah', status: 'active' },
      { id: 'previous-w', companionId: 'old-cw', accompaniedId: 'aw', status: 'active' },
      { id: 'ph', companionId: 'ch', accompaniedId: 'ah', status: 'proposed' },
      ...(withWifeProposal
        ? [{ id: 'pw', companionId: 'cw', accompaniedId: 'aw', status: 'proposed' as const }]
        : []),
    ],
  });
}

describe('activateProposedCompanionshipRelation', () => {
  it('activateProposedCompanionshipRelation asks the repository to activate with start date and notes', async () => {
    const activated = {
      id: 'p1',
      companion_id: MemberId('c1'),
      accompanied_id: MemberId('a1'),
      status: 'active' as const,
      start_date: '2026-10-15',
      end_date: null,
      notes: 'agreed',
    };
    const relations = {
      activateProposedCompanionshipRelation: vi
        .fn()
        .mockResolvedValue(activated),
    } as unknown as ICompanionshipRelationRepository;

    const result = await activateProposedCompanionshipRelation(
      'p1',
      { start_date: '2026-10-15', notes: 'agreed' },
      relations
    );

    expect(result).toEqual(activated);
    expect(relations.activateProposedCompanionshipRelation).toHaveBeenCalledWith(
      'p1',
      { start_date: '2026-10-15', notes: 'agreed' }
    );
  });

  it('activateProposedCoupleCompanionshipRelations activates both spouse proposed rows together', async () => {
    const registry = aRegistryWithCoupleProposals();

    const [husbandRelation, wifeRelation] = await activateProposedCoupleCompanionshipRelations(
      'ph',
      'pw',
      { start_date: '2026-10-15', notes: null },
      registry,
      registry
    );

    expect(husbandRelation).toMatchObject({ id: 'ph', status: 'active', start_date: '2026-10-15' });
    expect(wifeRelation).toMatchObject({ id: 'pw', status: 'active', start_date: '2026-10-15' });
    expect(registry.relations.map((relation) => relation.id)).toEqual(['previous-h', 'previous-w', 'ph', 'pw']);
    expect(registry.relations.map((relation) => relation.status)).toEqual([
      'archived',
      'archived',
      'active',
      'active',
    ]);
  });

  it('activateProposedCoupleCompanionshipRelations keeps the husband proposed and the previous companion when the wife has no proposal', async () => {
    const registry = aRegistryWithCoupleProposals({ withWifeProposal: false });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      activateProposedCoupleCompanionshipRelations(
        'ph',
        'pw',
        { start_date: '2026-10-15', notes: null },
        registry,
        registry
      )
    ).rejects.toThrow('Failed to find proposed companionship relation');

    expect(registry.relations.map((relation) => [relation.id, relation.status])).toEqual([
      ['previous-h', 'active'],
      ['previous-w', 'active'],
      ['ph', 'proposed'],
    ]);
  });
});
