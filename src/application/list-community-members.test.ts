import { describe, expect, it, vi } from 'vitest';
import { listCommunityMembers } from '@/application/list-community-members';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';

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
    notes: null,
    hasLoginIdentity: false,
    ...overrides,
  };
}

function aCommunityMemberRepository(
  stubs: Partial<ICommunityMemberRepository> = {}
): ICommunityMemberRepository {
  return {
    listCommunityMembers: vi.fn(),
    findCommunityMemberById: vi.fn(),
    ...stubs,
  };
}

describe('listCommunityMembers', () => {
  it('listCommunityMembers returns every community member the registry already has', async () => {
    const ada = aCommunityMember();
    const charles = aCommunityMember({
      id: MemberId('member-2'),
      first_name: 'Charles',
      last_name: 'Babbage',
      gender: 'male',
    });
    const members = aCommunityMemberRepository({
      listCommunityMembers: vi.fn().mockResolvedValue([ada, charles]),
    });

    const listed = await listCommunityMembers(members);

    expect(listed).toEqual([ada, charles]);
  });
});
