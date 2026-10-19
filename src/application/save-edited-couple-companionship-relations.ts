import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  expandCoupleIntoHusbandAndWifeWrites,
  requireDistinctCompanionAndAccompaniedCouples,
} from '@/application/companionship-relation-writes';
import {
  CoupleCompanionshipParticipantsAreNotEligible,
  isCoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/add-couple-companionship-relations';
import {
  CompanionshipRelationNotFound,
  isCompanionshipRelationNotFound,
} from '@/application/update-companionship-relation';
import type { CoupleCompanionshipWrite } from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  CompanionAndAccompaniedAreSameCouple,
  isCompanionAndAccompaniedAreSameCouple,
} from '@/application/add-couple-companionship-relations';

export {
  CoupleCompanionshipParticipantsAreNotEligible,
  isCoupleCompanionshipParticipantsAreNotEligible,
};

export {
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
  const [companionCouple, accompaniedCouple] = await requireDistinctCompanionAndAccompaniedCouples(
    write,
    couples
  );

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

  const [husbandWrite, wifeWrite] = expandCoupleIntoHusbandAndWifeWrites(
    companionCouple,
    accompaniedCouple,
    {
      status: 'active',
      start_date: write.start_date,
      end_date: write.end_date,
      notes: write.notes,
    }
  );

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
