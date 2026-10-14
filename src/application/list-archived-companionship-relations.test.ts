import { describe, expect, it, vi } from 'vitest';
import { listArchivedCompanionshipRelations } from '@/application/list-archived-companionship-relations';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

function anArchivedRelation(): CompanionshipRelationListItem {
  return {
    id: 'archived-1',
    companion: {
      id: MemberId('c1'),
      first_name: 'Ada',
      last_name: 'Lovelace',
      marital_status: null,
      consecrated_status: null,
      community_engagement_status: null,
    },
    accompanied: {
      id: MemberId('a1'),
      first_name: 'Ala',
      last_name: 'Nowak',
      marital_status: null,
      consecrated_status: null,
      community_engagement_status: null,
    },
    status: 'archived',
    start_date: '2023-01-01',
    end_date: '2024-01-01',
    notes: null,
  };
}

describe('listArchivedCompanionshipRelations', () => {
  it('listArchivedCompanionshipRelations returns the archived relations from the repository', async () => {
    const archived = anArchivedRelation();
    const relations = {
      listArchivedCompanionshipRelations: vi.fn().mockResolvedValue([archived]),
    } as unknown as ICompanionshipRelationRepository;

    const result = await listArchivedCompanionshipRelations(relations);

    expect(result).toEqual([archived]);
    expect(relations.listArchivedCompanionshipRelations).toHaveBeenCalled();
  });
});
