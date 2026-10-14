import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as addCompanionshipRelationModule from '@/application/add-companionship-relation';
import * as addCoupleCompanionshipRelationsModule from '@/application/add-couple-companionship-relations';
import * as saveEditedCompanionshipRelationModule from '@/application/save-edited-companionship-relation';
import * as saveEditedCoupleCompanionshipRelationsModule from '@/application/save-edited-couple-companionship-relations';
import * as deleteCompanionshipRelationModule from '@/application/delete-companionship-relation';
import {
  submitNewCompanionshipRelation,
  submitEditCompanionshipRelation,
  submitDeleteCompanionshipRelation,
} from './actions';

function aPersonCompanionshipFormData(
  overrides: Record<string, string> = {}
): FormData {
  const formData = new FormData();
  formData.set('accompanied_kind', 'person');
  formData.set('companion_kind', 'person');
  formData.set('companion_id', '550e8400-e29b-41d4-a716-446655440000');
  formData.set('accompanied_id', '550e8400-e29b-41d4-a716-446655440001');
  formData.set('start_date', '2024-01-15');
  formData.set('end_date', '');
  formData.set('notes', '');
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/application/add-companionship-relation', () => ({
  addCompanionshipRelation: vi.fn(),
  isCompanionAndAccompaniedAreSamePerson: vi.fn(),
  isCompanionAndAccompaniedHaveDifferentGenders: vi.fn(),
  CompanionAndAccompaniedAreSamePerson: class CompanionAndAccompaniedAreSamePerson extends Error {},
  CompanionAndAccompaniedHaveDifferentGenders: class CompanionAndAccompaniedHaveDifferentGenders extends Error {},
}));

vi.mock('@/application/add-couple-companionship-relations', () => ({
  addCoupleCompanionshipRelations: vi.fn(),
  isCompanionAndAccompaniedAreSameCouple: vi.fn(),
  isCoupleCompanionshipParticipantsAreNotEligible: vi.fn(),
  CompanionAndAccompaniedAreSameCouple: class CompanionAndAccompaniedAreSameCouple extends Error {},
  CoupleCompanionshipParticipantsAreNotEligible: class CoupleCompanionshipParticipantsAreNotEligible extends Error {},
}));

vi.mock('@/application/save-edited-companionship-relation', () => ({
  saveEditedCompanionshipRelation: vi.fn(),
  isCompanionAndAccompaniedAreSamePerson: vi.fn(),
  isCompanionAndAccompaniedHaveDifferentGenders: vi.fn(),
  isCompanionshipRelationNotFound: vi.fn(),
  CompanionAndAccompaniedAreSamePerson: class CompanionAndAccompaniedAreSamePerson extends Error {},
  CompanionAndAccompaniedHaveDifferentGenders: class CompanionAndAccompaniedHaveDifferentGenders extends Error {},
  CompanionshipRelationNotFound: class CompanionshipRelationNotFound extends Error {},
}));

vi.mock('@/application/save-edited-couple-companionship-relations', () => ({
  saveEditedCoupleCompanionshipRelations: vi.fn(),
  isCompanionAndAccompaniedAreSameCouple: vi.fn(),
  isCoupleCompanionshipParticipantsAreNotEligible: vi.fn(),
  isCompanionshipRelationNotFound: vi.fn(),
  CompanionAndAccompaniedAreSameCouple: class CompanionAndAccompaniedAreSameCouple extends Error {},
  CoupleCompanionshipParticipantsAreNotEligible: class CoupleCompanionshipParticipantsAreNotEligible extends Error {},
  CompanionshipRelationNotFound: class CompanionshipRelationNotFound extends Error {},
}));

vi.mock('@/application/delete-companionship-relation', () => ({
  deleteCompanionshipRelation: vi.fn(),
  isCompanionshipRelationNotFound: vi.fn(),
  CompanionshipRelationNotFound: class CompanionshipRelationNotFound extends Error {},
}));

