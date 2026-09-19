/**
 * Member Repository Port
 * Live contract for Google OAuth: look up an app_user, or create a pending one.
 * Implementation: PgMemberRepository
 */

import { Member, MemberId } from '@/types/auth';

export interface CreateMemberInput {
  first_name: string;
  last_name: string;
  email: string;
  oauth_provider: string;
  oauth_id: string;
  profile_picture?: string | null;
}

/**
 * IMemberRepository - Contract for member operations used by Google OAuth
 */
export interface IMemberRepository {
  findMemberById(id: MemberId): Promise<Member | null>;
  findMemberByEmail(email: string): Promise<Member | null>;
  findMemberByOAuth(provider: string, oauthId: string): Promise<Member | null>;
  createMember(data: CreateMemberInput): Promise<Member>;
}
