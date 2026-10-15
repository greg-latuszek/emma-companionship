import { describe, expect, it, vi } from 'vitest';
import {
  activateProposedCompanionshipRelation,
  activateProposedCoupleCompanionshipRelations,
} from '@/application/activate-proposed-companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';

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
    const activatedPair = [
      {
        id: 'ph',
        companion_id: MemberId('ch'),
        accompanied_id: MemberId('ah'),
        status: 'active' as const,
        start_date: '2026-10-15',
        end_date: null,
        notes: null,
      },
      {
        id: 'pw',
        companion_id: MemberId('cw'),
        accompanied_id: MemberId('aw'),
        status: 'active' as const,
        start_date: '2026-10-15',
        end_date: null,
        notes: null,
      },
    ] as const;
    const relations = {
      activateProposedCompanionshipRelationPair: vi
        .fn()
        .mockResolvedValue(activatedPair),
    } as unknown as ICompanionshipRelationRepository;

    const result = await activateProposedCoupleCompanionshipRelations(
      'ph',
      'pw',
      { start_date: '2026-10-15', notes: null },
      relations
    );

    expect(result).toEqual(activatedPair);
    expect(
      relations.activateProposedCompanionshipRelationPair
    ).toHaveBeenCalledWith('ph', 'pw', {
      start_date: '2026-10-15',
      notes: null,
    });
  });
});