describe('submitNewCompanionshipRelation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (addCompanionshipRelationModule.addCompanionshipRelation as Mock).mockResolvedValue(undefined);
    (addCoupleCompanionshipRelationsModule.addCoupleCompanionshipRelations as Mock).mockResolvedValue(
      undefined
    );
    vi.mocked(addCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson).mockReturnValue(false);
    vi.mocked(addCompanionshipRelationModule.isCompanionAndAccompaniedHaveDifferentGenders).mockReturnValue(false);
    vi.mocked(addCoupleCompanionshipRelationsModule.isCompanionAndAccompaniedAreSameCouple).mockReturnValue(false);
    vi.mocked(
      addCoupleCompanionshipRelationsModule.isCoupleCompanionshipParticipantsAreNotEligible
    ).mockReturnValue(false);
  });

  it('submitNewCompanionshipRelation accepts valid person data and redirects to the list', async () => {
    await submitNewCompanionshipRelation(undefined, aPersonCompanionshipFormData());

    expect(addCompanionshipRelationModule.addCompanionshipRelation).toHaveBeenCalledWith({
      companion_id: '550e8400-e29b-41d4-a716-446655440000',
      accompanied_id: '550e8400-e29b-41d4-a716-446655440001',
      start_date: '2024-01-15',
      end_date: null,
      notes: null,
    });
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitNewCompanionshipRelation accepts couple-to-couple data and writes both relations', async () => {
    const formData = aPersonCompanionshipFormData({
      accompanied_kind: 'couple',
      companion_kind: 'couple',
      companion_id: '550e8400-e29b-41d4-a716-446655440010',
      accompanied_id: '550e8400-e29b-41d4-a716-446655440020',
    });

    await submitNewCompanionshipRelation(undefined, formData);

    expect(
      addCoupleCompanionshipRelationsModule.addCoupleCompanionshipRelations
    ).toHaveBeenCalledWith({
      companion_couple_id: '550e8400-e29b-41d4-a716-446655440010',
      accompanied_couple_id: '550e8400-e29b-41d4-a716-446655440020',
      start_date: '2024-01-15',
      end_date: null,
      notes: null,
    });
    expect(addCompanionshipRelationModule.addCompanionshipRelation).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitNewCompanionshipRelation refuses when the companion couple is the accompanied couple', async () => {
    vi.mocked(
      addCoupleCompanionshipRelationsModule.isCompanionAndAccompaniedAreSameCouple
    ).mockReturnValue(true);
    (
      addCoupleCompanionshipRelationsModule.addCoupleCompanionshipRelations as Mock
    ).mockRejectedValue(
      new addCoupleCompanionshipRelationsModule.CompanionAndAccompaniedAreSameCouple()
    );

    const sameCouple = '550e8400-e29b-41d4-a716-446655440010';
    const result = await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData({
        accompanied_kind: 'couple',
        companion_kind: 'couple',
        companion_id: sameCouple,
        accompanied_id: sameCouple,
      })
    );

    expect(result.formError).toBe(
      'Akompaniator i akompaniowany nie mogą być tym samym małżeństwem.'
    );
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation refuses missing companion', async () => {
    const result = await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData({ companion_id: '' })
    );

    expect(result.fieldErrors?.companion_id).toBeDefined();
    expect(addCompanionshipRelationModule.addCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation refuses when companion and accompanied are the same', async () => {
    vi.mocked(addCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson).mockReturnValue(true);
    (addCompanionshipRelationModule.addCompanionshipRelation as Mock).mockRejectedValue(
      new addCompanionshipRelationModule.CompanionAndAccompaniedAreSamePerson()
    );

    const samePerson = '550e8400-e29b-41d4-a716-446655440000';
    const result = await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData({
        companion_id: samePerson,
        accompanied_id: samePerson,
      })
    );

    expect(result.formError).toBe('Akompaniator i akompaniowany nie mogą być tą samą osobą.');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation refuses when companion and accompanied have different genders', async () => {
    vi.mocked(addCompanionshipRelationModule.isCompanionAndAccompaniedHaveDifferentGenders).mockReturnValue(true);
    (addCompanionshipRelationModule.addCompanionshipRelation as Mock).mockRejectedValue(
      new addCompanionshipRelationModule.CompanionAndAccompaniedHaveDifferentGenders()
    );

    const result = await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData()
    );

    expect(result.formError).toBe('Akompaniator i akompaniowany muszą być tej samej płci.');
    expect(result.values?.companion_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.values?.accompanied_id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result.restoreKey).toEqual(expect.any(String));
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation returns to Brakujące Akompaniamenty when the relation was started there', async () => {
    await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData({ return_tab: 'missing' })
    );

    expect(redirect).toHaveBeenCalledWith('/app/companionships?tab=missing');
  });

  it('submitNewCompanionshipRelation returns to Utworzone Akompaniamenty when started from the add button', async () => {
    await submitNewCompanionshipRelation(undefined, aPersonCompanionshipFormData());

    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitNewCompanionshipRelation refuses invalid date format', async () => {
    const result = await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData({ start_date: 'not-a-date' })
    );

    expect(result.fieldErrors?.start_date).toBeDefined();
    expect(addCompanionshipRelationModule.addCompanionshipRelation).not.toHaveBeenCalled();
  });
});

