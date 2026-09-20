import { afterEach, describe, expect, it, vi } from 'vitest';
import { findOrCreateGoogleMember } from '@/lib/google-member';
import { UnavailableDatabase } from '@/lib/unavailable-database';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import type { OAuthProfile } from '@/schemas/auth';

function aGoogleProfile(): OAuthProfile {
  return {
    id: 'google-id-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    image: null,
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

function aMemberRepositoryThatRefusesTheConnection(): IMemberRepository {
  return {
    findMemberById: vi.fn(),
    findMemberByEmail: vi.fn(),
    findMemberByOAuth: vi.fn().mockRejectedValue(givenARefusedPostgresConnection()),
    createMember: vi.fn(),
  };
}

function capturingConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('findOrCreateGoogleMember', () => {
  it('findOrCreateGoogleMember tells the operator to start Postgres when the connection is refused', async () => {
    const members = aMemberRepositoryThatRefusesTheConnection();
    const logs = capturingConsoleError();

    await expect(findOrCreateGoogleMember(aGoogleProfile(), members)).rejects.toBeInstanceOf(
      UnavailableDatabase
    );

    expect(logs.mock.calls[0]?.[0]).toContain('Google sign-in cannot find or create the member');
    expect(logs.mock.calls[0]?.[0]).toContain('npm run db:start');
  });

  it('findOrCreateGoogleMember does not create a member when Postgres refuses the connection', async () => {
    const members = aMemberRepositoryThatRefusesTheConnection();
    capturingConsoleError();

    await expect(findOrCreateGoogleMember(aGoogleProfile(), members)).rejects.toThrow();

    expect(members.createMember).not.toHaveBeenCalled();
  });
});
