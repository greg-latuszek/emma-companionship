/**
 * PgRepositoryContainer
 * Factory for all Pg-based repository adapters
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { IRoleRepository } from '@/ports/repositories/IRoleRepository';
import { IBlacklistRepository } from '@/ports/repositories/IBlacklistRepository';

import { PgMemberRepository } from './PgMemberRepository';
import { PgRoleRepository } from './PgRoleRepository';
import { PgBlacklistRepository } from './PgBlacklistRepository';

/**
 * Container that provides all repository implementations using Pg adapter
 * Singleton pattern: all repositories share the same instance
 */
export class PgRepositoryContainer implements IRepositoryContainer {
  private memberRepository: IMemberRepository | null = null;
  private roleRepository: IRoleRepository | null = null;
  private blacklistRepository: IBlacklistRepository | null = null;

  getMemberRepository(): IMemberRepository {
    if (!this.memberRepository) {
      this.memberRepository = new PgMemberRepository();
    }
    return this.memberRepository;
  }

  getRoleRepository(): IRoleRepository {
    if (!this.roleRepository) {
      this.roleRepository = new PgRoleRepository();
    }
    return this.roleRepository;
  }

  getBlacklistRepository(): IBlacklistRepository {
    if (!this.blacklistRepository) {
      this.blacklistRepository = new PgBlacklistRepository();
    }
    return this.blacklistRepository;
  }
}
