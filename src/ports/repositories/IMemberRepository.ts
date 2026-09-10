/**
 * Member Repository Port
 * Defines the contract for all member operations
 * Implementations: PgMemberRepository, PrismaMemberRepository
 */

import {
  Member,
  Role,
  MemberId,
  GeographicUnitId,
} from '@/types/auth';

export interface CreateMemberInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  member_type: 'app_user' | 'companion';
  password_hash?: string;
  oauth_provider?: string;
  oauth_id?: string;
  profile_picture?: string;
  languages?: string[];
}

export interface UpdateMemberInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_picture?: string;
  gender?: string | null;
  marital_status?: string | null;
  languages?: string[] | null;
}

/**
 * IMemberRepository - Contract for member operations
 * Any implementation (Pg, Prisma, etc.) must satisfy this interface
 */
export interface IMemberRepository {
  findMemberById(id: MemberId): Promise<Member | null>;
  findMemberByEmail(email: string): Promise<Member | null>;
  findMemberByOAuth(provider: string, oauthId: string): Promise<Member | null>;
  isEmailRegistered(email: string): Promise<boolean>;
  isOAuthRegistered(provider: string, oauthId: string): Promise<boolean>;
  createMember(data: CreateMemberInput): Promise<Member>;
  updateMemberProfile(memberId: MemberId, data: UpdateMemberInput): Promise<Member>;
  approveMember(memberId: MemberId, adminId: MemberId): Promise<Member>;
  getMemberRoles(memberId: MemberId): Promise<Array<Role & { scope_id: GeographicUnitId | null }>>;
  memberHasRole(memberId: MemberId, roleName: string, roleLevel?: string): Promise<boolean>;
  getMemberWithRoles(memberId: MemberId): Promise<(Member & { roles: Array<Role & { scope_id: GeographicUnitId | null }> }) | null>;
  deactivateMember(memberId: MemberId): Promise<Member>;
}
