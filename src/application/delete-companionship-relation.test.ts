import { describe, expect, it, vi } from 'vitest';
import {
  deleteCompanionshipRelation,
  CompanionshipRelationNotFound,
} from '@/application/delete-companionship-relation';
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
    start_date: '2024-01-15',
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
    listPeopleWithoutCompanion: vi.fn(),
    findCompanionshipRelationById: vi
      .fn()
      .mockResolvedValue(aCompanionshipRelation()),
    addCompanionshipRelation: vi.fn(),
    updateCompanionshipRelation: vi.fn(),
    deleteCompanionshipRelation: vi.fn().mockResolvedValue(undefined),
    ...stubs,
  };
}

describe('deleteCompanionshipRelation', () => {
  it('deleteCompanionshipRelation removes the relation when it exists', async () => {
    const relations = aCompanionshipRelationRepository();
    const relationId = 'relation-1';

    await deleteCompanionshipRelation(relationId, relations);

    expect(relations.deleteCompanionshipRelation).toHaveBeenCalledWith(
      relationId
    );
  });

  it('deleteCompanionshipRelation refuses when relation does not exist', async () => {
    const relations = aCompanionshipRelationRepository({
      findCompanionshipRelationById: vi.fn().mockResolvedValue(null),
    });
    const relationId = 'non-existent';

    await expect(
      deleteCompanionshipRelation(relationId, relations)
    ).rejects.toBeInstanceOf(CompanionshipRelationNotFound);

    expect(relations.deleteCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('deleteCompanionshipRelation checks existence before deleting', async () => {
    const relations = aCompanionshipRelationRepository();
    const relationId = 'relation-1';

    await deleteCompanionshipRelation(relationId, relations);

    expect(relations.findCompanionshipRelationById).toHaveBeenCalledWith(
      relationId
    );
    expect(relations.deleteCompanionshipRelation).toHaveBeenCalledWith(
      relationId
    );
  });
});
