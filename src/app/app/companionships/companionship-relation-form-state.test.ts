import { describe, expect, it } from 'vitest';
import {
  communityMembersNeedingCompanion,
  companionshipRelationFormStateAfterFailedSubmit,
  companionshipSelectOptions,
  newCompanionshipRelationFormValues,
} from './companionship-relation-form-state';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';

const memberA = { id: '550e8400-e29b-41d4-a716-446655440001' } as CommunityMember;
const members = [memberA];

function aMember(overrides: Partial<CommunityMember>): CommunityMember {
  return {
    id: MemberId('member-1'),
    first_name: 'Ada',
    last_name: 'Lovelace',
    gender: 'female',
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
    accompanying_readiness: 'Not Candidate',
    email: null,
    phone: null,
    notes: null,
    profile_picture: null,
    hasLoginIdentity: false,
    ...overrides,
  };
}

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

describe('companionshipSelectOptions', () => {
  const ada = aMember({ id: MemberId('ada'), gender: 'female' });
  const ala = aMember({
    id: MemberId('ala'),
    first_name: 'Ala',
    last_name: 'Nowak',
    gender: 'female',
  });
  const jan = aMember({
    id: MemberId('jan'),
    first_name: 'Jan',
    last_name: 'Kowalski',
    gender: 'male',
  });
  const unknown = aMember({
    id: MemberId('unknown'),
    first_name: 'X',
    last_name: 'Y',
    gender: null,
  });
  const registry = [ada, ala, jan, unknown];

  it('companionshipSelectOptions lists everyone when the partner has no gender yet', () => {
    expect(companionshipSelectOptions(registry, unknown, '')).toEqual(registry);
    expect(companionshipSelectOptions(registry, undefined, '')).toEqual(registry);
  });

  it('companionshipSelectOptions lists only the same gender once the partner gender is known', () => {
    expect(companionshipSelectOptions(registry, ada, '')).toEqual([ada, ala]);
    expect(companionshipSelectOptions(registry, jan, '')).toEqual([jan]);
  });

  it('companionshipSelectOptions keeps a mismatched current selection visible after a validation error', () => {
    expect(companionshipSelectOptions(registry, ada, jan.id)).toEqual([ada, ala, jan]);
  });
});

describe('communityMembersNeedingCompanion', () => {
  it('communityMembersNeedingCompanion keeps only registry people who still wait for a companion', () => {
    const ada = aMember({ id: MemberId('ada'), gender: 'female' });
    const jan = aMember({
      id: MemberId('jan'),
      first_name: 'Jan',
      last_name: 'Kowalski',
      gender: 'male',
    });

    expect(
      communityMembersNeedingCompanion([ada, jan], [{ id: ada.id }])
    ).toEqual([ada]);
  });
});
