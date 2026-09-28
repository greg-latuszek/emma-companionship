/**
 * PgMemberRepository - Pg Adapter
 * Implements IMemberRepository using pg library + raw SQL
 *
 * Auth lookups are scoped to app_user so registry-only rows cannot become a login identity.
 * createMember always inserts a pending Google user (is_active defaults to false in SQL).
 */

import { queryOne } from '@/infrastructure/db/pg';
import { IMemberRepository, CreateMemberInput } from '@/ports/repositories/IMemberRepository';
import { Member, MemberId, type VisualStyle } from '@/types/auth';

const MEMBER_COLUMNS = `
  id, first_name, last_name, email,
  oauth_provider, oauth_id, is_active, revoked_at, profile_picture, visual_style
`;

export class PgMemberRepository implements IMemberRepository {
  async findMemberById(id: MemberId): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT ${MEMBER_COLUMNS} FROM members WHERE id = $1 AND member_type = 'app_user'`,
      [id]
    );
  }

  async findMemberByEmail(email: string): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT ${MEMBER_COLUMNS} FROM members WHERE email = $1 AND member_type = 'app_user'`,
      [email]
    );
  }

  async findMemberByOAuth(
    provider: string,
    oauthId: string
  ): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT ${MEMBER_COLUMNS} FROM members
       WHERE oauth_provider = $1 AND oauth_id = $2 AND member_type = 'app_user'`,
      [provider, oauthId]
    );
  }

  async createMember(data: CreateMemberInput): Promise<Member> {
    const result = await queryOne<Member>(
      `INSERT INTO members (
        first_name, last_name,
        email,
        profile_picture,
        oauth_provider, oauth_id,
        member_type,
        requested_at, created_at, updated_at
      ) VALUES (
        $1, $2,
        $3,
        $4,
        $5, $6,
        'app_user',
        NOW(), NOW(), NOW()
      ) RETURNING ${MEMBER_COLUMNS}`,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.profile_picture || null,
        data.oauth_provider,
        data.oauth_id,
      ]
    );

    if (!result) {
      throw new Error('Failed to create member');
    }

    return result;
  }

  async updateMemberVisualStyle(
    id: MemberId,
    visualStyle: VisualStyle | null
  ): Promise<Member | null> {
    return queryOne<Member>(
      `UPDATE members SET visual_style = $2, updated_at = NOW()
       WHERE id = $1 AND member_type = 'app_user'
       RETURNING ${MEMBER_COLUMNS}`,
      [id, visualStyle]
    );
  }
}
