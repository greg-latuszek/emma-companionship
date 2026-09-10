/**
 * PgMemberRepository - Pg Adapter
 * Implements IMemberRepository using pg library + raw SQL
 *
 * Resource-level operations may touch multiple tables; adapter handles coordination
 */

import { queryOne, queryMany } from '@/infrastructure/db/pg';
import { IMemberRepository, CreateMemberInput, UpdateMemberInput } from '@/ports/repositories/IMemberRepository';
import {
  Member,
  Role,
  MemberId,
  GeographicUnitId,
  Couple,
  CoupleId,
} from '@/types/auth';

export class PgMemberRepository implements IMemberRepository {
  /**
   * Find a member by ID
   */
  async findMemberById(id: MemberId): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT * FROM members WHERE id = $1`,
      [id]
    );
  }

  /**
   * Find a member by email (any member type)
   */
  async findMemberByEmail(email: string): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT * FROM members WHERE email = $1`,
      [email]
    );
  }

  /**
   * Find a member by OAuth credentials
   */
  async findMemberByOAuth(
    provider: string,
    oauthId: string
  ): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT * FROM members WHERE oauth_provider = $1 AND oauth_id = $2`,
      [provider, oauthId]
    );
  }

  /**
   * Check if email is already registered (any member type)
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const result = await queryOne<{ exists: boolean }>(
      `SELECT EXISTS(
        SELECT 1 FROM members 
        WHERE email = $1
      ) as exists`,
      [email]
    );
    return result?.exists || false;
  }

  /**
   * Check if OAuth account is already registered
   */
  async isOAuthRegistered(
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
   * Fields ordered per schema: identity → contact → images → organization → auth → classification
   */
  async createMember(data: CreateMemberInput): Promise<Member> {
    const result = await queryOne<Member>(
      `INSERT INTO members (
        first_name, last_name, gender, marital_status, date_of_birth, consecrated_status, languages,
        email, phone,
        image_url, profile_picture, notes,
        community_engagement_status, accompanying_readiness,
        password_hash, oauth_provider, oauth_id,
        member_type,
        requested_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9,
        $10, $11, $12,
        $13, $14,
        $15, $16, $17,
        $18,
        NOW(), NOW(), NOW()
      ) RETURNING *`,
      [
        data.first_name,
        data.last_name,
        data.gender || null,
        data.marital_status || null,
        data.date_of_birth || null,
        data.consecrated_status || null,
        data.languages ? JSON.stringify(data.languages) : null,
        data.email || null,
        data.phone || null,
        data.image_url || null,
        data.profile_picture || null,
        data.notes || null,
        data.community_engagement_status || null,
        data.accompanying_readiness || null,
        data.password_hash || null,
        data.oauth_provider || null,
        data.oauth_id || null,
        data.member_type,
      ]
    );

    if (!result) {
      throw new Error('Failed to create member');
    }

    return result;
  }

  /**
   * Update member profile
   * Fields ordered per schema for consistency
   */
  async updateMemberProfile(
    memberId: MemberId,
    data: UpdateMemberInput
  ): Promise<Member> {
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];
    let paramCount = 1;

    // GROUP 1: CORE IDENTITY
    if (data.first_name !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(data.last_name);
    }
    if (data.gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      values.push(data.gender);
    }
    if (data.marital_status !== undefined) {
      updates.push(`marital_status = $${paramCount++}`);
      values.push(data.marital_status);
    }
    if (data.date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(data.date_of_birth);
    }
    if (data.consecrated_status !== undefined) {
      updates.push(`consecrated_status = $${paramCount++}`);
      values.push(data.consecrated_status);
    }
    if (data.languages !== undefined) {
      updates.push(`languages = $${paramCount++}`);
      values.push(data.languages ? JSON.stringify(data.languages) : null);
    }

    // GROUP 2: CONTACT INFORMATION
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }

    // GROUP 3: IMAGES & NOTES
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(data.image_url);
    }
    if (data.profile_picture !== undefined) {
      updates.push(`profile_picture = $${paramCount++}`);
      values.push(data.profile_picture);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }

    // GROUP 4: ORGANIZATION & STATUS
    if (data.community_engagement_status !== undefined) {
      updates.push(`community_engagement_status = $${paramCount++}`);
      values.push(data.community_engagement_status);
    }
    if (data.accompanying_readiness !== undefined) {
      updates.push(`accompanying_readiness = $${paramCount++}`);
      values.push(data.accompanying_readiness);
    }

    // GROUP 5: AUTHENTICATION
    if (data.password_hash !== undefined) {
      updates.push(`password_hash = $${paramCount++}`);
      values.push(data.password_hash);
    }
    if (data.oauth_provider !== undefined) {
      updates.push(`oauth_provider = $${paramCount++}`);
      values.push(data.oauth_provider);
    }
    if (data.member_type !== undefined) {
      updates.push(`member_type = $${paramCount++}`);
      values.push(data.member_type);
    }

    // GROUP 6: MEMBER CLASSIFICATION
    if (data.password_hash !== undefined) {
      updates.push(`password_hash = $${paramCount++}`);
      values.push(data.password_hash);
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
  async approveMember(
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
  async getMemberRoles(
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
  async memberHasRole(
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
  async getMemberWithRoles(
    memberId: MemberId
  ): Promise<(Member & { roles: Array<Role & { scope_id: GeographicUnitId | null }> }) | null> {
    const member = await this.findMemberById(memberId);
    if (!member) return null;

    const roles = await this.getMemberRoles(memberId);

    return {
      ...member,
      roles,
    };
  }

  /**
   * Deactivate member
   */
  async deactivateMember(memberId: MemberId): Promise<Member> {
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

  /**
   * Assign member to geographic location
   * Resource operation: may update geographic_unit_id and audit trail
   */
  async assignLocation(memberId: MemberId, geoUnitId: GeographicUnitId): Promise<Member> {
    const result = await queryOne<Member>(
      `UPDATE members 
       SET geographic_unit_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [geoUnitId, memberId]
    );

    if (!result) {
      throw new Error('Member not found');
    }

    return result;
  }

  /**
   * Create couple relationship
   * Resource operation: INSERT into couples + UPDATE members x2
   * Adapter handles multi-table coordination
   */
  async makeCouple(
    member1Id: MemberId,
    member2Id: MemberId,
    weddingDate?: string | null
  ): Promise<Couple> {
    //TODO: need transaction / unitOfWork
    const result = await queryOne<Couple>(
      `INSERT INTO couples (member1_id, member2_id, wedding_date, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, member1_id as member_1_id, member2_id as member_2_id, wedding_date, created_at`,
      [member1Id, member2Id, weddingDate || null]
    );

    if (!result) {
      throw new Error('Failed to create couple');
    }

    // Update both members with couple_id
    await queryOne<Member>(
      `UPDATE members SET couple_id = $1, updated_at = NOW() WHERE id = $2`,
      [result.id, member1Id]
    );

    await queryOne<Member>(
      `UPDATE members SET couple_id = $1, updated_at = NOW() WHERE id = $2`,
      [result.id, member2Id]
    );

    return result;
  }

  /**
   * End couple relationship
   * Resource operation: DELETE couple + UPDATE members x2
   * Adapter handles multi-table coordination
   */
  async endCouple(coupleId: CoupleId): Promise<void> {
    //TODO: need transaction / unitOfWork

    // Get couple info to know which members to update
    const couple = await queryOne<Couple>(
      `SELECT * FROM couples WHERE id = $1`,
      [coupleId]
    );

    if (!couple) {
      throw new Error('Couple not found');
    }

    // Update both members to remove couple_id
    await queryOne<Member>(
      `UPDATE members SET couple_id = NULL, updated_at = NOW() WHERE id = $1`,
      [couple.member_1_id]
    );

    await queryOne<Member>(
      `UPDATE members SET couple_id = NULL, updated_at = NOW() WHERE id = $1`,
      [couple.member_2_id]
    );

    // Delete couple
    await queryOne(
      `DELETE FROM couples WHERE id = $1`,
      [coupleId]
    );
  }
}
