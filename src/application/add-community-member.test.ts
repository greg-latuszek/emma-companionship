import { describe, expect, it, vi } from 'vitest';
import {
  addCommunityMember,
  DuplicateCommunityMemberEmail,
} from '@/application/add-community-member';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CommunityMemberWrite } from '@/schemas/community-member';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';

function aCommunityMemberWrite(
  overrides: Partial<CommunityMemberWrite> = {}
): CommunityMemberWrite {
  return {
    first_name: 'Ada',
    last_name: 'Lovelace',
    gender: 'female',
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
    email: null,
    phone: null,
    notes: null,
    ...overrides,
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
    email: null,
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
    findCommunityMemberByEmail: vi.fn().mockResolvedValue(null),
    addCommunityMember: vi.fn().mockResolvedValue(aCommunityMember()),
    ...stubs,
  };
}

describe('addCommunityMember', () => {
  it('addCommunityMember stores Not Candidate when the Delegate omits accompanying readiness', async () => {
    const members = aCommunityMemberRepository();

    await addCommunityMember(aCommunityMemberWrite(), members);

    expect(members.addCommunityMember).toHaveBeenCalledWith(
      expect.objectContaining({ accompanying_readiness: 'Not Candidate' })
    );
  });

  it('addCommunityMember does not mark the new person as an app login', async () => {
    const members = aCommunityMemberRepository();

    await addCommunityMember(aCommunityMemberWrite(), members);

    const stored = vi.mocked(members.addCommunityMember).mock.calls[0]?.[0];
    expect(stored).toBeDefined();
    expect(stored).not.toHaveProperty('member_type');
    expect(stored).not.toHaveProperty('oauth_provider');
    expect(stored).not.toHaveProperty('oauth_id');
    expect(stored).not.toHaveProperty('is_active');
  });

  it('addCommunityMember refuses an email another member already has', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberByEmail: vi.fn().mockResolvedValue(aCommunityMember({
        email: 'ada@example.com',
      })),
    });

    await expect(
      addCommunityMember(aCommunityMemberWrite({ email: 'ada@example.com' }), members)
    ).rejects.toBeInstanceOf(DuplicateCommunityMemberEmail);

    expect(members.addCommunityMember).not.toHaveBeenCalled();
  });
});
