import { describe, expect, it, vi } from 'vitest';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

function aParticipant(
  id: string,
  firstName: string,
  lastName: string
): CompanionshipRelationListItem['companion'] {
  return {
    id: MemberId(id),
    first_name: firstName,
    last_name: lastName,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}

function aCompanionshipRelationListItem(
  overrides: Partial<CompanionshipRelationListItem> = {}
): CompanionshipRelationListItem {
  return {
    id: 'relation-1',
    companion: aParticipant('companion-1', 'Anna', 'Nowak'),
    accompanied: aParticipant('accompanied-1', 'Piotr', 'Wiśniewski'),
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
    listPeopleWithoutCompanion: vi.fn(),
    findCompanionshipRelationById: vi.fn(),
    addCompanionshipRelation: vi.fn(),
    updateCompanionshipRelation: vi.fn(),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

describe('listCompanionshipRelations', () => {
  it('listCompanionshipRelations returns every stored relation', async () => {
    const first = aCompanionshipRelationListItem();
    const second = aCompanionshipRelationListItem({
      id: 'relation-2',
      companion: aParticipant('companion-2', 'Jan', 'Kowalski'),
      accompanied: aParticipant('accompanied-2', 'Maria', 'Zielińska'),
    });
    const relations = aCompanionshipRelationRepository({
      listCompanionshipRelations: vi.fn().mockResolvedValue([first, second]),
    });

    const listed = await listCompanionshipRelations(relations);

    expect(listed).toEqual([first, second]);
  });

  it('listCompanionshipRelations preserves archived relations', async () => {
    const archived = aCompanionshipRelationListItem({ status: 'archived' });
    const relations = aCompanionshipRelationRepository({
      listCompanionshipRelations: vi.fn().mockResolvedValue([archived]),
    });

    const listed = await listCompanionshipRelations(relations);

    expect(listed[0]?.status).toBe('archived');
  });
});
