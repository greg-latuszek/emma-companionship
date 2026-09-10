/**
 * PrismaRepositoryContainer (Placeholder)
 * Factory for all Prisma-based repository adapters
 *
 * TODO: Implement in COMMIT 4
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { IRoleRepository } from '@/ports/repositories/IRoleRepository';
import { IBlacklistRepository } from '@/ports/repositories/IBlacklistRepository';

import { PrismaMemberRepository } from './PrismaMemberRepository';
import { PrismaRoleRepository } from './PrismaRoleRepository';
import { PrismaBlacklistRepository } from './PrismaBlacklistRepository';

/**
 * Container that provides all repository implementations using Prisma adapter
 * TODO: Complete implementation in COMMIT 4
 */
export class PrismaRepositoryContainer implements IRepositoryContainer {
  private memberRepository: IMemberRepository | null = null;
  private roleRepository: IRoleRepository | null = null;
  private blacklistRepository: IBlacklistRepository | null = null;

  getMemberRepository(): IMemberRepository {
    if (!this.memberRepository) {
      this.memberRepository = new PrismaMemberRepository();
    }
    return this.memberRepository;
  }

  getRoleRepository(): IRoleRepository {
    if (!this.roleRepository) {
      this.roleRepository = new PrismaRoleRepository();
    }
    return this.roleRepository;
  }

  getBlacklistRepository(): IBlacklistRepository {
    if (!this.blacklistRepository) {
      this.blacklistRepository = new PrismaBlacklistRepository();
    }
    return this.blacklistRepository;
  }
}
