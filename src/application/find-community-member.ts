import { openRegistry } from '@/application/open-registry';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';

export async function findCommunityMemberById(
  id: MemberId,
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
): Promise<CommunityMember | null> {
  return members.findCommunityMemberById(id);
}
