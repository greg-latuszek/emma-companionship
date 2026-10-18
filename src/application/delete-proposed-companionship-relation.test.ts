import { describe, expect, it, vi } from 'vitest';
import {
  deleteProposedCompanionshipRelation,
  deleteProposedCoupleCompanionshipRelations,
} from '@/application/delete-proposed-companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';

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

  it('deleteProposedCoupleCompanionshipRelations asks the repository to delete both spouse proposed rows', async () => {
    const relations = {
      deleteProposedCompanionshipRelationPair: vi
        .fn()
        .mockResolvedValue(undefined),
    } as unknown as ICompanionshipRelationRepository;

    await deleteProposedCoupleCompanionshipRelations(
      'husband-proposal',
      'wife-proposal',
      relations
    );

    expect(
      relations.deleteProposedCompanionshipRelationPair
    ).toHaveBeenCalledWith('husband-proposal', 'wife-proposal');
  });
});
