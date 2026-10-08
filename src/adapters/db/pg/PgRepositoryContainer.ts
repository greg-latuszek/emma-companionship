/**
 * PgRepositoryContainer
 * Factory for Pg-based repository adapters
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { PgCommunityMemberRepository } from './PgCommunityMemberRepository';
import { PgCompanionshipRelationRepository } from './PgCompanionshipRelationRepository';
import { PgCoupleRepository } from './PgCoupleRepository';
import { PgMemberRepository } from './PgMemberRepository';

/**
 * Container that provides repository implementations using the Pg adapter
 */
export class PgRepositoryContainer implements IRepositoryContainer {
  private memberRepository: IMemberRepository | null = null;
  private communityMemberRepository: ICommunityMemberRepository | null = null;
  private companionshipRelationRepository: ICompanionshipRelationRepository | null = null;
  private coupleRepository: ICoupleRepository | null = null;

  getMemberRepository(): IMemberRepository {
    if (!this.memberRepository) {
      this.memberRepository = new PgMemberRepository();
    }
    return this.memberRepository;
  }

  getCommunityMemberRepository(): ICommunityMemberRepository {
    if (!this.communityMemberRepository) {
      this.communityMemberRepository = new PgCommunityMemberRepository();
    }
    return this.communityMemberRepository;
  }

  getCompanionshipRelationRepository(): ICompanionshipRelationRepository {
    if (!this.companionshipRelationRepository) {
      this.companionshipRelationRepository = new PgCompanionshipRelationRepository();
    }
    return this.companionshipRelationRepository;
  }

  getCoupleRepository(): ICoupleRepository {
    if (!this.coupleRepository) {
      this.coupleRepository = new PgCoupleRepository();
    }
    return this.coupleRepository;
  }
}
