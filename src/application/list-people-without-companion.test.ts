import { describe, expect, it, vi } from 'vitest';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';

function aPersonWithoutCompanion(
  overrides: Partial<PersonWithoutCompanion> = {}
): PersonWithoutCompanion {
  return {
    id: MemberId('member-1'),
    first_name: 'Piotr',
    last_name: 'Wiśniewski',
    marital_status: 'single',
    consecrated_status: null,
    community_engagement_status: 'Commited',
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

describe('listPeopleWithoutCompanion', () => {
  it('listPeopleWithoutCompanion returns the people the repository found waiting for a companion', async () => {
    const piotr = aPersonWithoutCompanion();
    const maria = aPersonWithoutCompanion({
      id: MemberId('member-2'),
      first_name: 'Maria',
      last_name: 'Zielińska',
      community_engagement_status: null,
    });
    const relations = aCompanionshipRelationRepository({
      listPeopleWithoutCompanion: vi.fn().mockResolvedValue([piotr, maria]),
    });

    const people = await listPeopleWithoutCompanion(relations);

    expect(people).toEqual([piotr, maria]);
  });
});
