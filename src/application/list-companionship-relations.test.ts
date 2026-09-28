import { describe, expect, it, vi } from 'vitest';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';

function aCompanionshipRelation(
  overrides: Partial<CompanionshipRelation> = {}
): CompanionshipRelation {
  return {
    id: 'relation-1',
    companion_id: MemberId('companion-1'),
    accompanied_id: MemberId('accompanied-1'),
    status: 'active',
    start_date: '2024-01-10',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

function aCompanionshipRelationRepository(
  stubs: Partial<ICompanionshipRelationRepository> = {}
): ICompanionshipRelationRepository {
  return {
    listCompanionshipRelations: vi.fn(),
    ...stubs,
  };
}

describe('listCompanionshipRelations', () => {
  it('listCompanionshipRelations returns every stored relation', async () => {
    const first = aCompanionshipRelation();
    const second = aCompanionshipRelation({
      id: 'relation-2',
      companion_id: MemberId('companion-2'),
      accompanied_id: MemberId('accompanied-2'),
    });
    const relations = aCompanionshipRelationRepository({
      listCompanionshipRelations: vi.fn().mockResolvedValue([first, second]),
    });

    const listed = await listCompanionshipRelations(relations);

    expect(listed).toEqual([first, second]);
  });

  it('listCompanionshipRelations preserves archived relations', async () => {
    const archived = aCompanionshipRelation({ status: 'archived' });
    const relations = aCompanionshipRelationRepository({
      listCompanionshipRelations: vi.fn().mockResolvedValue([archived]),
    });

    const listed = await listCompanionshipRelations(relations);

    expect(listed[0]?.status).toBe('archived');
  });
});
