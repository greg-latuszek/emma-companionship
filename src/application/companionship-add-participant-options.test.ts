import { describe, expect, it } from 'vitest';
import {
  formatCompanionshipCoupleOptionLabel,
  formatCompanionshipPersonOptionLabel,
  proposeAccompaniedCompanionshipOptions,
  proposeCompanionCompanionshipOptions,
} from '@/application/companionship-add-participant-options';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';

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

describe('formatCompanionshipPersonOptionLabel', () => {
  it('formatCompanionshipPersonOptionLabel writes surname then first name', () => {
    expect(
      formatCompanionshipPersonOptionLabel(
        aMember({ first_name: 'Jan', last_name: 'Kowalski' })
      )
    ).toBe('Kowalski, Jan');
  });
});

describe('formatCompanionshipCoupleOptionLabel', () => {
  it('formatCompanionshipCoupleOptionLabel writes husband surname then both first names', () => {
    const couple = aCouple({
      id: 'c1',
      husband: aSpouse({
        id: 'h1',
        first_name: 'Jan',
        last_name: 'Kowalski',
        gender: 'male',
      }),
      wife: aSpouse({
        id: 'w1',
        first_name: 'Anna',
        last_name: 'Kowalska',
        gender: 'female',
      }),
    });

    expect(formatCompanionshipCoupleOptionLabel(couple)).toBe(
      'Kowalski, Jan + Anna'
    );
  });
});

describe('proposeAccompaniedCompanionshipOptions', () => {
  const piotr = aMember({
    id: MemberId('piotr'),
    first_name: 'Piotr',
    last_name: 'Nowak',
    gender: 'male',
  });
  const jan = aMember({
    id: MemberId('jan'),
    first_name: 'Jan',
    last_name: 'Kowalski',
    gender: 'male',
  });
  const anna = aMember({
    id: MemberId('anna'),
    first_name: 'Anna',
    last_name: 'Kowalska',
    gender: 'female',
  });
  const maria = aMember({
    id: MemberId('maria'),
    first_name: 'Maria',
    last_name: 'Lis',
    gender: 'female',
  });
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

  it('proposeAccompaniedCompanionshipOptions lists unpaired Brakujące people as singles and omits spouses who are in a couple', () => {
    const options = proposeAccompaniedCompanionshipOptions(
      [{ id: piotr.id }, { id: jan.id }, { id: anna.id }],
      [piotr, jan, anna, maria],
      [kowalskiCouple]
    );

    expect(options).toEqual([
      {
        kind: 'couple',
        id: 'couple-kowalski',
        label: 'Kowalski, Jan + Anna',
      },
      {
        kind: 'person',
        id: piotr.id,
        label: 'Nowak, Piotr',
        gender: 'male',
      },
    ]);
  });

  it('proposeAccompaniedCompanionshipOptions omits a couple when either spouse is already accompanied', () => {
    const options = proposeAccompaniedCompanionshipOptions(
      [{ id: piotr.id }, { id: anna.id }],
      [piotr, jan, anna],
      [kowalskiCouple]
    );

    expect(options).toEqual([
      {
        kind: 'person',
        id: piotr.id,
        label: 'Nowak, Piotr',
        gender: 'male',
      },
    ]);
  });

  it('proposeAccompaniedCompanionshipOptions keeps an eligible couple when both spouses still wait for a companion', () => {
    const options = proposeAccompaniedCompanionshipOptions(
      [{ id: jan.id }, { id: anna.id }],
      [jan, anna],
      [kowalskiCouple]
    );

    expect(options).toEqual([
      {
        kind: 'couple',
        id: 'couple-kowalski',
        label: 'Kowalski, Jan + Anna',
      },
    ]);
  });
});

describe('proposeCompanionCompanionshipOptions', () => {
  const ada = aMember({
    id: MemberId('ada'),
    first_name: 'Ada',
    last_name: 'Lovelace',
    gender: 'female',
  });
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
  const nowakCouple = aCouple({
    id: 'couple-nowak',
    husband: aSpouse({
      id: 'piotr',
      first_name: 'Piotr',
      last_name: 'Nowak',
      gender: 'male',
    }),
    wife: aSpouse({
      id: 'ewa',
      first_name: 'Ewa',
      last_name: 'Nowak',
      gender: 'female',
    }),
  });

  it('proposeCompanionCompanionshipOptions lists same-gender people when Akompaniowany is a person', () => {
    const options = proposeCompanionCompanionshipOptions(
      {
        kind: 'person',
        id: ada.id,
        label: 'Lovelace, Ada',
        gender: 'female',
      },
      [ada, ala, jan],
      [kowalskiCouple, nowakCouple]
    );

    expect(options).toEqual([
      {
        kind: 'person',
        id: ada.id,
        label: 'Lovelace, Ada',
        gender: 'female',
      },
      {
        kind: 'person',
        id: ala.id,
        label: 'Nowak, Ala',
        gender: 'female',
      },
    ]);
  });

  it('proposeCompanionCompanionshipOptions lists other couples only when Akompaniowany is a couple', () => {
    const options = proposeCompanionCompanionshipOptions(
      {
        kind: 'couple',
        id: 'couple-kowalski',
        label: 'Kowalski, Jan + Anna',
      },
      [ada, ala, jan],
      [kowalskiCouple, nowakCouple]
    );

    expect(options).toEqual([
      {
        kind: 'couple',
        id: 'couple-nowak',
        label: 'Nowak, Piotr + Ewa',
      },
    ]);
  });

  it('proposeCompanionCompanionshipOptions keeps a mismatched person selection visible after a validation error', () => {
    const options = proposeCompanionCompanionshipOptions(
      {
        kind: 'person',
        id: ada.id,
        label: 'Lovelace, Ada',
        gender: 'female',
      },
      [ada, ala, jan],
      [],
      jan.id
    );

    expect(options.map((option) => option.id)).toEqual([
      jan.id,
      ada.id,
      ala.id,
    ]);
  });
});
