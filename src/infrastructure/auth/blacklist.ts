/**
 * Blacklist Checking Utility
 * Prevents registration of blacklisted users and OAuth accounts
 */

import { query, queryOne } from '@/infrastructure/db/pg';
import { Blacklist, MemberId } from '@/types/auth';

/**
 * Check if an email is blacklisted
 */
export async function isEmailBlacklisted(email: string): Promise<boolean> {
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
export async function isOAuthBlacklisted(
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
export async function getBlacklistEntry(
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
export async function addToBlacklist(
  data: {
    email?: string | null;
    oauth_provider?: string | null;
    oauth_id?: string | null;
    reason: string;
    blacklisted_by: MemberId; // admin member ID
  }
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
export async function removeFromBlacklist(
  blacklistId: string,
  unblacklisted_by: MemberId // admin member ID
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
export async function hasRecentRegistrationAttempt(
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
export async function logRegistrationAttempt(
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
