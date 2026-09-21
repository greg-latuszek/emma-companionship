import { describe, expect, it } from 'vitest';
import {
  communityMemberWriteSchema,
  communityMemberWriteWithDefaults,
  type CommunityMemberWrite,
} from '@/schemas/community-member';

function aCommunityMemberWrite(
  overrides: Partial<CommunityMemberWrite> = {}
): CommunityMemberWrite {
  return {
    first_name: 'Ada',
    last_name: 'Lovelace',
    gender: null,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
    email: null,
    phone: null,
    notes: null,
    ...overrides,
  };
}

describe('community member write', () => {
  it('communityMemberWriteWithDefaults sets accompanying_readiness to Not Candidate when the write omits it', () => {
    const write = aCommunityMemberWrite();

    const writeWithDefaults = communityMemberWriteWithDefaults(write);

    expect(writeWithDefaults.accompanying_readiness).toBe('Not Candidate');
  });

  it('the community member schema refuses a gender that the members table would reject', () => {
    const write = aCommunityMemberWrite({
      gender: 'unknown' as CommunityMemberWrite['gender'],
    });

    const parsed = communityMemberWriteSchema.safeParse(write);

    expect(parsed.success).toBe(false);
  });

  it('the community member schema refuses a blank first_name', () => {
    const write = aCommunityMemberWrite({ first_name: '   ' });

    const parsed = communityMemberWriteSchema.safeParse(write);

    expect(parsed.success).toBe(false);
  });

  it('the community member schema stores a blank email as no email', () => {
    const write = aCommunityMemberWrite({ email: '   ' });

    const parsed = communityMemberWriteSchema.safeParse(write);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBeNull();
    }
  });
});
