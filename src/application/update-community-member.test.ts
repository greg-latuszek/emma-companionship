import { describe, expect, it, vi } from 'vitest';
import { DuplicateCommunityMemberEmail } from '@/application/add-community-member';
import {
  CommunityMemberNotFound,
  updateCommunityMember,
} from '@/application/update-community-member';
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
    notes: 'Met last spring',
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
    notes: 'Met last spring',
    profile_picture: null,
    hasLoginIdentity: false,
    ...overrides,
  };
}

function aCommunityMemberRepository(
  stubs: Partial<ICommunityMemberRepository> = {}
): ICommunityMemberRepository {
  const ada = aCommunityMember();
  return {
    listCommunityMembers: vi.fn(),
    findCommunityMemberById: vi.fn().mockResolvedValue(ada),
    findCommunityMemberByEmail: vi.fn().mockResolvedValue(null),
    addCommunityMember: vi.fn(),
    updateCommunityMember: vi.fn().mockResolvedValue(ada),
    removeCommunityMember: vi.fn(),
    ...stubs,
  };
}

describe('updateCommunityMember', () => {
  it('updateCommunityMember writes notes without touching oauth or is_active', async () => {
    const members = aCommunityMemberRepository();

    await updateCommunityMember(
      MemberId('member-1'),
      aCommunityMemberWrite({ notes: 'Prefers morning meetings' }),
      members
    );

    const stored = vi.mocked(members.updateCommunityMember).mock.calls[0]?.[1];
    expect(stored).toEqual(
      expect.objectContaining({ notes: 'Prefers morning meetings' })
    );
    expect(stored).not.toHaveProperty('oauth_provider');
    expect(stored).not.toHaveProperty('oauth_id');
    expect(stored).not.toHaveProperty('is_active');
    expect(stored).not.toHaveProperty('member_type');
    expect(stored).not.toHaveProperty('profile_picture');
  });

  it('updateCommunityMember tells the Delegate when the person is not in the registry', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockResolvedValue(null),
    });

    await expect(
      updateCommunityMember(MemberId('missing'), aCommunityMemberWrite(), members)
    ).rejects.toBeInstanceOf(CommunityMemberNotFound);

    expect(members.updateCommunityMember).not.toHaveBeenCalled();
  });

  it('updateCommunityMember refuses an email owned by a different member', async () => {
    const members = aCommunityMemberRepository({
      findCommunityMemberByEmail: vi.fn().mockResolvedValue(
        aCommunityMember({
          id: MemberId('member-2'),
          email: 'taken@example.com',
        })
      ),
    });

    await expect(
      updateCommunityMember(
        MemberId('member-1'),
        aCommunityMemberWrite({ email: 'taken@example.com' }),
        members
      )
    ).rejects.toBeInstanceOf(DuplicateCommunityMemberEmail);

    expect(members.updateCommunityMember).not.toHaveBeenCalled();
  });
});
