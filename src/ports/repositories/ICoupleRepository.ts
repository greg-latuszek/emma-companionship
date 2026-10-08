/**
 * Couple registry port.
 * List confirmed marriages, list married people still unpaired, add and remove couples.
 * Do not hang this on ICommunityMemberRepository or ICompanionshipRelationRepository.
 * Implementation: PgCoupleRepository
 */

import type { CoupleWrite } from '@/schemas/couple';
import type {
  Couple,
  CoupleListItem,
  MarriedPersonWithoutCouple,
} from '@/types/couple';

export interface ICoupleRepository {
  listCouples(): Promise<CoupleListItem[]>;
  listMarriedPeopleWithoutCouple(): Promise<MarriedPersonWithoutCouple[]>;
  findCoupleById(id: string): Promise<Couple | null>;
  addCouple(write: CoupleWrite): Promise<Couple>;
  removeCouple(id: string): Promise<void>;
}
