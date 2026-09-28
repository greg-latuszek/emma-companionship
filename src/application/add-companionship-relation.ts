import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import {
  companionshipRelationWriteWithDefaults,
  type CompanionshipRelationWrite,
} from '@/schemas/companionship-relation';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class CompanionAndAccompaniedAreSamePerson extends Error {
  constructor() {
    super('The companion and the accompanied person cannot be the same');
    this.name = 'CompanionAndAccompaniedAreSamePerson';
  }
}

export function isCompanionAndAccompaniedAreSamePerson(
  error: unknown
): error is CompanionAndAccompaniedAreSamePerson {
  return error instanceof CompanionAndAccompaniedAreSamePerson;
}

function currentCompanionshipRelationRepository(): ICompanionshipRelationRepository {
  startDatabasePool();
  return getRepositoryContainer().getCompanionshipRelationRepository();
}

function reportFailedCompanionshipRelationAdd(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot add a companionship relation. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error('[emma] The registry failed while adding a companionship relation.', error);
}

export async function addCompanionshipRelation(
  write: CompanionshipRelationWrite,
  relations: ICompanionshipRelationRepository = currentCompanionshipRelationRepository()
): Promise<CompanionshipRelation> {
  if (write.companion_id === write.accompanied_id) {
    throw new CompanionAndAccompaniedAreSamePerson();
  }

  const writeWithDefaults = companionshipRelationWriteWithDefaults(write);

  try {
    return await relations.addCompanionshipRelation(writeWithDefaults);
  } catch (error) {
    reportFailedCompanionshipRelationAdd(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
