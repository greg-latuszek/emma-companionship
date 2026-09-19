/**
 * Role Repository Port
 * Defines the contract for all role operations
 * Implementation: PgRoleRepository
 */

import { Role, RoleAssignment, MemberId, RoleId, RoleAssignmentId, GeographicUnitId } from '@/types/auth';

export interface RoleMatrixEntry {
  name: string;
  level: 'country' | 'province' | 'sector' | 'zone' | 'international';
  description?: string;
}

/**
 * IRoleRepository - Contract for role operations
 * Any adapter (currently Pg) must satisfy this interface
 */
export interface IRoleRepository {
  findRoleById(id: RoleId): Promise<Role | null>;
  findRoleByNameAndLevel(name: string, level: string): Promise<Role | null>;
  getAllRoles(level?: string): Promise<Role[]>;
  getRoleMatrix(): Promise<Array<{ name: string; level: string; roles: Role[] }>>;
  assignRole(data: {
    member_id: MemberId;
    role_id: RoleId;
    scope_id?: GeographicUnitId | null;
    assigned_by: MemberId;
  }): Promise<RoleAssignment>;
  getMemberRoleAssignments(memberId: MemberId): Promise<RoleAssignment[]>;
  getRoleAssignments(roleId: RoleId): Promise<RoleAssignment[]>;
  getMembersWithRole(roleId: RoleId): Promise<MemberId[]>;
  revokeRoleAssignment(assignmentId: RoleAssignmentId, adminId: MemberId): Promise<RoleAssignment>;
  revokeMemberRoles(memberId: MemberId, adminId: MemberId): Promise<RoleAssignment[]>;
  updateRoleAssignmentScope(assignmentId: RoleAssignmentId, newScopeId: GeographicUnitId | null): Promise<RoleAssignment>;
  getRoleAssignmentHistory(memberId: MemberId): Promise<(RoleAssignment & { role_name: string; role_level: string })[]>;
  roleAssignmentExists(memberId: MemberId, roleId: RoleId, scopeId?: GeographicUnitId | null): Promise<boolean>;
}
