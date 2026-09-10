/**
 * Blacklist Repository Port
 * Defines the contract for all blacklist operations
 * Implementations: PgBlacklistRepository, PrismaBlacklistRepository
 */

import { Blacklist, MemberId } from '@/types/auth';

export interface BlacklistEntryInput {
  email?: string | null;
  oauth_provider?: string | null;
  oauth_id?: string | null;
  reason: string;
  blacklisted_by: MemberId;
}

/**
 * IBlacklistRepository - Contract for blacklist operations
 * Any implementation (Pg, Prisma, etc.) must satisfy this interface
 */
export interface IBlacklistRepository {
  isEmailBlacklisted(email: string): Promise<boolean>;
  isOAuthBlacklisted(provider: string, oauthId: string): Promise<boolean>;
  getBlacklistEntry(emailOrProvider?: string, oauthId?: string): Promise<Blacklist | null>;
  addToBlacklist(data: BlacklistEntryInput): Promise<Blacklist>;
  removeFromBlacklist(blacklistId: string, unblacklisted_by: MemberId): Promise<Blacklist>;
  hasRecentRegistrationAttempt(email: string, withinMinutes?: number): Promise<boolean>;
  logRegistrationAttempt(email: string, success: boolean, reason?: string): Promise<void>;
}
