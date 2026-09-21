import { describe, expect, it, vi } from 'vitest';
import { CommunityMemberNotFound } from '@/application/update-community-member';
import {
  CannotRemoveCommunityMemberLinkedToOtherData,
  CannotRemoveCommunityMemberWhoCanSignIn,
  removeCommunityMember,
} from '@/application/remove-community-member';
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
    findCommunityMemberById: vi.fn().mockResolvedValue(aCommunityMember()),
    findCommunityMemberByEmail: vi.fn(),
    addCommunityMember: vi.fn(),
    updateCommunityMember: vi.fn(),
    removeCommunityMember: vi.fn().mockResolvedValue(true),
    ...stubs,
  };
}

describe('removeCommunityMember', () => {
  it('removeCommunityMember deletes a registry-only person', async () => {
    const members = aCommunityMemberRepository();

    await removeCommunityMember(MemberId('member-1'), members);

    expect(members.removeCommunityMember).toHaveBeenCalledWith(MemberId('member-1'));
  });

  it('removeCommunityMember refuses a person who can sign in with Google', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockResolvedValue(
        aCommunityMember({ hasLoginIdentity: true })
      ),
    });

    await expect(
      removeCommunityMember(MemberId('member-1'), members)
    ).rejects.toBeInstanceOf(CannotRemoveCommunityMemberWhoCanSignIn);
  });

  it('removeCommunityMember does not call delete when the person can sign in', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockResolvedValue(
        aCommunityMember({ hasLoginIdentity: true })
      ),
    });

    await expect(
      removeCommunityMember(MemberId('member-1'), members)
    ).rejects.toBeInstanceOf(CannotRemoveCommunityMemberWhoCanSignIn);

    expect(members.removeCommunityMember).not.toHaveBeenCalled();
  });

  it('removeCommunityMember tells the Delegate when the person is not in the registry', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockResolvedValue(null),
    });

    await expect(
      removeCommunityMember(MemberId('missing'), members)
    ).rejects.toBeInstanceOf(CommunityMemberNotFound);

    expect(members.removeCommunityMember).not.toHaveBeenCalled();
  });

  it('removeCommunityMember tells the Delegate when the person is linked to other data', async () => {
    const members = aCommunityMemberRepository({
      removeCommunityMember: vi.fn().mockRejectedValue({ code: '23503' }),
    });

    await expect(
      removeCommunityMember(MemberId('member-1'), members)
    ).rejects.toBeInstanceOf(CannotRemoveCommunityMemberLinkedToOtherData);
  });
});
