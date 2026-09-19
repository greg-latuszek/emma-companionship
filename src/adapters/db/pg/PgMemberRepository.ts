/**
 * PgMemberRepository - Pg Adapter
 * Implements IMemberRepository using pg library + raw SQL
 *
 * Auth lookups are scoped to app_user so registry-only rows cannot become a login identity.
 * createMember always inserts a pending Google user (is_active defaults to false in SQL).
 */

import { queryOne } from '@/infrastructure/db/pg';
import { IMemberRepository, CreateMemberInput } from '@/ports/repositories/IMemberRepository';
import { Member, MemberId } from '@/types/auth';

export class PgMemberRepository implements IMemberRepository {
  async findMemberById(id: MemberId): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT * FROM members WHERE id = $1 AND member_type = 'app_user'`,
      [id]
    );
  }

  async findMemberByEmail(email: string): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT * FROM members WHERE email = $1 AND member_type = 'app_user'`,
      [email]
    );
  }

  async findMemberByOAuth(
    provider: string,
    oauthId: string
  ): Promise<Member | null> {
    return queryOne<Member>(
      `SELECT * FROM members
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
      ) RETURNING *`,
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
}
