import { describe, expect, it, vi } from 'vitest';
import {
  updateCompanionshipRelation,
  CompanionAndAccompaniedAreSamePerson,
  CompanionshipRelationNotFound,
} from '@/application/update-companionship-relation';
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
    findCompanionshipRelationById: vi
      .fn()
      .mockResolvedValue(aCompanionshipRelation()),
    addCompanionshipRelation: vi.fn().mockResolvedValue(aCompanionshipRelation()),
    updateCompanionshipRelation: vi
      .fn()
      .mockResolvedValue(aCompanionshipRelation()),
    deleteCompanionshipRelation: vi.fn(),
    ...stubs,
  };
}

describe('updateCompanionshipRelation', () => {
  it('updateCompanionshipRelation updates the relation when it exists', async () => {
    const relations = aCompanionshipRelationRepository();
    const relationId = 'relation-1';

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite(),
      relations
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({ status: 'active' })
    );
  });

  it('updateCompanionshipRelation refuses when companion and accompanied are the same person', async () => {
    const relations = aCompanionshipRelationRepository();
    const relationId = 'relation-1';
    const samePerson = 'member-1';

    await expect(
      updateCompanionshipRelation(
        relationId,
        aCompanionshipRelationWrite({
          companion_id: samePerson,
          accompanied_id: samePerson,
        }),
        relations
      )
    ).rejects.toBeInstanceOf(CompanionAndAccompaniedAreSamePerson);

    expect(relations.updateCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('updateCompanionshipRelation refuses when relation does not exist', async () => {
    const relations = aCompanionshipRelationRepository({
      findCompanionshipRelationById: vi.fn().mockResolvedValue(null),
    });
    const relationId = 'non-existent';

    await expect(
      updateCompanionshipRelation(
        relationId,
        aCompanionshipRelationWrite(),
        relations
      )
    ).rejects.toBeInstanceOf(CompanionshipRelationNotFound);

    expect(relations.updateCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('updateCompanionshipRelation defaults start date to today when omitted', async () => {
    const relations = aCompanionshipRelationRepository();
    const relationId = 'relation-1';
    const today = new Date().toISOString().slice(0, 10);

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite(),
      relations
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({ start_date: today })
    );
  });

  it('updateCompanionshipRelation accepts when Delegate provides explicit values', async () => {
    const relations = aCompanionshipRelationRepository();
    const relationId = 'relation-1';
    const explicitDate = '2024-02-15';

    await updateCompanionshipRelation(
      relationId,
      aCompanionshipRelationWrite({
        start_date: explicitDate,
        status: 'archived',
        notes: 'Ended early',
      }),
      relations
    );

    expect(relations.updateCompanionshipRelation).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({
        start_date: explicitDate,
        status: 'archived',
        notes: 'Ended early',
      })
    );
  });
});
