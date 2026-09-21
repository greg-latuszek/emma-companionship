import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';

function currentCommunityMemberRepository(): ICommunityMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getCommunityMemberRepository();
}

export async function findCommunityMemberById(
  id: MemberId,
  members: ICommunityMemberRepository = currentCommunityMemberRepository()
): Promise<CommunityMember | null> {
  return members.findCommunityMemberById(id);
}
