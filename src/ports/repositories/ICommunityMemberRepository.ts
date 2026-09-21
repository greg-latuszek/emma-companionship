/**
 * Community member registry port.
 * List and load people in members. Login stays on IMemberRepository.
 * Implementation: PgCommunityMemberRepository
 */

import type { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';

export interface ICommunityMemberRepository {
  listCommunityMembers(): Promise<CommunityMember[]>;
  findCommunityMemberById(id: MemberId): Promise<CommunityMember | null>;
}
