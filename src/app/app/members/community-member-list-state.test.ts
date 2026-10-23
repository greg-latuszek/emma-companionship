import { describe, expect, it } from 'vitest';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import { createTranslator } from '@/i18n/translator';
import { messagesFor } from '@/i18n/messages';
import {
  communityMemberFieldText,
  communityMemberListExtraFields,
  communityMemberListExtraFieldsFromStoredValue,
  communityMemberListSortFromStoredValue,
  communityMemberThumbnail,
  nextCommunityMemberListSort,
  readStoredCommunityMemberListExtraFields,
  readStoredCommunityMemberListSort,
  sortCommunityMembers,
  storeCommunityMemberListExtraFields,
  storeCommunityMemberListSort,
  toggleCommunityMemberListExtraField,
} from './community-member-list-state';

function aMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

function aCommunityMember(
  overrides: Partial<CommunityMember> = {}
): CommunityMember {
  return {
    id: MemberId('member-1'),
    first_name: 'Ada',
    last_name: 'Lovelace',
    gender: 'female',
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
    accompanying_readiness: 'Not Candidate',
    email: 'ada@example.com',
    phone: null,
    notes: 'Delegate notes stay off the list picker',
    profile_picture: null,
    hasLoginIdentity: false,
    ...overrides,
  };
}

describe('community member list state', () => {
  it('communityMemberThumbnail uses the Google profile picture URL when the person has one', () => {
    const ada = aCommunityMember({
      profile_picture: 'https://lh3.googleusercontent.com/ada',
    });

    expect(communityMemberThumbnail(ada)).toBe(
      'https://lh3.googleusercontent.com/ada'
    );
  });

  it('sortCommunityMembers orders people by last name when the Delegate sorts by nazwisko', () => {
    const ada = aCommunityMember({ last_name: 'Lovelace' });
    const charles = aCommunityMember({
      id: MemberId('member-2'),
      first_name: 'Charles',
      last_name: 'Babbage',
    });

    const sorted = sortCommunityMembers([ada, charles], 'last_name');

    expect(sorted.map((member) => member.last_name)).toEqual([
      'Babbage',
      'Lovelace',
    ]);
  });

  it('sortCommunityMembers puts people without an email after those who have one', () => {
    const ada = aCommunityMember({ email: 'ada@example.com' });
    const charles = aCommunityMember({
      id: MemberId('member-2'),
      first_name: 'Charles',
      last_name: 'Babbage',
      email: null,
    });

    const sorted = sortCommunityMembers([charles, ada], 'email');

    expect(sorted[0]?.email).toBe('ada@example.com');
    expect(sorted[1]?.email).toBeNull();
  });

  it('the list extra fields omit image_url and profile_picture which are not meant for column display', () => {
    expect(communityMemberListExtraFields).not.toContain('image_url');
    expect(communityMemberListExtraFields).not.toContain('profile_picture');
    expect(communityMemberListExtraFields).not.toContain('first_name');
    expect(communityMemberListExtraFields).not.toContain('last_name');
  });

  it('toggleCommunityMemberListExtraField hides email when it is already shown', () => {
    expect(toggleCommunityMemberListExtraField(['email'], 'email')).toEqual([]);
  });

  it('sortCommunityMembers reverses last names when the Delegate sorts nazwisko descending', () => {
    const ada = aCommunityMember({ last_name: 'Lovelace' });
    const charles = aCommunityMember({
      id: MemberId('member-2'),
      first_name: 'Charles',
      last_name: 'Babbage',
    });

    const sorted = sortCommunityMembers([ada, charles], 'last_name', 'desc');

    expect(sorted.map((member) => member.last_name)).toEqual([
      'Lovelace',
      'Babbage',
    ]);
  });

  it('nextCommunityMemberListSort reverses direction when the Delegate clicks the same header again', () => {
    expect(nextCommunityMemberListSort('last_name', 'asc', 'last_name')).toEqual({
      sortField: 'last_name',
      sortDirection: 'desc',
    });
  });

  it('communityMemberListExtraFieldsFromStoredValue restores the fields the Delegate chose to show', () => {
    expect(
      communityMemberListExtraFieldsFromStoredValue(
        JSON.stringify(['phone', 'gender'])
      )
    ).toEqual(['phone', 'gender']);
  });

  it('communityMemberListExtraFieldsFromStoredValue keeps an empty choice so only names stay visible', () => {
    expect(communityMemberListExtraFieldsFromStoredValue('[]')).toEqual([]);
  });

  it('communityMemberListExtraFieldsFromStoredValue falls back to email when the stored value is not a field list', () => {
    expect(communityMemberListExtraFieldsFromStoredValue('not-json')).toEqual([
      'email',
    ]);
    expect(
      communityMemberListExtraFieldsFromStoredValue(JSON.stringify(['unknown_field']))
    ).toEqual(['email']);
  });

  it('storeCommunityMemberListExtraFields writes the shown fields so a later visit can restore them', () => {
    const storage = aMemoryStorage();

    storeCommunityMemberListExtraFields(['phone'], storage);

    expect(readStoredCommunityMemberListExtraFields(storage)).toEqual(['phone']);
  });

  it('communityMemberListSortFromStoredValue restores the field and direction the Delegate sorted by', () => {
    expect(
      communityMemberListSortFromStoredValue(
        JSON.stringify({
          sortField: 'community_engagement_status',
          sortDirection: 'desc',
        })
      )
    ).toEqual({
      sortField: 'community_engagement_status',
      sortDirection: 'desc',
    });
  });

  it('communityMemberListSortFromStoredValue falls back to last name when the stored sort is unknown', () => {
    expect(communityMemberListSortFromStoredValue('not-json')).toEqual({
      sortField: 'last_name',
      sortDirection: 'asc',
    });
    expect(
      communityMemberListSortFromStoredValue(
        JSON.stringify({ sortField: 'unknown_field', sortDirection: 'asc' })
      )
    ).toEqual({
      sortField: 'last_name',
      sortDirection: 'asc',
    });
  });

  it('storeCommunityMemberListSort writes the sort so a later visit can restore the row order', () => {
    const storage = aMemoryStorage();

    storeCommunityMemberListSort(
      {
        sortField: 'community_engagement_status',
        sortDirection: 'asc',
      },
      storage
    );

    expect(readStoredCommunityMemberListSort(storage)).toEqual({
      sortField: 'community_engagement_status',
      sortDirection: 'asc',
    });
  });
});

describe('communityMemberFieldText', () => {
  it('communityMemberFieldText names the marital status in the language of the translator', () => {
    const member = aCommunityMember({ marital_status: 'widowed' });

    expect(
      communityMemberFieldText(member, 'marital_status', createTranslator(messagesFor('en')))
    ).toBe('widow / widower');
    expect(
      communityMemberFieldText(member, 'marital_status', createTranslator(messagesFor('pl')))
    ).toBe('wdowa / wdowiec');
  });
});

describe('sortCommunityMembers by a labelled field', () => {
  it('sortCommunityMembers orders genders by their Polish labels whatever language the screen shows', () => {
    const man = aCommunityMember({ id: MemberId('man'), first_name: 'Adam', gender: 'male' });
    const woman = aCommunityMember({ id: MemberId('woman'), first_name: 'Zofia', gender: 'female' });

    const sorted = sortCommunityMembers([man, woman], 'gender', 'asc');

    expect(sorted.map((member) => member.id)).toEqual([woman.id, man.id]);
  });
});
