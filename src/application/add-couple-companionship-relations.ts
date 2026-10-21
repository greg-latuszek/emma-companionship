import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import {
  expandCoupleIntoHusbandAndWifeWrites,
  requireDistinctCompanionAndAccompaniedCouples,
} from '@/application/companionship-relation-writes';
import {
  CoupleCompanionshipParticipantsAreNotEligible,
  isCoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/companionship-refusals';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { IAtomicWork } from '@/ports/repositories/IAtomicWork';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  CompanionAndAccompaniedAreSameCouple,
  isCompanionAndAccompaniedAreSameCouple,
} from '@/application/companionship-refusals';

export {
  CoupleCompanionshipParticipantsAreNotEligible,
  isCoupleCompanionshipParticipantsAreNotEligible,
};

/**
 * Creates husband→husband and wife→wife companionship rows from two couples.
 */
export async function addCoupleCompanionshipRelations(
  write: CoupleCompanionshipWrite,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  couples: ICoupleRepository = openRegistry().getCoupleRepository(),
  atomicWork: IAtomicWork = openRegistry().getAtomicWork()
): Promise<[CompanionshipRelation, CompanionshipRelation]> {
  const [companionCouple, accompaniedCouple] = await requireDistinctCompanionAndAccompaniedCouples(
    write,
    couples
  );

  const peopleWithoutCompanion = await relations.listPeopleWithoutCompanion();
  const waitingIds = new Set(
    peopleWithoutCompanion.map((person) => person.id as string)
  );
  if (
    !waitingIds.has(accompaniedCouple.member1_id) ||
    !waitingIds.has(accompaniedCouple.member2_id)
  ) {
    throw new CoupleCompanionshipParticipantsAreNotEligible(
      'Both spouses of the accompanied couple must still need a companion'
    );
  }

  const [husbandWrite, wifeWrite] = expandCoupleIntoHusbandAndWifeWrites(
    companionCouple,
    accompaniedCouple,
    write
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
      cannot: 'add couple companionship relations',
      failedWhile: 'adding couple companionship relations',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
