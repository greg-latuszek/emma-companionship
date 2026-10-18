import { describe, expect, it, vi } from 'vitest';
import { listProposedCompanionshipRelationsForAccompanied } from '@/application/list-proposed-companionship-relations';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';

describe('listProposedCompanionshipRelationsForAccompanied', () => {
  it('listProposedCompanionshipRelationsForAccompanied returns proposed rows from the repository', async () => {
    const proposed = {
      id: 'p1',
      companion: {
        id: MemberId('c1'),
        first_name: 'Jan',
        last_name: 'Kowalski',
        marital_status: null,
        consecrated_status: null,
        community_engagement_status: null,
      },
      accompanied: {
        id: MemberId('a1'),
        first_name: 'Piotr',
        last_name: 'Nowak',
        marital_status: null,
        consecrated_status: null,
        community_engagement_status: null,
      },
      status: 'proposed' as const,
      start_date: null,
      end_date: null,
      notes: null,
    };
    const relations = {
      listProposedCompanionshipRelationsForAccompanied: vi
        .fn()
        .mockResolvedValue([proposed]),
    } as unknown as ICompanionshipRelationRepository;

    const result = await listProposedCompanionshipRelationsForAccompanied(
      ['a1'],
      relations
    );

    expect(result).toEqual([proposed]);
    expect(
      relations.listProposedCompanionshipRelationsForAccompanied
    ).toHaveBeenCalledWith(['a1']);
  });
});
