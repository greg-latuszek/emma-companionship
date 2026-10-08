import { describe, expect, it } from 'vitest';
import {
  companionshipRelationFormStateAfterFailedSubmit,
  newCompanionshipRelationFormValues,
} from './companionship-relation-form-state';
import type { CommunityMember } from '@/types/community-member';

const memberA = { id: '550e8400-e29b-41d4-a716-446655440001' } as CommunityMember;
const members = [memberA];

describe('newCompanionshipRelationFormValues', () => {
  it('newCompanionshipRelationFormValues preselects the accompanied member who is known', () => {
    const values = newCompanionshipRelationFormValues(memberA.id, members);

    expect(values.accompanied_id).toBe(memberA.id);
  });

  it('newCompanionshipRelationFormValues ignores an accompanied id that is not a member', () => {
    const values = newCompanionshipRelationFormValues('unknown-id', members);

    expect(values.accompanied_id).toBe('');
  });
});

describe('companionshipRelationFormStateAfterFailedSubmit', () => {
  it('companionshipRelationFormStateAfterFailedSubmit keeps submitted people and issues a fresh restore key', () => {
    const first = companionshipRelationFormStateAfterFailedSubmit({
      values: {
        companion_id: '550e8400-e29b-41d4-a716-446655440000',
        accompanied_id: '550e8400-e29b-41d4-a716-446655440001',
        start_date: '2024-01-15',
        end_date: '',
        notes: '',
      },
      formError: 'Akompaniator i akompaniowany muszą być tej samej płci.',
    });
    const second = companionshipRelationFormStateAfterFailedSubmit({
      values: first.values,
      formError: first.formError,
    });

    expect(first.values?.accompanied_id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(first.restoreKey).toEqual(expect.any(String));
    expect(second.restoreKey).not.toBe(first.restoreKey);
  });
});
