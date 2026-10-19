import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import {
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
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'delete a companionship relation',
      failedWhile: 'deleting a companionship relation',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
