/**
 * PgCommunityMemberRepository — registry adapter.
 * Reads every members row. oauth_id only sets hasLoginIdentity.
 */

import { queryMany, queryOne } from '@/infrastructure/db/pg';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
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
}
