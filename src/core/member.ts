/**
 * Member Repository
 * Database queries for member CRUD operations
 */

import { queryOne, queryMany } from './db';
import {
  Member,
  Role,
  MemberId,
  GeographicUnitId,
} from '@/types/auth';

/**
 * Find a member by ID
 */
export async function findMemberById(id: MemberId): Promise<Member | null> {
  return queryOne<Member>(
    `SELECT * FROM members WHERE id = $1`,
    [id]
  );
}

/**
 * Find a member by email
 */
export async function findMemberByEmail(email: string): Promise<Member | null> {
  return queryOne<Member>(
    `SELECT * FROM members WHERE email = $1 AND member_type = 'app_user'`,
    [email]
  );
}

/**
 * Find a member by OAuth credentials
 */
export async function findMemberByOAuth(
  provider: string,
  oauthId: string
): Promise<Member | null> {
  return queryOne<Member>(
    `SELECT * FROM members WHERE oauth_provider = $1 AND oauth_id = $2`,
    [provider, oauthId]
  );
}

/**
 * Check if email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM members 
      WHERE email = $1 AND member_type = 'app_user'
    ) as exists`,
    [email]
  );
  return result?.exists || false;
}

/**
 * Check if OAuth account is already registered
 */
export async function isOAuthRegistered(
  provider: string,
  oauthId: string
): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM members 
      WHERE oauth_provider = $1 AND oauth_id = $2
    ) as exists`,
    [provider, oauthId]
  );
  return result?.exists || false;
}

/**
 * Create a new member (registration request)
 */
export async function createMember(data: {
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
}): Promise<Member> {
  const result = await queryOne<Member>(
    `INSERT INTO members (
      first_name, last_name, email, phone, member_type, 
      password_hash, oauth_provider, oauth_id, profile_picture, 
      languages, requested_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW()
    ) RETURNING *`,
    [
      data.first_name,
      data.last_name,
      data.email || null,
      data.phone || null,
      data.member_type,
      data.password_hash || null,
      data.oauth_provider || null,
      data.oauth_id || null,
      data.profile_picture || null,
      data.languages ? JSON.stringify(data.languages) : null,
    ]
  );

  if (!result) {
    throw new Error('Failed to create member');
  }

  return result;
}

/**
 * Update member profile
 */
export async function updateMemberProfile(
  memberId: MemberId,
  data: Partial<Member>
): Promise<Member> {
  const updates: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];
  let paramCount = 1;

  // Dynamically build SET clause for provided fields
  if (data.first_name !== undefined) {
    updates.push(`first_name = $${paramCount++}`);
    values.push(data.first_name);
  }
  if (data.last_name !== undefined) {
    updates.push(`last_name = $${paramCount++}`);
    values.push(data.last_name);
  }
  if (data.email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(data.email);
  }
  if (data.phone !== undefined) {
    updates.push(`phone = $${paramCount++}`);
    values.push(data.phone);
  }
  if (data.profile_picture !== undefined) {
    updates.push(`profile_picture = $${paramCount++}`);
    values.push(data.profile_picture);
  }
  if (data.gender !== undefined) {
    updates.push(`gender = $${paramCount++}`);
    values.push(data.gender);
  }
  if (data.marital_status !== undefined) {
    updates.push(`marital_status = $${paramCount++}`);
    values.push(data.marital_status);
  }
  if (data.languages !== undefined) {
    updates.push(`languages = $${paramCount++}`);
    values.push(data.languages ? JSON.stringify(data.languages) : null);
  }

  updates.push(`updated_at = NOW()`);
  values.push(memberId);

  const result = await queryOne<Member>(
    `UPDATE members SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  if (!result) {
    throw new Error('Member not found');
  }

  return result;
}

/**
 * Approve a member registration (admin only)
 */
export async function approveMember(
  memberId: MemberId,
  adminId: MemberId
): Promise<Member> {
  const result = await queryOne<Member>(
    `UPDATE members 
     SET approved_by = $1, approved_at = NOW(), updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [adminId, memberId]
  );

  if (!result) {
    throw new Error('Member not found');
  }

  return result;
}

/**
 * Get member roles
 */
export async function getMemberRoles(
  memberId: MemberId
): Promise<Array<Role & { scope_id: GeographicUnitId | null }>> {
  return queryMany(
    `SELECT r.*, ra.scope_id FROM roles r
     INNER JOIN role_assignments ra ON r.id = ra.role_id
     WHERE ra.member_id = $1 AND ra.revoked_at IS NULL
     ORDER BY r.level, r.name`,
    [memberId]
  );
}

/**
 * Check if member has a specific role
 */
export async function memberHasRole(
  memberId: MemberId,
  roleName: string,
  roleLevel?: string
): Promise<boolean> {
  let query = `
    SELECT EXISTS(
      SELECT 1 FROM role_assignments ra
      INNER JOIN roles r ON r.id = ra.role_id
      WHERE ra.member_id = $1 
      AND r.name = $2
      AND ra.revoked_at IS NULL
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [memberId, roleName];

  if (roleLevel) {
    query += ` AND r.level = $3`;
    values.push(roleLevel);
  }

  query += `) as has_role`;

  const result = await queryOne<{ has_role: boolean }>(query, values);
  return result?.has_role || false;
}

/**
 * Get member by ID with roles loaded
 */
export async function getMemberWithRoles(
  memberId: MemberId
): Promise<(Member & { roles: Array<Role & { scope_id: GeographicUnitId | null }> }) | null> {
  const member = await findMemberById(memberId);
  if (!member) return null;

  const roles = await getMemberRoles(memberId);

  return {
    ...member,
    roles,
  };
}

/**
 * Delete member (soft delete would be better - mark as inactive)
 */
export async function deactivateMember(memberId: MemberId): Promise<Member> {
  const result = await queryOne<Member>(
    `UPDATE members 
     SET updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [memberId]
  );

  if (!result) {
    throw new Error('Member not found');
  }

  return result;
}
