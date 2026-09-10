/**
 * Authentication & Authorization Types
 * Interfaces for database models used in the closed-admin-approval auth system
 */

export interface Member {
  id: string;
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
  profile_picture: string | null;
  geographic_unit_id: string | null;
  requested_at: Date;
  approved_by: string | null;
  approved_at: Date | null;
  registry_check_result: RegistryCheckResult | null; // JSON object
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  level: 'sector' | 'province' | 'country' | 'zone' | 'international';
  description: string | null;
  created_at: Date;
}

export interface RoleAssignment {
  id: string;
  member_id: string;
  role_id: string;
  scope_id: string | null; // Geographic unit ID (nullable, assigned later)
  assigned_by: string;
  assigned_at: Date;
  revoked_by: string | null; // Admin who revoked this
  revoked_at: Date | null; // When revoked (null = active)
}

export interface Blacklist {
  id: string;
  email: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  reason: string;
  blacklisted_by: string;
  blacklisted_at: Date;
  unblacklisted_by: string | null;
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
  id: string;
  name: string;
  type: 'sector' | 'province' | 'country' | 'zone' | 'international';
  parent_id: string | null;
  created_at: Date;
}

export interface Couple {
  id: string;
  member_1_id: string;
  member_2_id: string;
  wedding_date: string | null; // ISO 8601 date
  created_at: Date;
}

/**
 * Session & JWT Claims
 */
export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberType: 'app_user' | 'companion';
  roles: Array<{
    name: string;
    level: string;
    scopeId: string | null;
  }>;
}

export interface JWTClaims {
  sub: string; // member ID
  email: string;
  roles: Array<{
    name: string;
    level: string;
  }>;
  iat: number;
  exp: number;
}
