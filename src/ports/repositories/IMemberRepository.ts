/**
 * Member Repository Port
 * Defines the contract for all member operations
 * Implementations: PgMemberRepository, PrismaMemberRepository
 *
 * Field order matches db/migrations/002_members_table.sql for easier verification
 */

import {
  Member,
  Role,
  MemberId,
  GeographicUnitId,
  Couple,
  CoupleId,
} from '@/types/auth';

export interface CreateMemberInput {
  // GROUP 1: CORE IDENTITY (ordered by schema)
  first_name: string;
  last_name: string;
  gender?: string | null;
  marital_status?: string | null;
  date_of_birth?: string | null;
  consecrated_status?: string | null;
  languages?: string[] | null;

  // GROUP 2: CONTACT INFORMATION
  email?: string;
  phone?: string;

  // GROUP 3: IMAGES & NOTES
  image_url?: string | null;
  profile_picture?: string | null;
  notes?: string | null;

  // GROUP 4: ORGANIZATION & STATUS (geographic_unit_id + couple_id handled by assignLocation/makeCouple)
  community_engagement_status?: string | null;
  accompanying_readiness?: string | null;

  // GROUP 5: AUTHENTICATION (app_users only)
  password_hash?: string;
  oauth_provider?: string;
  oauth_id?: string;

  // GROUP 6: MEMBER CLASSIFICATION
  member_type: 'app_user' | 'companion';
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
