import { describe, expect, it } from 'vitest';
import { groupPeopleWithoutCompanion } from '@/application/group-people-without-companion';
import { MemberId } from '@/types/auth';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';

function aPerson(overrides: {
  id: string;
  first_name: string;
  last_name: string;
}): PersonWithoutCompanion {
  return {
    id: MemberId(overrides.id),
    first_name: overrides.first_name,
    last_name: overrides.last_name,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}

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

function aCouple(overrides: {
  id: string;
  husband: ReturnType<typeof aSpouse>;
  wife: ReturnType<typeof aSpouse>;
}): CoupleListItem {
  return {
    id: overrides.id,
    husband: overrides.husband,
    wife: overrides.wife,
  };
}

const jan = aPerson({ id: 'jan', first_name: 'Jan', last_name: 'Kowalski' });
const anna = aPerson({ id: 'anna', first_name: 'Anna', last_name: 'Kowalska' });
const ala = aPerson({ id: 'ala', first_name: 'Ala', last_name: 'Solo' });

const kowalskiCouple = aCouple({
  id: 'couple-kowalski',
  husband: aSpouse({
    id: 'jan',
    first_name: 'Jan',
    last_name: 'Kowalski',
    gender: 'male',
  }),
  wife: aSpouse({
    id: 'anna',
    first_name: 'Anna',
    last_name: 'Kowalska',
    gender: 'female',
  }),
});

describe('groupPeopleWithoutCompanion', () => {
  it('groupPeopleWithoutCompanion collapses both waiting spouses into one couple row', () => {
    const rows = groupPeopleWithoutCompanion(
      [jan, anna, ala],
      [kowalskiCouple]
    );

    expect(rows).toEqual([
      {
        kind: 'couple',
        couple: kowalskiCouple,
        label: 'Kowalski, Jan + Anna',
      },
      {
        kind: 'person',
        person: ala,
        label: 'Solo Ala',
      },
    ]);
  });

  it('groupPeopleWithoutCompanion omits a registered spouse when the other already has a companion', () => {
    const rows = groupPeopleWithoutCompanion([jan, ala], [kowalskiCouple]);

    expect(rows).toEqual([
      {
        kind: 'person',
        person: ala,
        label: 'Solo Ala',
      },
    ]);
  });

  it('groupPeopleWithoutCompanion keeps unpaired waiting people as person rows', () => {
    const rows = groupPeopleWithoutCompanion([ala], []);

    expect(rows).toEqual([
      {
        kind: 'person',
        person: ala,
        label: 'Solo Ala',
      },
    ]);
  });
});
