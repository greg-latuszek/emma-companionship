/**
 * Repository Container Port
 * Factory interface for all repositories
 * Allows swapping entire adapter implementations via dependency injection
 */

import { IMemberRepository } from './IMemberRepository';
import { IRoleRepository } from './IRoleRepository';
import { IBlacklistRepository } from './IBlacklistRepository';

/**
 * IRepositoryContainer - Factory for all repository ports
 * Implementations:
 * - PgRepositoryContainer (pg library + raw SQL)
 * - PrismaRepositoryContainer (Prisma ORM)
 *
 * Injected at application startup to switch all adapters at once
 */
export interface IRepositoryContainer {
  getMemberRepository(): IMemberRepository;
  getRoleRepository(): IRoleRepository;
  getBlacklistRepository(): IBlacklistRepository;
}
