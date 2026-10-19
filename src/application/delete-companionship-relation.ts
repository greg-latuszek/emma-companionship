import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class CompanionshipRelationNotFound extends Error {
  constructor(id: string) {
    super(`Companionship relation with id ${id} not found`);
    this.name = 'CompanionshipRelationNotFound';
  }
}

export function isCompanionshipRelationNotFound(
  error: unknown
): error is CompanionshipRelationNotFound {
  return error instanceof CompanionshipRelationNotFound;
}

function reportFailedCompanionshipRelationDelete(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot delete a companionship relation. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(
    '[emma] The registry failed while deleting a companionship relation.',
    error
  );
}

export async function deleteCompanionshipRelation(
  id: string,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository()
): Promise<void> {
  const existing = await relations.findCompanionshipRelationById(id);
  if (!existing) {
    throw new CompanionshipRelationNotFound(id);
  }

  try {
    await relations.deleteCompanionshipRelation(id);
  } catch (error) {
    reportFailedCompanionshipRelationDelete(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
