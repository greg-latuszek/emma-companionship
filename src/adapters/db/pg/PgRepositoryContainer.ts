/**
 * PgRepositoryContainer
 * Factory for Pg-based repository adapters
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { PgMemberRepository } from './PgMemberRepository';

/**
 * Container that provides repository implementations using the Pg adapter
 */
export class PgRepositoryContainer implements IRepositoryContainer {
  private memberRepository: IMemberRepository | null = null;

  getMemberRepository(): IMemberRepository {
    if (!this.memberRepository) {
      this.memberRepository = new PgMemberRepository();
    }
    return this.memberRepository;
  }
}
