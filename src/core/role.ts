/**
 * Role Repository
 * Database queries for role and role assignment operations
 */

import { queryOne, queryMany } from './db';
import { Role, RoleAssignment } from '@/types/auth';

/**
 * Find a role by ID
 */
export async function findRoleById(id: string): Promise<Role | null> {
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
  member_id: string;
  role_id: string;
  scope_id?: string | null;
  assigned_by: string; // admin member ID
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
  memberId: string
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
export async function getRoleAssignments(roleId: string): Promise<RoleAssignment[]> {
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
export async function getMembersWithRole(roleId: string): Promise<string[]> {
  const results = await queryMany<{ member_id: string }>(
    `SELECT DISTINCT member_id FROM role_assignments 
     WHERE role_id = $1 AND revoked_at IS NULL`,
    [roleId]
  );
  return results.map((r) => r.member_id);
}

/**
 * Revoke a role assignment (soft delete via revoked_at)
 */
export async function revokeRoleAssignment(
  assignmentId: string,
  adminId: string
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
  memberId: string,
  adminId: string
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
  assignmentId: string,
  newScopeId: string | null
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
  memberId: string
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
  memberId: string,
  roleId: string,
  scopeId?: string | null
): Promise<boolean> {
  let query = `
    SELECT EXISTS(
      SELECT 1 FROM role_assignments 
      WHERE member_id = $1 AND role_id = $2 AND revoked_at IS NULL
  `;

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
