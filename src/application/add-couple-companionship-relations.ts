import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  companionshipRelationWriteWithDefaults,
  type CoupleCompanionshipWrite,
} from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class CompanionAndAccompaniedAreSameCouple extends Error {
  constructor() {
    super('The companion couple and the accompanied couple cannot be the same');
    this.name = 'CompanionAndAccompaniedAreSameCouple';
  }
}

export function isCompanionAndAccompaniedAreSameCouple(
  error: unknown
): error is CompanionAndAccompaniedAreSameCouple {
  return error instanceof CompanionAndAccompaniedAreSameCouple;
}

export class CoupleCompanionshipParticipantsAreNotEligible extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoupleCompanionshipParticipantsAreNotEligible';
  }
}

export function isCoupleCompanionshipParticipantsAreNotEligible(
  error: unknown
): error is CoupleCompanionshipParticipantsAreNotEligible {
  return error instanceof CoupleCompanionshipParticipantsAreNotEligible;
}

/**
 * Creates husband→husband and wife→wife companionship rows from two couples.
 */
export async function addCoupleCompanionshipRelations(
  write: CoupleCompanionshipWrite,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  couples: ICoupleRepository = openRegistry().getCoupleRepository()
): Promise<[CompanionshipRelation, CompanionshipRelation]> {
  if (write.companion_couple_id === write.accompanied_couple_id) {
    throw new CompanionAndAccompaniedAreSameCouple();
  }

  const companionCouple = await couples.findCoupleById(write.companion_couple_id);
  const accompaniedCouple = await couples.findCoupleById(
    write.accompanied_couple_id
  );

  if (!companionCouple || !accompaniedCouple) {
    throw new CoupleCompanionshipParticipantsAreNotEligible(
      'Both the companion couple and the accompanied couple must exist'
    );
  }

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

  const shared = companionshipRelationWriteWithDefaults({
    companion_id: companionCouple.member1_id,
    accompanied_id: accompaniedCouple.member1_id,
    status: write.status,
    start_date: write.start_date,
    end_date: write.end_date,
    notes: write.notes,
  });

  const husbandWrite = {
    ...shared,
    companion_id: companionCouple.member1_id,
    accompanied_id: accompaniedCouple.member1_id,
  };
  const wifeWrite = {
    ...shared,
    companion_id: companionCouple.member2_id,
    accompanied_id: accompaniedCouple.member2_id,
  };

  try {
    return await relations.addCompanionshipRelationPair(husbandWrite, wifeWrite);
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
