import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  CompanionAndAccompaniedAreSameCouple,
  CoupleCompanionshipParticipantsAreNotEligible,
  isCompanionAndAccompaniedAreSameCouple,
  isCoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/add-couple-companionship-relations';
import {
  CompanionshipRelationNotFound,
  isCompanionshipRelationNotFound,
} from '@/application/update-companionship-relation';
import {
  companionshipRelationWriteWithDefaults,
  type CoupleCompanionshipWrite,
} from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  CompanionAndAccompaniedAreSameCouple,
  CoupleCompanionshipParticipantsAreNotEligible,
  isCompanionAndAccompaniedAreSameCouple,
  isCoupleCompanionshipParticipantsAreNotEligible,
  CompanionshipRelationNotFound,
  isCompanionshipRelationNotFound,
};

/**
 * Couple edit: same Companion couple → in-place update of both active rows;
 * Companion couple changed → archive both and insert the new pair.
 */
export async function saveEditedCoupleCompanionshipRelations(
  husbandRelationId: string,
  wifeRelationId: string,
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

  const husbandRelation =
    await relations.findCompanionshipRelationById(husbandRelationId);
  const wifeRelation =
    await relations.findCompanionshipRelationById(wifeRelationId);

  if (
    !husbandRelation ||
    !wifeRelation ||
    husbandRelation.status !== 'active' ||
    wifeRelation.status !== 'active'
  ) {
    throw new CompanionshipRelationNotFound(husbandRelationId);
  }

  if (
    husbandRelation.accompanied_id !== accompaniedCouple.member1_id ||
    wifeRelation.accompanied_id !== accompaniedCouple.member2_id
  ) {
    throw new CoupleCompanionshipParticipantsAreNotEligible(
      'The active relations must belong to the accompanied couple spouses'
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
    status: 'active' as const,
  };
  const wifeWrite = {
    ...shared,
    companion_id: companionCouple.member2_id,
    accompanied_id: accompaniedCouple.member2_id,
    status: 'active' as const,
  };

  const companionUnchanged =
    husbandRelation.companion_id === companionCouple.member1_id &&
    wifeRelation.companion_id === companionCouple.member2_id;

  try {
    if (companionUnchanged) {
      return await relations.updateCompanionshipRelationPair(
        husbandRelationId,
        wifeRelationId,
        husbandWrite,
        wifeWrite
      );
    }

    return await relations.archiveCompanionshipRelationPairAndAddReplacement(
      husbandRelationId,
      wifeRelationId,
      husbandWrite,
      wifeWrite
    );
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'save edited couple companionship relations',
      failedWhile: 'saving edited couple companionship relations',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
