/**
 * Persists a Find Companion couple proposal (husband→husband + wife→wife, proposed).
 * Does not require Accompanied spouses to be without an active companion (Zmień path).
 */

import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  CompanionAndAccompaniedAreSameCouple,
  CoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/add-couple-companionship-relations';
import { ProposedCompanionshipAlreadyExists } from '@/application/add-proposed-companionship-relation';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  CompanionAndAccompaniedAreSameCouple,
  isCompanionAndAccompaniedAreSameCouple,
  CoupleCompanionshipParticipantsAreNotEligible,
  isCoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/add-couple-companionship-relations';

export {
  ProposedCompanionshipAlreadyExists,
  isProposedCompanionshipAlreadyExists,
} from '@/application/add-proposed-companionship-relation';

function currentCompanionshipRelationRepository(): ICompanionshipRelationRepository {
  startDatabasePool();
  return getRepositoryContainer().getCompanionshipRelationRepository();
}

function currentCoupleRepository(): ICoupleRepository {
  startDatabasePool();
  return getRepositoryContainer().getCoupleRepository();
}

function reportFailedProposedCoupleCompanionshipAdd(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot add proposed couple companionships. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(
    '[emma] The registry failed while adding proposed couple companionships.',
    error
  );
}

export async function addProposedCoupleCompanionshipRelations(
  write: CoupleCompanionshipWrite,
  relations: ICompanionshipRelationRepository = currentCompanionshipRelationRepository(),
  couples: ICoupleRepository = currentCoupleRepository()
): Promise<[CompanionshipRelation, CompanionshipRelation]> {
  if (write.companion_couple_id === write.accompanied_couple_id) {
    throw new CompanionAndAccompaniedAreSameCouple();
  }

  const companionCouple = await couples.findCoupleById(
    write.companion_couple_id
  );
  const accompaniedCouple = await couples.findCoupleById(
    write.accompanied_couple_id
  );

  if (!companionCouple || !accompaniedCouple) {
    throw new CoupleCompanionshipParticipantsAreNotEligible(
      'Both the companion couple and the accompanied couple must exist'
    );
  }

  const existingProposals =
    await relations.listProposedCompanionshipRelationsForAccompanied([
      accompaniedCouple.member1_id,
      accompaniedCouple.member2_id,
    ]);
  if (
    existingProposals.some(
      (proposal) =>
        proposal.companion.id === companionCouple.member1_id ||
        proposal.companion.id === companionCouple.member2_id
    )
  ) {
    throw new ProposedCompanionshipAlreadyExists();
  }

  const husbandWrite = {
    companion_id: companionCouple.member1_id,
    accompanied_id: accompaniedCouple.member1_id,
    status: 'proposed' as const,
    start_date: null,
    end_date: null,
    notes: write.notes ?? null,
  };
  const wifeWrite = {
    companion_id: companionCouple.member2_id,
    accompanied_id: accompaniedCouple.member2_id,
    status: 'proposed' as const,
    start_date: null,
    end_date: null,
    notes: write.notes ?? null,
  };

  try {
    return await relations.addCompanionshipRelationPair(husbandWrite, wifeWrite);
  } catch (error) {
    reportFailedProposedCoupleCompanionshipAdd(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
