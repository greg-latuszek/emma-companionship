import { describe, expect, it, vi } from 'vitest';
import {
  addCompanionshipRelation,
  CompanionAndAccompaniedAreSamePerson,
} from '@/application/add-companionship-relation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';

function aCompanionshipRelationWrite(
  overrides: Partial<CompanionshipRelationWrite> = {}
): CompanionshipRelationWrite {
  return {
    companion_id: 'companion-1',
    accompanied_id: 'accompanied-1',
    status: undefined,
    start_date: null,
    end_date: null,
    notes: null,
    ...overrides,
  };
}

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
    findCompanionshipRelationById: vi.fn(),
    addCompanionshipRelation: vi.fn().mockResolvedValue(aCompanionshipRelation()),
    updateCompanionshipRelation: vi.fn(),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

describe('addCompanionshipRelation', () => {
  it('addCompanionshipRelation stores active status when the Delegate omits status', async () => {
    const relations = aCompanionshipRelationRepository();

    await addCompanionshipRelation(aCompanionshipRelationWrite(), relations);

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' })
    );
  });

  it('addCompanionshipRelation defaults start date to today when the Delegate omits it', async () => {
    const relations = aCompanionshipRelationRepository();
    const today = new Date().toISOString().slice(0, 10);

    await addCompanionshipRelation(aCompanionshipRelationWrite(), relations);

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ start_date: today })
    );
  });

  it('addCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const relations = aCompanionshipRelationRepository();
    const samePerson = 'member-1';

    await expect(
      addCompanionshipRelation(
        aCompanionshipRelationWrite({
          companion_id: samePerson,
          accompanied_id: samePerson,
        }),
        relations
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSamePerson);

    expect(relations.addCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('addCompanionshipRelation accepts when Delegate provides explicit start date', async () => {
    const relations = aCompanionshipRelationRepository();
    const explicitDate = '2024-02-15';

    await addCompanionshipRelation(
      aCompanionshipRelationWrite({ start_date: explicitDate }),
      relations
    );

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ start_date: explicitDate })
    );
  });

  it('addCompanionshipRelation accepts archived status when explicitly provided', async () => {
    const relations = aCompanionshipRelationRepository();

    await addCompanionshipRelation(
      aCompanionshipRelationWrite({ status: 'archived' }),
      relations
    );

    expect(relations.addCompanionshipRelation).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'archived' })
    );
  });
});
