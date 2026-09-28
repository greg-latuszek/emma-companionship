/**
 * PgRepositoryContainer
 * Factory for Pg-based repository adapters
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { PgCommunityMemberRepository } from './PgCommunityMemberRepository';
import { PgMemberRepository } from './PgMemberRepository';

/**
 * Container that provides repository implementations using the Pg adapter
 */
export class PgRepositoryContainer implements IRepositoryContainer {
  private memberRepository: IMemberRepository | null = null;
  private communityMemberRepository: ICommunityMemberRepository | null = null;

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
}
