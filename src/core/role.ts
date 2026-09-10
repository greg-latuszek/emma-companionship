/**
 * Role Repository
 * Database queries for role and role assignment operations
 */

import { queryOne, queryMany } from './db';
import {
  Role,
  RoleAssignment,
  RoleId,
  MemberId,
  RoleAssignmentId,
  GeographicUnitId,
} from '@/types/auth';

/**
 * Find a role by ID
 */
export async function findRoleById(id: RoleId): Promise<Role | null> {
  return queryOne<Role>(
    `SELECT * FROM roles WHERE id = $1`,
    [id]
  );
}

/**
 * Find a role by name and level (role matrix lookup)
 */
export async function findRoleByNameAndLevel(
  name: string,
  level: string
): Promise<Role | null> {
  return queryOne<Role>(
    `SELECT * FROM roles WHERE name = $1 AND level = $2`,
    [name, level]
  );
}

/**
 * Get all roles with optional filtering by level
 */
export async function getAllRoles(level?: string): Promise<Role[]> {
  if (level) {
    return queryMany<Role>(
      `SELECT * FROM roles WHERE level = $1 ORDER BY name, level`,
      [level]
    );
  }
  return queryMany<Role>(
    `SELECT * FROM roles ORDER BY name, level`
  );
}

/**
 * Get all roles defined in the role matrix
 */
export async function getRoleMatrix(): Promise<
  Array<{ name: string; level: string; roles: Role[] }>
> {
  const roles = await queryMany<Role>(
    `SELECT DISTINCT name, level FROM roles ORDER BY name, level`
  );

  // Group by name
  const grouped = new Map<string, Role[]>();
  for (const role of roles) {
    if (!grouped.has(role.name)) {
      grouped.set(role.name, []);
    }
    grouped.get(role.name)?.push(role);
  }

  return Array.from(grouped.entries()).map(([name, roles]) => ({
    name,
    level: roles[0]?.level || '',
    roles,
  }));
}

/**
 * Create a role assignment
 */
export async function assignRole(data: {
  member_id: MemberId;
  role_id: RoleId;
  scope_id?: GeographicUnitId | null;
  assigned_by: MemberId; // admin member ID
}): Promise<RoleAssignment> {
  const result = await queryOne<RoleAssignment>(
    `INSERT INTO role_assignments (member_id, role_id, scope_id, assigned_by, assigned_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [data.member_id, data.role_id, data.scope_id || null, data.assigned_by]
  );

  if (!result) {
    throw new Error('Failed to assign role');
  }

  return result;
}

/**
 * Get all active role assignments for a member
 */
export async function getMemberRoleAssignments(
  memberId: MemberId
): Promise<RoleAssignment[]> {
  return queryMany<RoleAssignment>(
    `SELECT * FROM role_assignments 
     WHERE member_id = $1 AND revoked_at IS NULL
     ORDER BY assigned_at DESC`,
    [memberId]
  );
}

/**
 * Get all active role assignments for a role
 */
export async function getRoleAssignments(roleId: RoleId): Promise<RoleAssignment[]> {
  return queryMany<RoleAssignment>(
    `SELECT * FROM role_assignments 
     WHERE role_id = $1 AND revoked_at IS NULL
     ORDER BY assigned_at DESC`,
    [roleId]
  );
}

/**
 * Get all active members with a specific role
 */
export async function getMembersWithRole(roleId: RoleId): Promise<MemberId[]> {
  const results = await queryMany<{ member_id: string }>(
    `SELECT DISTINCT member_id FROM role_assignments 
     WHERE role_id = $1 AND revoked_at IS NULL`,
    [roleId]
  );
  return results.map((r) => MemberId(r.member_id));
}

/**
 * Revoke a role assignment (soft delete via revoked_at)
 */
export async function revokeRoleAssignment(
  assignmentId: RoleAssignmentId,
  adminId: MemberId
): Promise<RoleAssignment> {
  const result = await queryOne<RoleAssignment>(
    `UPDATE role_assignments 
     SET revoked_by = $1, revoked_at = NOW()
     WHERE id = $2 AND revoked_at IS NULL
     RETURNING *`,
    [adminId, assignmentId]
  );

  if (!result) {
    throw new Error('Role assignment not found or already revoked');
  }

  return result;
}

/**
 * Revoke all roles for a member (except those already revoked)
 */
export async function revokeMemberRoles(
  memberId: MemberId,
  adminId: MemberId
): Promise<RoleAssignment[]> {
  return queryMany<RoleAssignment>(
    `UPDATE role_assignments 
     SET revoked_by = $1, revoked_at = NOW()
     WHERE member_id = $2 AND revoked_at IS NULL
     RETURNING *`,
    [adminId, memberId]
  );
}

/**
 * Update scope for a role assignment
 * Note: This should rarely happen - better to revoke and reassign
 */
export async function updateRoleAssignmentScope(
  assignmentId: RoleAssignmentId,
  newScopeId: GeographicUnitId | null
): Promise<RoleAssignment> {
  const result = await queryOne<RoleAssignment>(
    `UPDATE role_assignments 
     SET scope_id = $1
     WHERE id = $2 AND revoked_at IS NULL
     RETURNING *`,
    [newScopeId, assignmentId]
  );

  if (!result) {
    throw new Error('Role assignment not found');
  }

  return result;
}

/**
 * Get assignment history for audit trail
 */
export async function getRoleAssignmentHistory(
  memberId: MemberId
): Promise<(RoleAssignment & { role_name: string; role_level: string })[]> {
  return queryMany(
    `SELECT ra.*, r.name as role_name, r.level as role_level
     FROM role_assignments ra
     INNER JOIN roles r ON r.id = ra.role_id
     WHERE ra.member_id = $1
     ORDER BY ra.assigned_at DESC`,
    [memberId]
  );
}

/**
 * Check if a role assignment exists (for duplicate prevention)
 */
export async function roleAssignmentExists(
  memberId: MemberId,
  roleId: RoleId,
  scopeId?: GeographicUnitId | null
): Promise<boolean> {
  let query = `
    SELECT EXISTS(
      SELECT 1 FROM role_assignments 
      WHERE member_id = $1 AND role_id = $2 AND revoked_at IS NULL
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [memberId, roleId];

  if (scopeId) {
    query += ` AND scope_id = $3`;
    values.push(scopeId);
  } else {
    query += ` AND scope_id IS NULL`;
  }

  query += `) as exists`;

  const result = await queryOne<{ exists: boolean }>(query, values);
  return result?.exists || false;
}
