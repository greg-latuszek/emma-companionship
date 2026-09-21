import { describe, expect, it, vi } from 'vitest';
import { findCommunityMemberById } from '@/application/find-community-member';
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
    findCommunityMemberByEmail: vi.fn(),
    addCommunityMember: vi.fn(),
    updateCommunityMember: vi.fn(),
    ...stubs,
  };
}

describe('findCommunityMemberById', () => {
  it('findCommunityMemberById returns null when the person is not in the registry', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockResolvedValue(null),
    });

    const found = await findCommunityMemberById(MemberId('missing'), members);

    expect(found).toBeNull();
  });

  it('findCommunityMemberById returns the community member when the registry has that id', async () => {
    const ada = aCommunityMember();
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockResolvedValue(ada),
    });

    const found = await findCommunityMemberById(ada.id, members);

    expect(members.findCommunityMemberById).toHaveBeenCalledWith(ada.id);
    expect(found).toEqual(ada);
  });
});