describe('submitEditCompanionshipRelation', () => {
  const lockedAccompaniedId = '550e8400-e29b-41d4-a716-446655440001';

  function anEditPersonFormData(
    overrides: Record<string, string> = {}
  ): FormData {
    const formData = new FormData();
    formData.set('accompanied_kind', 'person');
    formData.set('companion_kind', 'person');
    formData.set('companion_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.set('accompanied_id', lockedAccompaniedId);
    formData.set('start_date', '2024-01-15');
    formData.set('end_date', '');
    formData.set('notes', '');
    for (const [key, value] of Object.entries(overrides)) {
      formData.set(key, value);
    }
    return formData;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      saveEditedCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson
    ).mockReturnValue(false);
    vi.mocked(
      saveEditedCompanionshipRelationModule.isCompanionAndAccompaniedHaveDifferentGenders
    ).mockReturnValue(false);
    vi.mocked(
      saveEditedCompanionshipRelationModule.isCompanionshipRelationNotFound
    ).mockReturnValue(false);
    (
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation as Mock
    ).mockResolvedValue(undefined);
  });

  it('submitEditCompanionshipRelation accepts valid person data and redirects to the list', async () => {
    const relationId = 'relation-123';
    await submitEditCompanionshipRelation(
      relationId,
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData({ notes: 'Updated notes' })
    );

    expect(
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation
    ).toHaveBeenCalledWith(relationId, {
      companion_id: '550e8400-e29b-41d4-a716-446655440000',
      accompanied_id: lockedAccompaniedId,
      start_date: '2024-01-15',
      end_date: null,
      notes: 'Updated notes',
    });
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitEditCompanionshipRelation keeps the locked Accompanied when the form posts another person', async () => {
    const relationId = 'relation-123';
    await submitEditCompanionshipRelation(
      relationId,
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData({
        accompanied_id: '550e8400-e29b-41d4-a716-446655440099',
      })
    );

    expect(
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation
    ).toHaveBeenCalledWith(
      relationId,
      expect.objectContaining({ accompanied_id: lockedAccompaniedId })
    );
  });

  it('submitEditCompanionshipRelation saves couple edits through the couple save use case', async () => {
    (
      saveEditedCoupleCompanionshipRelationsModule.saveEditedCoupleCompanionshipRelations as Mock
    ).mockResolvedValue(undefined);

    await submitEditCompanionshipRelation(
      'relation-ignored',
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData({
        accompanied_kind: 'couple',
        companion_kind: 'couple',
        companion_id: '550e8400-e29b-41d4-a716-446655440010',
        accompanied_id: '550e8400-e29b-41d4-a716-446655440020',
        husband_relation_id: 'rel-h',
        wife_relation_id: 'rel-w',
      })
    );

    expect(
      saveEditedCoupleCompanionshipRelationsModule.saveEditedCoupleCompanionshipRelations
    ).toHaveBeenCalledWith('rel-h', 'rel-w', {
      companion_couple_id: '550e8400-e29b-41d4-a716-446655440010',
      accompanied_couple_id: '550e8400-e29b-41d4-a716-446655440020',
      start_date: '2024-01-15',
      end_date: null,
      notes: null,
    });
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitEditCompanionshipRelation refuses when companion and accompanied are the same', async () => {
    vi.mocked(
      saveEditedCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson
    ).mockReturnValue(true);
    (
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation as Mock
    ).mockRejectedValue(
      new saveEditedCompanionshipRelationModule.CompanionAndAccompaniedAreSamePerson()
    );

    const result = await submitEditCompanionshipRelation(
      'relation-123',
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData({
        companion_id: lockedAccompaniedId,
        accompanied_id: lockedAccompaniedId,
      })
    );

    expect(result.formError).toBe(
      'Akompaniator i akompaniowany nie mogą być tą samą osobą.'
    );
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitEditCompanionshipRelation refuses when companion and accompanied have different genders', async () => {
    vi.mocked(
      saveEditedCompanionshipRelationModule.isCompanionAndAccompaniedHaveDifferentGenders
    ).mockReturnValue(true);
    (
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation as Mock
    ).mockRejectedValue(
      new saveEditedCompanionshipRelationModule.CompanionAndAccompaniedHaveDifferentGenders()
    );

    const result = await submitEditCompanionshipRelation(
      'relation-123',
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData()
    );

    expect(result.formError).toBe(
      'Akompaniator i akompaniowany muszą być tej samej płci.'
    );
    expect(result.values?.companion_id).toBe(
      '550e8400-e29b-41d4-a716-446655440000'
    );
    expect(result.values?.accompanied_id).toBe(lockedAccompaniedId);
    expect(result.restoreKey).toEqual(expect.any(String));
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitEditCompanionshipRelation refuses when relation does not exist', async () => {
    vi.mocked(
      saveEditedCompanionshipRelationModule.isCompanionshipRelationNotFound
    ).mockReturnValue(true);
    (
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation as Mock
    ).mockRejectedValue(
      new saveEditedCompanionshipRelationModule.CompanionshipRelationNotFound(
        'relation-123'
      )
    );

    const result = await submitEditCompanionshipRelation(
      'relation-123',
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData()
    );

    expect(result.formError).toBe('Akompaniament nie został znaleziony.');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitEditCompanionshipRelation refuses invalid data', async () => {
    const result = await submitEditCompanionshipRelation(
      'relation-123',
      lockedAccompaniedId,
      undefined,
      anEditPersonFormData({ companion_id: '' })
    );

    expect(result.fieldErrors?.companion_id).toBeDefined();
    expect(
      saveEditedCompanionshipRelationModule.saveEditedCompanionshipRelation
    ).not.toHaveBeenCalled();
  });
});

