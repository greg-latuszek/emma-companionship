/**
 * PgCommunityMemberRepository — registry adapter.
 * Reads every members row. oauth_id only sets hasLoginIdentity.
 */

import { query, queryMany, queryOne } from '@/infrastructure/db/pg';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CommunityMemberWriteWithDefaults } from '@/schemas/community-member';
import { MemberId } from '@/types/auth';
import type {
  AccompanyingReadiness,
  CommunityEngagementStatus,
  CommunityMember,
  ConsecratedStatus,
  Gender,
  MaritalStatus,
} from '@/types/community-member';

const COMMUNITY_MEMBER_COLUMNS = `
  id, first_name, last_name, gender, marital_status, consecrated_status,
  community_engagement_status, accompanying_readiness, email, phone, notes,
  oauth_provider, oauth_id
`;

type CommunityMemberRow = {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender | null;
  marital_status: MaritalStatus | null;
  consecrated_status: ConsecratedStatus | null;
  community_engagement_status: CommunityEngagementStatus | null;
  accompanying_readiness: AccompanyingReadiness | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
};

function communityMemberFromRow(row: CommunityMemberRow): CommunityMember {
  return {
    id: MemberId(row.id),
    first_name: row.first_name,
    last_name: row.last_name,
    gender: row.gender,
    marital_status: row.marital_status,
    consecrated_status: row.consecrated_status,
    community_engagement_status: row.community_engagement_status,
    accompanying_readiness: row.accompanying_readiness,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    hasLoginIdentity: row.oauth_id != null,
  };
}

export class PgCommunityMemberRepository implements ICommunityMemberRepository {
  async listCommunityMembers(): Promise<CommunityMember[]> {
    const rows = await queryMany<CommunityMemberRow>(
      `SELECT ${COMMUNITY_MEMBER_COLUMNS} FROM members
       ORDER BY last_name, first_name`
    );
    return rows.map(communityMemberFromRow);
  }

  async findCommunityMemberById(id: MemberId): Promise<CommunityMember | null> {
    const row = await queryOne<CommunityMemberRow>(
      `SELECT ${COMMUNITY_MEMBER_COLUMNS} FROM members WHERE id = $1`,
      [id]
    );
    return row ? communityMemberFromRow(row) : null;
  }

  async findCommunityMemberByEmail(email: string): Promise<CommunityMember | null> {
    const row = await queryOne<CommunityMemberRow>(
      `SELECT ${COMMUNITY_MEMBER_COLUMNS} FROM members WHERE email = $1`,
      [email]
    );
    return row ? communityMemberFromRow(row) : null;
  }

  async addCommunityMember(
    write: CommunityMemberWriteWithDefaults
  ): Promise<CommunityMember> {
    const row = await queryOne<CommunityMemberRow>(
      `INSERT INTO members (
        first_name, last_name, gender, marital_status, consecrated_status,
        community_engagement_status, accompanying_readiness, email, phone, notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      ) RETURNING ${COMMUNITY_MEMBER_COLUMNS}`,
      [
        write.first_name,
        write.last_name,
        write.gender,
        write.marital_status,
        write.consecrated_status,
        write.community_engagement_status,
        write.accompanying_readiness,
        write.email,
        write.phone,
        write.notes,
      ]
    );

    if (!row) {
      throw new Error('Failed to add community member');
    }

    return communityMemberFromRow(row);
  }

  async updateCommunityMember(
    id: MemberId,
    write: CommunityMemberWriteWithDefaults
  ): Promise<CommunityMember | null> {
    const row = await queryOne<CommunityMemberRow>(
      `UPDATE members SET
        first_name = $2,
        last_name = $3,
        gender = $4,
        marital_status = $5,
        consecrated_status = $6,
        community_engagement_status = $7,
        accompanying_readiness = $8,
        email = $9,
        phone = $10,
        notes = $11,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${COMMUNITY_MEMBER_COLUMNS}`,
      [
        id,
        write.first_name,
        write.last_name,
        write.gender,
        write.marital_status,
        write.consecrated_status,
        write.community_engagement_status,
        write.accompanying_readiness,
        write.email,
        write.phone,
        write.notes,
      ]
    );

    return row ? communityMemberFromRow(row) : null;
  }

  async removeCommunityMember(id: MemberId): Promise<boolean> {
    const result = await query('DELETE FROM members WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
