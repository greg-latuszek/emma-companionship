/**
 * Member Repository Port
 * Live contract for OAuth: look up an app_user, or create a pending one.
 * Also stores the login member's visual style. Empty means the default.
 * Implementation: PgMemberRepository
 */

import { Member, MemberId, type VisualStyle } from '@/types/auth';

export interface CreateMemberInput {
  first_name: string;
  last_name: string;
  email: string;
  oauth_provider: string;
  oauth_id: string;
  profile_picture?: string | null;
}

/**
 * IMemberRepository - Contract for member operations used by OAuth recognition
 */
export interface IMemberRepository {
  findMemberById(id: MemberId): Promise<Member | null>;
  findMemberByEmail(email: string): Promise<Member | null>;
  findMemberByOAuth(provider: string, oauthId: string): Promise<Member | null>;
  createMember(data: CreateMemberInput): Promise<Member>;
  updateMemberVisualStyle(
    id: MemberId,
    visualStyle: VisualStyle | null
  ): Promise<Member | null>;
}
