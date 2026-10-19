import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import {
  refuseDifferentGenderCompanionship,
  refuseSamePersonCompanionship,
} from '@/application/companionship-relation-writes';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import {
  CompanionshipRelationNotFound,
  isCompanionshipRelationNotFound,
} from '@/application/update-companionship-relation';
import {
  companionshipRelationWriteWithDefaults,
  type CompanionshipRelationWrite,
} from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  CompanionAndAccompaniedAreSamePerson,
  isCompanionAndAccompaniedAreSamePerson,
} from '@/application/companionship-refusals';

export {
  CompanionAndAccompaniedHaveDifferentGenders,
  isCompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/companionship-participant-genders';

export {
  CompanionshipRelationNotFound,
  isCompanionshipRelationNotFound,
};

/**
 * Person edit: same Companion → in-place update of dates/notes;
 * Companion changed → archive current active row and insert a replacement.
 */
export async function saveEditedCompanionshipRelation(
  relationId: string,
  write: CompanionshipRelationWrite,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
): Promise<CompanionshipRelation> {
  refuseSamePersonCompanionship(write);

  const existing = await relations.findCompanionshipRelationById(relationId);
  if (!existing || existing.status !== 'active') {
    throw new CompanionshipRelationNotFound(relationId);
  }

  if (write.accompanied_id !== existing.accompanied_id) {
    throw new CompanionshipRelationNotFound(relationId);
  }

  await refuseDifferentGenderCompanionship(write, members);

  const writeWithDefaults = companionshipRelationWriteWithDefaults(write);

  try {
    if (existing.companion_id === write.companion_id) {
      return await relations.updateCompanionshipRelation(relationId, {
        ...writeWithDefaults,
        status: 'active',
      });
    }

    return await relations.archiveCompanionshipRelationAndAddReplacement(
      relationId,
      writeWithDefaults
    );
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'save an edited companionship relation',
      failedWhile: 'saving an edited companionship relation',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
