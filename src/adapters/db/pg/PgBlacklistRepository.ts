/**
 * PgBlacklistRepository - Pg Adapter
 * Implements IBlacklistRepository using pg library + raw SQL
 */

import { query, queryOne } from '@/infrastructure/db/pg';
import { IBlacklistRepository, BlacklistEntryInput } from '@/ports/repositories/IBlacklistRepository';
import { Blacklist, MemberId } from '@/types/auth';

export class PgBlacklistRepository implements IBlacklistRepository {
  /**
   * Check if an email is blacklisted
   */
  async isEmailBlacklisted(email: string): Promise<boolean> {
    const result = await queryOne<Blacklist>(
      `SELECT id FROM blacklist 
       WHERE email = $1 AND revoked_at IS NULL`,
      [email]
    );
    return result !== null;
  }

  /**
   * Check if an OAuth account is blacklisted
   */
  async isOAuthBlacklisted(
    provider: string,
    oauthId: string
  ): Promise<boolean> {
    const result = await queryOne<Blacklist>(
      `SELECT id FROM blacklist 
       WHERE oauth_provider = $1 AND oauth_id = $2 AND revoked_at IS NULL`,
      [provider, oauthId]
    );
    return result !== null;
  }

  /**
   * Get blacklist entry details
   */
  async getBlacklistEntry(
    emailOrProvider?: string,
    oauthId?: string
  ): Promise<Blacklist | null> {
    if (emailOrProvider && !oauthId) {
      // Query by email
      return queryOne<Blacklist>(
        `SELECT * FROM blacklist 
         WHERE email = $1 AND revoked_at IS NULL`,
        [emailOrProvider]
      );
    }

    if (emailOrProvider && oauthId) {
      // Query by OAuth
      return queryOne<Blacklist>(
        `SELECT * FROM blacklist 
         WHERE oauth_provider = $1 AND oauth_id = $2 AND revoked_at IS NULL`,
        [emailOrProvider, oauthId]
      );
    }

    return null;
  }

  /**
   * Add entry to blacklist
   */
  async addToBlacklist(
    data: BlacklistEntryInput
  ): Promise<Blacklist> {
    const result = await queryOne<Blacklist>(
      `INSERT INTO blacklist (email, oauth_provider, oauth_id, reason, blacklisted_by, blacklisted_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        data.email || null,
        data.oauth_provider || null,
        data.oauth_id || null,
        data.reason,
        data.blacklisted_by,
      ]
    );

    if (!result) {
      throw new Error('Failed to add entry to blacklist');
    }

    return result;
  }

  /**
   * Remove entry from blacklist (soft delete)
   */
  async removeFromBlacklist(
    blacklistId: string,
    unblacklisted_by: MemberId
  ): Promise<Blacklist> {
    const result = await queryOne<Blacklist>(
      `UPDATE blacklist 
       SET unblacklisted_by = $1, unblacklisted_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [unblacklisted_by, blacklistId]
    );

    if (!result) {
      throw new Error('Blacklist entry not found');
    }

    return result;
  }

  /**
   * Check for duplicate recent registration attempts (DoS prevention)
   */
  async hasRecentRegistrationAttempt(
    email: string,
    withinMinutes: number = 5
  ): Promise<boolean> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM security_events
       WHERE type = 'registration_attempt' 
       AND data->>'email' = $1 
       AND created_at > NOW() - INTERVAL '1 minute' * $2`,
      [email, withinMinutes]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? parseInt(result.count as any, 10) > 2 : false;
  }

  /**
   * Log registration attempt for DoS tracking
   */
  async logRegistrationAttempt(
    email: string,
    success: boolean,
    reason?: string
  ): Promise<void> {
    await query(
      `INSERT INTO security_events (type, data, created_at)
       VALUES ('registration_attempt', $1::jsonb, NOW())`,
      [
        JSON.stringify({
          email,
          success,
          reason: reason || null,
        }),
      ]
    );
  }
}
