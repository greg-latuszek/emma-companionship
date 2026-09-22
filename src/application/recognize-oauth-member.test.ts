import { afterEach, describe, expect, it, vi } from 'vitest';
import { recognizeOAuthMember } from '@/application/recognize-oauth-member';
import { UnavailableDatabase } from '@/lib/unavailable-database';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import type { OAuthIdentity } from '@/schemas/auth';
import { MemberId, type Member } from '@/types/auth';

function anOAuthIdentity(overrides: Partial<OAuthIdentity> = {}): OAuthIdentity {
  return {
    provider: 'google',
    subject: 'google-id-1',
    displayName: 'Ada Lovelace',
    email: 'ada@example.com',
    picture: null,
    ...overrides,
  };
}

function aMember(overrides: Partial<Member> = {}): Member {
  return {
    id: MemberId('member-1'),
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.com',
    oauth_provider: 'google',
    oauth_id: 'google-id-1',
    is_active: false,
    revoked_at: null,
    profile_picture: null,
    visual_style: null,
    ...overrides,
  };
}

function givenARefusedPostgresConnection(): Error & {
  code: string;
  address: string;
  port: number;
} {
  const error = new Error('connect ECONNREFUSED 127.0.0.1:5433') as Error & {
    code: string;
    address: string;
    port: number;
  };
  error.code = 'ECONNREFUSED';
  error.address = '127.0.0.1';
  error.port = 5433;
  return error;
}

function aMemberRepository(
  stubs: Partial<IMemberRepository> = {}
): IMemberRepository {
  return {
    findMemberById: vi.fn(),
    findMemberByEmail: vi.fn(),
    findMemberByOAuth: vi.fn(),
    createMember: vi.fn(),
    updateMemberVisualStyle: vi.fn(),
    ...stubs,
  };
}

function capturingConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recognizeOAuthMember', () => {
  it('recognizeOAuthMember looks up the member by the identity provider, not a hardcoded Google id', async () => {
    const existing = aMember({
      oauth_provider: 'github',
      oauth_id: 'gh-1',
    });
    const members = aMemberRepository({
      findMemberByOAuth: vi.fn().mockResolvedValue(existing),
    });

    const member = await recognizeOAuthMember(
      anOAuthIdentity({ provider: 'github', subject: 'gh-1' }),
      members
    );

    expect(members.findMemberByOAuth).toHaveBeenCalledWith('github', 'gh-1');
    expect(member).toEqual(existing);
    expect(members.createMember).not.toHaveBeenCalled();
  });

  it('recognizeOAuthMember creates a pending member with the identity provider when nobody matches', async () => {
    const created = aMember({ oauth_provider: 'github', oauth_id: 'gh-9' });
    const members = aMemberRepository({
      findMemberByOAuth: vi.fn().mockResolvedValue(null),
      findMemberByEmail: vi.fn().mockResolvedValue(null),
      createMember: vi.fn().mockResolvedValue(created),
    });

    await recognizeOAuthMember(
      anOAuthIdentity({
        provider: 'github',
        subject: 'gh-9',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
      members
    );

    expect(members.createMember).toHaveBeenCalledWith({
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      oauth_provider: 'github',
      oauth_id: 'gh-9',
      profile_picture: null,
    });
  });

  it('recognizeOAuthMember tells the operator to start Postgres when the connection is refused', async () => {
    const members = aMemberRepository({
      findMemberByOAuth: vi.fn().mockRejectedValue(givenARefusedPostgresConnection()),
    });
    const logs = capturingConsoleError();

    await expect(recognizeOAuthMember(anOAuthIdentity(), members)).rejects.toBeInstanceOf(
      UnavailableDatabase
    );

    expect(logs.mock.calls[0]?.[0]).toContain('OAuth sign-in cannot find or create the member');
    expect(logs.mock.calls[0]?.[0]).toContain('npm run db:start');
  });

  it('recognizeOAuthMember does not create a member when Postgres refuses the connection', async () => {
    const members = aMemberRepository({
      findMemberByOAuth: vi.fn().mockRejectedValue(givenARefusedPostgresConnection()),
    });
    capturingConsoleError();

    await expect(recognizeOAuthMember(anOAuthIdentity(), members)).rejects.toThrow();

    expect(members.createMember).not.toHaveBeenCalled();
  });
});
