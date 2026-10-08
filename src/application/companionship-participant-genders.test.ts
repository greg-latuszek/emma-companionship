import { describe, expect, it } from 'vitest';
import {
  CompanionAndAccompaniedHaveDifferentGenders,
  companionshipParticipantsHaveDifferentGenders,
  isCompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/companionship-participant-genders';

describe('companionshipParticipantsHaveDifferentGenders', () => {
  it('companionshipParticipantsHaveDifferentGenders reports a mismatch when both people have opposite genders', () => {
    expect(
      companionshipParticipantsHaveDifferentGenders(
        { gender: 'male' },
        { gender: 'female' }
      )
    ).toBe(true);
  });

  it('companionshipParticipantsHaveDifferentGenders allows the relation when both people share a gender', () => {
    expect(
      companionshipParticipantsHaveDifferentGenders(
        { gender: 'female' },
        { gender: 'female' }
      )
    ).toBe(false);
  });

  it('companionshipParticipantsHaveDifferentGenders allows the relation when either person has no gender yet', () => {
    expect(
      companionshipParticipantsHaveDifferentGenders({ gender: 'male' }, { gender: null })
    ).toBe(false);
    expect(
      companionshipParticipantsHaveDifferentGenders({ gender: null }, { gender: 'female' })
    ).toBe(false);
  });

  it('companionshipParticipantsHaveDifferentGenders allows the relation when either person is missing from the registry', () => {
    expect(
      companionshipParticipantsHaveDifferentGenders(null, { gender: 'male' })
    ).toBe(false);
    expect(
      companionshipParticipantsHaveDifferentGenders({ gender: 'male' }, null)
    ).toBe(false);
  });
});

describe('isCompanionAndAccompaniedHaveDifferentGenders', () => {
  it('isCompanionAndAccompaniedHaveDifferentGenders recognizes its own domain error', () => {
    expect(
      isCompanionAndAccompaniedHaveDifferentGenders(
        new CompanionAndAccompaniedHaveDifferentGenders()
      )
    ).toBe(true);
    expect(isCompanionAndAccompaniedHaveDifferentGenders(new Error('other'))).toBe(false);
  });
});
