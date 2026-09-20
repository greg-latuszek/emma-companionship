import { describe, expect, it } from 'vitest';
import type { Session } from 'next-auth';
import { MemberId } from '@/types/auth';
import { signedInMemberFrom } from './signed-in-member';

const memberId = MemberId('member-1');

function aSession(user: Session['user']): Session {
  return {
    user,
    expires: '2099-01-01T00:00:00.000Z',
  };
}

describe('signedInMemberFrom', () => {
  it('signedInMemberFrom uses the session name and email when both are present', () => {
    const member = signedInMemberFrom(
      aSession({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        memberId,
      })
    );

    expect(member).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      memberId,
    });
  });

  it('signedInMemberFrom uses the email as the name when the session has no display name', () => {
    const member = signedInMemberFrom(
      aSession({
        email: 'ada@example.com',
        memberId,
      })
    );

    expect(member.name).toBe('ada@example.com');
    expect(member.email).toBe('ada@example.com');
  });
});
