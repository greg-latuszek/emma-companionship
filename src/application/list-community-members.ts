import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CommunityMember } from '@/types/community-member';

function currentCommunityMemberRepository(): ICommunityMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getCommunityMemberRepository();
}

export async function listCommunityMembers(
  members: ICommunityMemberRepository = currentCommunityMemberRepository()
): Promise<CommunityMember[]> {
  return members.listCommunityMembers();
}
