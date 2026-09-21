import { describe, expect, it, vi } from 'vitest';
import type { Session } from 'next-auth';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { MemberId, type Member } from '@/types/auth';
import { signedInMemberFrom } from './signed-in-member';

const memberId = MemberId('member-1');

function aSession(user: Session['user']): Session {
  return {
    user,
    expires: '2099-01-01T00:00:00.000Z',
  };
}

function aStoredMember(overrides: Partial<Member> = {}): Member {
  return {
    id: memberId,
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.com',
    oauth_provider: 'google',
    oauth_id: 'google-id-1',
    is_active: true,
    revoked_at: null,
    profile_picture: null,
    ...overrides,
  };
}

function aMemberRepository(
  stubs: Partial<IMemberRepository> = {}
): IMemberRepository {
  return {
    findMemberById: vi.fn().mockResolvedValue(null),
    findMemberByEmail: vi.fn(),
    findMemberByOAuth: vi.fn(),
    createMember: vi.fn(),
    ...stubs,
  };
}

describe('signedInMemberFrom', () => {
  it('signedInMemberFrom uses the session name and email when both are present', async () => {
    const member = await signedInMemberFrom(
      aSession({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        memberId,
      }),
      aMemberRepository()
    );

    expect(member).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      memberId,
      profilePicture: null,
    });
  });

  it('signedInMemberFrom uses the email as the name when the session has no display name', async () => {
    const member = await signedInMemberFrom(
      aSession({
        email: 'ada@example.com',
        memberId,
      }),
      aMemberRepository()
    );

    expect(member.name).toBe('ada@example.com');
    expect(member.email).toBe('ada@example.com');
    expect(member.profilePicture).toBeNull();
  });

  it('signedInMemberFrom copies the session image as the profile picture', async () => {
    const members = aMemberRepository();

    const member = await signedInMemberFrom(
      aSession({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        image: 'https://example.com/ada.jpg',
        memberId,
      }),
      members
    );

    expect(member.profilePicture).toBe('https://example.com/ada.jpg');
    expect(members.findMemberById).not.toHaveBeenCalled();
  });

  it('signedInMemberFrom uses the stored profile picture when the session has no image', async () => {
    const members = aMemberRepository({
      findMemberById: vi.fn().mockResolvedValue(
        aStoredMember({ profile_picture: 'https://example.com/stored-ada.jpg' })
      ),
    });

    const member = await signedInMemberFrom(
      aSession({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        memberId,
      }),
      members
    );

    expect(members.findMemberById).toHaveBeenCalledWith(memberId);
    expect(member.profilePicture).toBe('https://example.com/stored-ada.jpg');
  });
});
