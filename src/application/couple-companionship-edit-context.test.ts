import { describe, expect, it } from 'vitest';
import {
  resolveCoupleCompanionshipEditContext,
} from '@/application/couple-companionship-edit-context';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';

function aSpouse(overrides: {
  id: string;
  first_name: string;
  last_name: string;
  gender: CoupleParticipant['gender'];
}): CoupleParticipant {
  return {
    id: MemberId(overrides.id),
    first_name: overrides.first_name,
    last_name: overrides.last_name,
    gender: overrides.gender,
    email: null,
    phone: null,
    notes: null,
  };
}

function aRelation(
  overrides: Partial<CompanionshipRelation> &
    Pick<CompanionshipRelation, 'id' | 'companion_id' | 'accompanied_id'>
): CompanionshipRelation {
  return {
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    notes: null,
    ...overrides,
  };
}

describe('resolveCoupleCompanionshipEditContext', () => {
  const husbandId = MemberId('550e8400-e29b-41d4-a716-446655440001');
  const wifeId = MemberId('550e8400-e29b-41d4-a716-446655440002');
  const companionHusbandId = MemberId('550e8400-e29b-41d4-a716-446655440003');
  const companionWifeId = MemberId('550e8400-e29b-41d4-a716-446655440004');

  const accompaniedCouple: CoupleListItem = {
    id: 'couple-accompanied',
    husband: aSpouse({
      id: husbandId,
      first_name: 'Jan',
      last_name: 'Kowalski',
      gender: 'male',
    }),
    wife: aSpouse({
      id: wifeId,
      first_name: 'Anna',
      last_name: 'Kowalska',
      gender: 'female',
    }),
  };

  const companionCouple: CoupleListItem = {
    id: 'couple-companion',
    husband: aSpouse({
      id: companionHusbandId,
      first_name: 'Piotr',
      last_name: 'Nowak',
      gender: 'male',
    }),
    wife: aSpouse({
      id: companionWifeId,
      first_name: 'Ewa',
      last_name: 'Nowak',
      gender: 'female',
    }),
  };

  const husbandRelation = aRelation({
    id: 'rel-husband',
    companion_id: companionHusbandId,
    accompanied_id: husbandId,
  });
  const wifeRelation = aRelation({
    id: 'rel-wife',
    companion_id: companionWifeId,
    accompanied_id: wifeId,
  });

  it('resolveCoupleCompanionshipEditContext returns couple context when both spouses are actively accompanied', () => {
    const context = resolveCoupleCompanionshipEditContext(
      husbandRelation,
      [accompaniedCouple, companionCouple],
      husbandRelation,
      wifeRelation
    );

    expect(context).toEqual({
      accompaniedCouple,
      accompaniedLabel: 'Kowalski, Jan + Anna',
      husbandRelation,
      wifeRelation,
      companionCoupleId: 'couple-companion',
    });
  });

  it('resolveCoupleCompanionshipEditContext returns null when the accompanied person is not in a couple', () => {
    const context = resolveCoupleCompanionshipEditContext(
      husbandRelation,
      [companionCouple],
      husbandRelation,
      wifeRelation
    );

    expect(context).toBeNull();
  });

  it('resolveCoupleCompanionshipEditContext returns null when the spouse lacks an active accompanied relation', () => {
    const context = resolveCoupleCompanionshipEditContext(
      husbandRelation,
      [accompaniedCouple, companionCouple],
      husbandRelation,
      null
    );

    expect(context).toBeNull();
  });

  it('resolveCoupleCompanionshipEditContext leaves companionCoupleId empty when companions are not a registered couple', () => {
    const mismatchedWife = aRelation({
      id: 'rel-wife',
      companion_id: MemberId('550e8400-e29b-41d4-a716-446655440099'),
      accompanied_id: wifeId,
    });

    const context = resolveCoupleCompanionshipEditContext(
      wifeRelation,
      [accompaniedCouple, companionCouple],
      husbandRelation,
      mismatchedWife
    );

    expect(context?.companionCoupleId).toBeNull();
  });
});
