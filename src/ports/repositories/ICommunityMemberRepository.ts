/**
 * Community member registry port.
 * List, load, write, and remove people in members. Login stays on IMemberRepository.
 * Implementation: PgCommunityMemberRepository
 */

import type { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { CommunityMemberWriteWithDefaults } from '@/schemas/community-member';

export interface ICommunityMemberRepository {
  listCommunityMembers(): Promise<CommunityMember[]>;
  findCommunityMemberById(id: MemberId): Promise<CommunityMember | null>;
  findCommunityMemberByEmail(email: string): Promise<CommunityMember | null>;
  addCommunityMember(write: CommunityMemberWriteWithDefaults): Promise<CommunityMember>;
  updateCommunityMember(
    id: MemberId,
    write: CommunityMemberWriteWithDefaults
  ): Promise<CommunityMember | null>;
  removeCommunityMember(id: MemberId): Promise<boolean>;
}
