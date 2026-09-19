/**
 * Authentication & Authorization Types
 * Interfaces for database models used in the closed-admin-approval auth system
 *
 * Entity-specific branded ID types ensure type safety without coupling to UUID format.
 * Works with any ID backend: PostgreSQL (uuid), MongoDB (ObjectId), DynamoDB (string), nanoid, etc.
 */

// ===== Entity-Specific Branded ID Types =====
// Prevents mixing IDs from different entities at compile time

/** Member entity ID (branded type) */
export type MemberId = string & { readonly __brand: 'MemberId' };
export const MemberId = (id: string): MemberId => id as MemberId;

/** Role entity ID (branded type) */
export type RoleId = string & { readonly __brand: 'RoleId' };
export const RoleId = (id: string): RoleId => id as RoleId;

/** RoleAssignment entity ID (branded type) */
export type RoleAssignmentId = string & { readonly __brand: 'RoleAssignmentId' };
export const RoleAssignmentId = (id: string): RoleAssignmentId =>
  id as RoleAssignmentId;

/** GeographicUnit entity ID (branded type) */
export type GeographicUnitId = string & { readonly __brand: 'GeographicUnitId' };
export const GeographicUnitId = (id: string): GeographicUnitId =>
  id as GeographicUnitId;

/** Couple entity ID (branded type) */
export type CoupleId = string & { readonly __brand: 'CoupleId' };
export const CoupleId = (id: string): CoupleId => id as CoupleId;

/** Blacklist entry ID (branded type) */
export type BlacklistId = string & { readonly __brand: 'BlacklistId' };
export const BlacklistId = (id: string): BlacklistId => id as BlacklistId;

// ===== Database Models =====

export interface Member {
  id: MemberId;
  first_name: string;
  last_name: string;
  gender: string | null;
  marital_status: string | null;
  date_of_birth: string | null; // ISO 8601 date
  consecrated_status: string | null;
  languages: string[] | null; // JSON array
  email: string | null;
  phone: string | null;
  member_type: 'app_user' | 'companion';
  password_hash: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  is_active: boolean;
  profile_picture: string | null;
  geographic_unit_id: GeographicUnitId | null;
  requested_at: Date;
  approved_by: MemberId | null;
  approved_at: Date | null;
  revoked_by: MemberId | null; // Admin who revoked approval (null = never revoked)
  revoked_at: Date | null; // When approval was revoked (null = not revoked or still active)
  registry_check_result: RegistryCheckResult | null; // JSON object
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: RoleId;
  name: string;
  level: 'country' | 'province' | 'sector' | 'zone' | 'international';
  description: string | null;
  created_at: Date;
}

export interface RoleAssignment {
  id: RoleAssignmentId;
  member_id: MemberId;
  role_id: RoleId;
  scope_id: GeographicUnitId | null; // Geographic unit ID (nullable, assigned later)
  assigned_by: MemberId;
  assigned_at: Date;
  revoked_by: MemberId | null; // Admin who revoked this
  revoked_at: Date | null; // When revoked (null = active)
}

export interface Blacklist {
  id: BlacklistId;
  email: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  reason: string;
  blacklisted_by: MemberId;
  blacklisted_at: Date;
  unblacklisted_by: MemberId | null;
  unblacklisted_at: Date | null;
}

export interface RegistryCheckResult {
  emailMatch: boolean;
  phoneMatch: boolean;
  nameMatch: boolean;
  registryEntry?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    geographicUnit: string;
  };
  mismatches?: Record<string, string>;
  recommendation: string;
  checked_at: Date;
}

export interface GeographicUnit {
  id: GeographicUnitId;
  name: string;
  type: 'country' | 'province' | 'sector' | 'zone' | 'international';
  parent_id: GeographicUnitId | null;
  created_at: Date;
}

export interface Couple {
  id: CoupleId;
  member_1_id: MemberId;
  member_2_id: MemberId;
  wedding_date: string | null; // ISO 8601 date
  created_at: Date;
}

// ===== Session & JWT Claims =====

export interface SessionUser {
  id: MemberId;
  email: string;
  firstName: string;
  lastName: string;
  memberType: 'app_user' | 'companion';
  roles: Array<{
    name: string;
    level: string;
    scopeId: GeographicUnitId | null;
  }>;
}

export interface JWTClaims {
  sub: MemberId; // member ID
  email: string;
  roles: Array<{
    name: string;
    level: string;
  }>;
  iat: number;
  exp: number;
}
