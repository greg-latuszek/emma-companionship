/**
 * Repository Container Port
 * Factory interface for repository ports
 * Allows swapping entire adapter implementations via dependency injection
 */

import { ICommunityMemberRepository } from './ICommunityMemberRepository';
import { ICompanionshipRelationRepository } from './ICompanionshipRelationRepository';
import { ICoupleRepository } from './ICoupleRepository';
import { IMemberRepository } from './IMemberRepository';

/**
 * IRepositoryContainer - Factory for live repository ports
 * Implementation: PgRepositoryContainer (pg library + raw SQL)
 *
 * OAuth uses the member repository. The registry uses the community member port.
 * Companionship relations use their own port. Couples use their own port.
 */
export interface IRepositoryContainer {
  getMemberRepository(): IMemberRepository;
  getCommunityMemberRepository(): ICommunityMemberRepository;
  getCompanionshipRelationRepository(): ICompanionshipRelationRepository;
  getCoupleRepository(): ICoupleRepository;
}
