import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { redirect } from 'next/navigation';
import * as addCompanionshipRelationModule from '@/application/add-companionship-relation';
import { submitNewCompanionshipRelation } from './actions';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/application/add-companionship-relation', () => ({
  addCompanionshipRelation: vi.fn(),
  isCompanionAndAccompaniedAreSamePerson: vi.fn(),
  CompanionAndAccompaniedAreSamePerson: class CompanionAndAccompaniedAreSamePerson extends Error {},
}));

describe('submitNewCompanionshipRelation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson).mockReturnValue(false);
  });

  it('submitNewCompanionshipRelation accepts valid data and redirects to the list', async () => {
    const formData = new FormData();
    formData.set('companion_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.set('accompanied_id', '550e8400-e29b-41d4-a716-446655440001');
    formData.set('start_date', '2024-01-15');
    formData.set('end_date', '');
    formData.set('notes', '');

    await submitNewCompanionshipRelation(undefined, formData);

    expect(addCompanionshipRelationModule.addCompanionshipRelation).toHaveBeenCalledWith({
      companion_id: '550e8400-e29b-41d4-a716-446655440000',
      accompanied_id: '550e8400-e29b-41d4-a716-446655440001',
      start_date: '2024-01-15',
      end_date: null,
      notes: null,
    });
    expect(redirect).toHaveBeenCalledWith('/app/companionships');
  });

  it('submitNewCompanionshipRelation refuses missing companion', async () => {
    const formData = new FormData();
    formData.set('companion_id', '');
    formData.set('accompanied_id', '550e8400-e29b-41d4-a716-446655440001');
    formData.set('start_date', '2024-01-15');
    formData.set('end_date', '');
    formData.set('notes', '');

    const result = await submitNewCompanionshipRelation(undefined, formData);

    expect(result.fieldErrors?.companion_id).toBeDefined();
    expect(addCompanionshipRelationModule.addCompanionshipRelation).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation refuses when companion and accompanied are the same', async () => {
    vi.mocked(addCompanionshipRelationModule.isCompanionAndAccompaniedAreSamePerson).mockReturnValue(true);
    (addCompanionshipRelationModule.addCompanionshipRelation as Mock).mockRejectedValue(
      new addCompanionshipRelationModule.CompanionAndAccompaniedAreSamePerson()
    );

    const formData = new FormData();
    const samePerson = '550e8400-e29b-41d4-a716-446655440000';
    formData.set('companion_id', samePerson);
    formData.set('accompanied_id', samePerson);
    formData.set('start_date', '2024-01-15');
    formData.set('end_date', '');
    formData.set('notes', '');

    const result = await submitNewCompanionshipRelation(undefined, formData);

    expect(result.formError).toBe('Akompaniator i akompaniowany nie mogą być tą samą osobą.');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCompanionshipRelation refuses invalid date format', async () => {
    const formData = new FormData();
    formData.set('companion_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.set('accompanied_id', '550e8400-e29b-41d4-a716-446655440001');
    formData.set('start_date', 'not-a-date');
    formData.set('end_date', '');
    formData.set('notes', '');

    const result = await submitNewCompanionshipRelation(undefined, formData);

    expect(result.fieldErrors?.start_date).toBeDefined();
    expect(addCompanionshipRelationModule.addCompanionshipRelation).not.toHaveBeenCalled();
  });
});
