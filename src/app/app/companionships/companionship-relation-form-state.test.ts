import { describe, expect, it } from 'vitest';
import {
  communityMembersNeedingCompanion,
  companionshipRelationFormStateAfterFailedSubmit,
  companionshipSelectOptions,
  fromFindCompanionshipRelationFormValues,
  newCompanionshipRelationFormValues,
} from './companionship-relation-form-state';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import { messageRef } from '@/i18n/translator';

const memberA = { id: '550e8400-e29b-41d4-a716-446655440001' } as CommunityMember;

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
  it('newCompanionshipRelationFormValues preselects an accompanied person who is still a single option', () => {
    const values = newCompanionshipRelationFormValues(memberA.id, [
      {
        kind: 'person',
        id: memberA.id,
        label: 'Kowalski, Jan',
        gender: 'male',
      },
    ]);

    expect(values.accompanied_kind).toBe('person');
    expect(values.accompanied_id).toBe(memberA.id);
  });

  it('newCompanionshipRelationFormValues ignores a spouse id that is only available as a couple option', () => {
    const values = newCompanionshipRelationFormValues(memberA.id, [
      {
        kind: 'couple',
        id: 'couple-1',
        label: 'Kowalski, Jan + Anna',
      },
    ]);

    expect(values.accompanied_kind).toBe('');
    expect(values.accompanied_id).toBe('');
  });

  it('newCompanionshipRelationFormValues prefills an eligible couple from Missing Companionships Assign', () => {
    const values = newCompanionshipRelationFormValues('couple-1', [
      {
        kind: 'couple',
        id: 'couple-1',
        label: 'Kowalski, Jan + Anna',
      },
    ]);

    expect(values.accompanied_kind).toBe('couple');
    expect(values.accompanied_id).toBe('couple-1');
  });

  it('newCompanionshipRelationFormValues ignores an accompanied id that is not among the options', () => {
    const values = newCompanionshipRelationFormValues('unknown-id', [
      {
        kind: 'person',
        id: memberA.id,
        label: 'Kowalski, Jan',
        gender: 'male',
      },
    ]);

    expect(values.accompanied_id).toBe('');
  });
});

describe('fromFindCompanionshipRelationFormValues', () => {
  it('fromFindCompanionshipRelationFormValues prefills both participants from the Find handoff', () => {
    expect(
      fromFindCompanionshipRelationFormValues({
        accompaniedKind: 'couple',
        accompaniedId: 'acc-couple',
        companionKind: 'couple',
        companionId: 'comp-couple',
      })
    ).toMatchObject({
      accompanied_kind: 'couple',
      accompanied_id: 'acc-couple',
      companion_kind: 'couple',
      companion_id: 'comp-couple',
      end_date: '',
    });
  });
});

describe('companionshipRelationFormStateAfterFailedSubmit', () => {
  it('companionshipRelationFormStateAfterFailedSubmit keeps submitted people and issues a fresh restore key', () => {
    const first = companionshipRelationFormStateAfterFailedSubmit({
      values: {
        accompanied_kind: 'person',
        companion_kind: 'person',
        companion_id: '550e8400-e29b-41d4-a716-446655440000',
        accompanied_id: '550e8400-e29b-41d4-a716-446655440001',
        start_date: '2024-01-15',
        end_date: '',
        notes: '',
      },
      formError: messageRef('companionshipError.differentGenders'),
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
