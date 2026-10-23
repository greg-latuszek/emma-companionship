import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as addCompanionshipRelationModule from '@/application/add-companionship-relation';
import * as addCoupleCompanionshipRelationsModule from '@/application/add-couple-companionship-relations';
import * as saveEditedCompanionshipRelationModule from '@/application/save-edited-companionship-relation';
import * as saveEditedCoupleCompanionshipRelationsModule from '@/application/save-edited-couple-companionship-relations';
import * as deleteCompanionshipRelationModule from '@/application/delete-companionship-relation';
import * as addProposedCompanionshipRelationModule from '@/application/add-proposed-companionship-relation';
import * as addProposedCoupleCompanionshipRelationsModule from '@/application/add-proposed-couple-companionship-relations';
import * as deleteProposedCompanionshipRelationModule from '@/application/delete-proposed-companionship-relation';
import * as activateProposedCompanionshipRelationModule from '@/application/activate-proposed-companionship-relation';
import {
  submitNewCompanionshipRelation,
  submitEditCompanionshipRelation,
  submitDeleteCompanionshipRelation,
  submitRememberProposedCompanionship,
  submitDeleteProposedCompanionship,
  submitActivateProposedCompanionshipFromFind,
} from './actions';
import { messageRef } from '@/i18n/translator';

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

vi.mock('@/application/add-proposed-companionship-relation', () => ({
  addProposedCompanionshipRelation: vi.fn(),
  isCompanionAndAccompaniedAreSamePerson: vi.fn(),
  isCompanionAndAccompaniedHaveDifferentGenders: vi.fn(),
  isProposedCompanionshipAlreadyExists: vi.fn(),
  CompanionAndAccompaniedAreSamePerson: class CompanionAndAccompaniedAreSamePerson extends Error {},
  CompanionAndAccompaniedHaveDifferentGenders: class CompanionAndAccompaniedHaveDifferentGenders extends Error {},
  ProposedCompanionshipAlreadyExists: class ProposedCompanionshipAlreadyExists extends Error {},
}));

vi.mock('@/application/add-proposed-couple-companionship-relations', () => ({
  addProposedCoupleCompanionshipRelations: vi.fn(),
  isCompanionAndAccompaniedAreSameCouple: vi.fn(),
  isCoupleCompanionshipParticipantsAreNotEligible: vi.fn(),
  isProposedCompanionshipAlreadyExists: vi.fn(),
  CompanionAndAccompaniedAreSameCouple: class CompanionAndAccompaniedAreSameCouple extends Error {},
  CoupleCompanionshipParticipantsAreNotEligible: class CoupleCompanionshipParticipantsAreNotEligible extends Error {},
}));

vi.mock('@/application/delete-proposed-companionship-relation', () => ({
  deleteProposedCompanionshipRelation: vi.fn(),
  deleteProposedCoupleCompanionshipRelations: vi.fn(),
}));