describe('submitDeleteCompanionshipRelation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteCompanionshipRelationModule.isCompanionshipRelationNotFound).mockReturnValue(false);
  });

  it('submitDeleteCompanionshipRelation deletes the relation and revalidates', async () => {
    const relationId = 'relation-123';

    const result = await submitDeleteCompanionshipRelation(relationId);

    expect(result.success).toBe(true);
    expect(deleteCompanionshipRelationModule.deleteCompanionshipRelation).toHaveBeenCalledWith(relationId);
    expect(revalidatePath).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitDeleteCompanionshipRelation returns error when relation does not exist', async () => {
    vi.mocked(deleteCompanionshipRelationModule.isCompanionshipRelationNotFound).mockReturnValue(true);
    (deleteCompanionshipRelationModule.deleteCompanionshipRelation as Mock).mockRejectedValue(
      new deleteCompanionshipRelationModule.CompanionshipRelationNotFound('relation-123')
    );

    const relationId = 'relation-123';

    const result = await submitDeleteCompanionshipRelation(relationId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Akompaniament nie został znaleziony.');
  });

  it('submitDeleteCompanionshipRelation returns error on failure', async () => {
    (deleteCompanionshipRelationModule.deleteCompanionshipRelation as Mock).mockRejectedValue(
      new Error('Database error')
    );

    const relationId = 'relation-123';

    const result = await submitDeleteCompanionshipRelation(relationId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Nie udało się usunąć akompaniamentu. Spróbuj ponownie.');
  });
});
