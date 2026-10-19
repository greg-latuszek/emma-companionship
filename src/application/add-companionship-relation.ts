import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import {
  refuseDifferentGenderCompanionship,
  refuseSamePersonCompanionship,
} from '@/application/companionship-relation-writes';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
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

export async function addCompanionshipRelation(
  write: CompanionshipRelationWrite,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
): Promise<CompanionshipRelation> {
  refuseSamePersonCompanionship(write);
  await refuseDifferentGenderCompanionship(write, members);

  const writeWithDefaults = companionshipRelationWriteWithDefaults(write);

  try {
    return await relations.addCompanionshipRelation(writeWithDefaults);
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'add a companionship relation',
      failedWhile: 'adding a companionship relation',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