vi.mock('@/application/activate-proposed-companionship-relation', () => ({
  activateProposedCompanionshipRelation: vi.fn(),
  activateProposedCoupleCompanionshipRelations: vi.fn(),
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

    expect(result.formError).toEqual(
      messageRef('companionshipError.sameCouple')
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

    expect(result.formError).toEqual(messageRef('companionshipError.samePerson'));
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

    expect(result.formError).toEqual(messageRef('companionshipError.differentGenders'));
    expect(result.values?.companion_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.values?.accompanied_id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result.restoreKey).toEqual(expect.any(String));
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation returns to Missing Companionships when the relation was started there', async () => {
    await submitNewCompanionshipRelation(
      undefined,
      aPersonCompanionshipFormData({ return_tab: 'missing' })
    );

    expect(redirect).toHaveBeenCalledWith('/app/companionships?tab=missing');
  });

  it('submitNewCompanionshipRelation returns to Created Companionships when started from the add button', async () => {
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

    expect(result.formError).toEqual(
      messageRef('companionshipError.samePerson')
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

    expect(result.formError).toEqual(
      messageRef('companionshipError.differentGenders')
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

    expect(result.formError).toEqual(messageRef('companionshipError.notFound'));
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
    expect(result.error).toEqual(messageRef('companionshipError.notFound'));
  });

  it('submitDeleteCompanionshipRelation returns error on failure', async () => {
    (deleteCompanionshipRelationModule.deleteCompanionshipRelation as Mock).mockRejectedValue(
      new Error('Database error')
    );

    const relationId = 'relation-123';

    const result = await submitDeleteCompanionshipRelation(relationId);

    expect(result.success).toBe(false);
    expect(result.error).toEqual(messageRef('companionshipError.deleteFailed'));
  });
});

describe('submitRememberProposedCompanionship', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      addProposedCompanionshipRelationModule.addProposedCompanionshipRelation as Mock
    ).mockResolvedValue(undefined);
    (
      addProposedCoupleCompanionshipRelationsModule.addProposedCoupleCompanionshipRelations as Mock
    ).mockResolvedValue(undefined);
    vi.mocked(
      addProposedCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson
    ).mockReturnValue(false);
    vi.mocked(
      addProposedCompanionshipRelationModule.isCompanionAndAccompaniedHaveDifferentGenders
    ).mockReturnValue(false);
    vi.mocked(
      addProposedCompanionshipRelationModule.isProposedCompanionshipAlreadyExists
    ).mockReturnValue(false);
    vi.mocked(
      addProposedCoupleCompanionshipRelationsModule.isCompanionAndAccompaniedAreSameCouple
    ).mockReturnValue(false);
    vi.mocked(
      addProposedCoupleCompanionshipRelationsModule.isCoupleCompanionshipParticipantsAreNotEligible
    ).mockReturnValue(false);
    vi.mocked(
      addProposedCoupleCompanionshipRelationsModule.isProposedCompanionshipAlreadyExists
    ).mockReturnValue(false);
  });

  it('submitRememberProposedCompanionship remembers a person proposal and returns to Find', async () => {
    await submitRememberProposedCompanionship(
      undefined,
      aPersonCompanionshipFormData()
    );

    expect(
      addProposedCompanionshipRelationModule.addProposedCompanionshipRelation
    ).toHaveBeenCalledWith({
      companion_id: '550e8400-e29b-41d4-a716-446655440000',
      accompanied_id: '550e8400-e29b-41d4-a716-446655440001',
      start_date: null,
      end_date: null,
      notes: null,
    });
    expect(redirect).toHaveBeenCalledWith(
      '/app/companionships?tab=find&accompanied=550e8400-e29b-41d4-a716-446655440001'
    );
  });

  it('submitRememberProposedCompanionship keeps the change-companion entry after remembering', async () => {
    await submitRememberProposedCompanionship(
      undefined,
      aPersonCompanionshipFormData({ change: 'active-relation-1' })
    );

    expect(redirect).toHaveBeenCalledWith(
      '/app/companionships?tab=find&change=active-relation-1'
    );
  });

  it('submitRememberProposedCompanionship refuses a duplicate person proposal', async () => {
    (
      addProposedCompanionshipRelationModule.addProposedCompanionshipRelation as Mock
    ).mockRejectedValue(
      new addProposedCompanionshipRelationModule.ProposedCompanionshipAlreadyExists()
    );
    vi.mocked(
      addProposedCompanionshipRelationModule.isProposedCompanionshipAlreadyExists
    ).mockReturnValue(true);

    const result = await submitRememberProposedCompanionship(
      undefined,
      aPersonCompanionshipFormData()
    );

    expect(result.formError).toEqual(
      messageRef('companionshipError.proposalAlreadyRemembered')
    );
  });
});

describe('submitDeleteProposedCompanionship', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      deleteProposedCompanionshipRelationModule.deleteProposedCompanionshipRelation as Mock
    ).mockResolvedValue(undefined);
    (
      deleteProposedCompanionshipRelationModule.deleteProposedCoupleCompanionshipRelations as Mock
    ).mockResolvedValue(undefined);
  });

  it('submitDeleteProposedCompanionship removes a person proposal and refreshes companionships', async () => {
    const formData = new FormData();
    formData.set('proposal_kind', 'person');
    formData.set('proposal_id', 'proposal-1');

    const result = await submitDeleteProposedCompanionship(formData);

    expect(
      deleteProposedCompanionshipRelationModule.deleteProposedCompanionshipRelation
    ).toHaveBeenCalledWith('proposal-1');
    expect(revalidatePath).toHaveBeenCalledWith('/app/companionships');
    expect(result).toEqual({ success: true });
  });
});

describe('submitActivateProposedCompanionshipFromFind', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      activateProposedCompanionshipRelationModule.activateProposedCompanionshipRelation as Mock
    ).mockResolvedValue(undefined);
    (
      activateProposedCompanionshipRelationModule.activateProposedCoupleCompanionshipRelations as Mock
    ).mockResolvedValue(undefined);
  });

  it('submitActivateProposedCompanionshipFromFind activates a person proposal and opens Created Companionships', async () => {
    const formData = aPersonCompanionshipFormData({
      proposal: 'proposal-1',
      start_date: '2024-06-01',
      notes: 'wybór',
    });

    await submitActivateProposedCompanionshipFromFind(undefined, formData);

    expect(
      activateProposedCompanionshipRelationModule.activateProposedCompanionshipRelation
    ).toHaveBeenCalledWith('proposal-1', {
      start_date: '2024-06-01',
      notes: 'wybór',
    });
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitActivateProposedCompanionshipFromFind activates a couple proposal pair', async () => {
    const formData = new FormData();
    formData.set('accompanied_kind', 'couple');
    formData.set('companion_kind', 'couple');
    formData.set('accompanied_id', '550e8400-e29b-41d4-a716-446655440001');
    formData.set('companion_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.set('proposal_husband', 'ph');
    formData.set('proposal_wife', 'pw');
    formData.set('start_date', '2024-06-01');
    formData.set('notes', '');

    await submitActivateProposedCompanionshipFromFind(undefined, formData);

    expect(
      activateProposedCompanionshipRelationModule.activateProposedCoupleCompanionshipRelations
    ).toHaveBeenCalledWith('ph', 'pw', {
      start_date: '2024-06-01',
      notes: null,
    });
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });
});
