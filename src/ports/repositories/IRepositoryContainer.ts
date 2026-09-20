/**
 * Repository Container Port
 * Factory interface for repository ports
 * Allows swapping entire adapter implementations via dependency injection
 */

import { IMemberRepository } from './IMemberRepository';

/**
 * IRepositoryContainer - Factory for live repository ports
 * Implementation: PgRepositoryContainer (pg library + raw SQL)
 *
 * Google OAuth only needs the member repository.
 * Add getters here when a second port is on the live path again.
 */
export interface IRepositoryContainer {
  getMemberRepository(): IMemberRepository;
}
