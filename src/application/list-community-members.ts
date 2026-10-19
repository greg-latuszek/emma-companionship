import { openRegistry } from '@/application/open-registry';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CommunityMember } from '@/types/community-member';

export async function listCommunityMembers(
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
): Promise<CommunityMember[]> {
  return members.listCommunityMembers();
}
