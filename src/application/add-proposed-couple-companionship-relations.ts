/**
 * Persists a Find Companion couple proposal (husband→husband + wife→wife, proposed).
 * Does not require Accompanied spouses to be without an active companion
 * (change-companion entry from Created Companionships).
 */

import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { IAtomicWork } from '@/ports/repositories/IAtomicWork';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  expandProposedCoupleIntoHusbandAndWifeWrites,
  requireDistinctCompanionAndAccompaniedCouples,
} from '@/application/companionship-relation-writes';
import { ProposedCompanionshipAlreadyExists } from '@/application/add-proposed-companionship-relation';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
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

export async function addProposedCoupleCompanionshipRelations(
  write: CoupleCompanionshipWrite,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  couples: ICoupleRepository = openRegistry().getCoupleRepository(),
  atomicWork: IAtomicWork = openRegistry().getAtomicWork()
): Promise<[CompanionshipRelation, CompanionshipRelation]> {
  const [companionCouple, accompaniedCouple] = await requireDistinctCompanionAndAccompaniedCouples(
    write,
    couples
  );

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

  const [husbandWrite, wifeWrite] = expandProposedCoupleIntoHusbandAndWifeWrites(
    companionCouple,
    accompaniedCouple,
    write.notes
  );

  try {
    return await atomicWork.runAsAtomic(async () => {
      const husbandRelation = await relations.addCompanionshipRelation(husbandWrite);
      const wifeRelation = await relations.addCompanionshipRelation(wifeWrite);
      return [husbandRelation, wifeRelation];
    });
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'add proposed couple companionships',
      failedWhile: 'adding proposed couple companionships',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
