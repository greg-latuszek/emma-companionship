import { describe, expect, it } from 'vitest';
import {
  companionshipFindDetailPeople,
  companionshipFindVisibleFieldsStorageKey,
  readStoredCompanionshipFindVisibleFields,
  storeCompanionshipFindVisibleFields,
} from './companionship-find-visible-fields';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { CoupleListItem } from '@/types/couple';

function aMember(overrides: Partial<CommunityMember> & Pick<CommunityMember, 'id'>): CommunityMember {
  return {
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

describe('companionshipFindDetailPeople', () => {
  it('companionshipFindDetailPeople titles a single person as Detale osoby', () => {
    const member = aMember({ id: MemberId('m1') });
    expect(
      companionshipFindDetailPeople(
        {
          kind: 'person',
          id: 'm1',
          label: 'Lovelace, Ada',
          gender: 'female',
        },
        [member],
        []
      )
    ).toEqual([{ title: 'Detale osoby', member }]);
  });

  it('companionshipFindDetailPeople splits a couple into Detale męża and Detale żony', () => {
    const husband = aMember({
      id: MemberId('h1'),
      first_name: 'Jan',
      last_name: 'Kowalski',
      gender: 'male',
    });
    const wife = aMember({
      id: MemberId('w1'),
      first_name: 'Anna',
      last_name: 'Kowalska',
      gender: 'female',
    });
    const couple: CoupleListItem = {
      id: 'c1',
      husband: {
        id: husband.id,
        first_name: husband.first_name,
        last_name: husband.last_name,
        gender: 'male',
        email: null,
        phone: null,
        notes: null,
      },
      wife: {
        id: wife.id,
        first_name: wife.first_name,
        last_name: wife.last_name,
        gender: 'female',
        email: null,
        phone: null,
        notes: null,
      },
    };

    expect(
      companionshipFindDetailPeople(
        { kind: 'couple', id: 'c1', label: 'Kowalski, Jan + Anna' },
        [husband, wife],
        [couple]
      )
    ).toEqual([
      { title: 'Detale męża', member: husband },
      { title: 'Detale żony', member: wife },
    ]);
  });
});

describe('companionshipFindVisibleFields storage', () => {
  it('storeCompanionshipFindVisibleFields writes the Find Companion storage key', () => {
    const written: Record<string, string> = {};
    storeCompanionshipFindVisibleFields(['email', 'phone'], {
      setItem: (key, value) => {
        written[key] = value;
      },
    });
    expect(written[companionshipFindVisibleFieldsStorageKey]).toBe(
      JSON.stringify(['email', 'phone'])
    );
  });

  it('readStoredCompanionshipFindVisibleFields restores stored visible fields', () => {
    expect(
      readStoredCompanionshipFindVisibleFields({
        getItem: (key) =>
          key === companionshipFindVisibleFieldsStorageKey
            ? JSON.stringify(['notes'])
            : null,
      })
    ).toEqual(['notes']);
  });
});
