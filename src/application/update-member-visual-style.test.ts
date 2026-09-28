import { afterEach, describe, expect, it, vi } from 'vitest';
import { UnavailableDatabase } from '@/lib/unavailable-database';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { MemberId, type Member } from '@/types/auth';
import {
  LoginMemberNotFound,
  updateMemberVisualStyle,
} from './update-member-visual-style';

const memberId = MemberId('member-1');

function aMember(overrides: Partial<Member> = {}): Member {
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
    visual_style: null,
    ...overrides,
  };
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

function capturingConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('updateMemberVisualStyle', () => {
  it('updateMemberVisualStyle stores high-contrast on the login member', async () => {
    const stored = aMember({ visual_style: 'high-contrast' });
    const members = aMemberRepository({
      updateMemberVisualStyle: vi.fn().mockResolvedValue(stored),
    });

    const member = await updateMemberVisualStyle(
      memberId,
      'high-contrast',
      members
    );

    expect(members.updateMemberVisualStyle).toHaveBeenCalledWith(
      memberId,
      'high-contrast'
    );
    expect(member).toEqual(stored);
  });

  it('updateMemberVisualStyle stores an empty visual_style so the member keeps the default', async () => {
    const stored = aMember({ visual_style: null });
    const members = aMemberRepository({
      updateMemberVisualStyle: vi.fn().mockResolvedValue(stored),
    });

    const member = await updateMemberVisualStyle(memberId, null, members);

    expect(members.updateMemberVisualStyle).toHaveBeenCalledWith(memberId, null);
    expect(member.visual_style).toBeNull();
  });

  it('updateMemberVisualStyle does not invent a visual_style when the login member is missing', async () => {
    const members = aMemberRepository({
      updateMemberVisualStyle: vi.fn().mockResolvedValue(null),
    });

    await expect(
      updateMemberVisualStyle(memberId, 'high-contrast', members)
    ).rejects.toBeInstanceOf(LoginMemberNotFound);
  });

  it('updateMemberVisualStyle tells the operator to start Postgres when the connection is refused', async () => {
    const members = aMemberRepository({
      updateMemberVisualStyle: vi
        .fn()
        .mockRejectedValue(givenARefusedPostgresConnection()),
    });
    const logs = capturingConsoleError();

    await expect(
      updateMemberVisualStyle(memberId, 'high-contrast', members)
    ).rejects.toBeInstanceOf(UnavailableDatabase);

    expect(logs.mock.calls[0]?.[0]).toContain(
      'The login member cannot store a visual style'
    );
    expect(logs.mock.calls[0]?.[0]).toContain('npm run db:start');
  });
});
