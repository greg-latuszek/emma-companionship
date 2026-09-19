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
 * Implementation: PgRepositoryContainer (pg library + raw SQL)
 *
 * Injected at application startup. Add another container here when a second adapter exists.
 */
export interface IRepositoryContainer {
  getMemberRepository(): IMemberRepository;
  getRoleRepository(): IRoleRepository;
  getBlacklistRepository(): IBlacklistRepository;
}
