/**
 * PrismaBlacklistRepository - Prisma Adapter (Placeholder)
 * Implements IBlacklistRepository using Prisma ORM
 *
 * TODO: Implement in COMMIT 4
 */

import { IBlacklistRepository, BlacklistEntryInput } from '@/ports/repositories/IBlacklistRepository';
import { Blacklist, MemberId } from '@/types/auth';

export class PrismaBlacklistRepository implements IBlacklistRepository {
  async isEmailBlacklisted(_email: string): Promise<boolean> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }

  async isOAuthBlacklisted(_provider: string, _oauthId: string): Promise<boolean> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }

  async getBlacklistEntry(_emailOrProvider?: string, _oauthId?: string): Promise<Blacklist | null> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }

  async addToBlacklist(_data: BlacklistEntryInput): Promise<Blacklist> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }

  async removeFromBlacklist(_blacklistId: string, _unblacklisted_by: MemberId): Promise<Blacklist> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }

  async hasRecentRegistrationAttempt(_email: string, _withinMinutes?: number): Promise<boolean> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }

  async logRegistrationAttempt(_email: string, _success: boolean, _reason?: string): Promise<void> {
    throw new Error('PrismaBlacklistRepository not yet implemented');
  }
}
