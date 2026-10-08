import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class CoupleNotFound extends Error {
  constructor(id: string) {
    super(`Couple with id ${id} not found`);
    this.name = 'CoupleNotFound';
  }
}

export function isCoupleNotFound(error: unknown): error is CoupleNotFound {
  return error instanceof CoupleNotFound;
}

function currentCoupleRepository(): ICoupleRepository {
  startDatabasePool();
  return getRepositoryContainer().getCoupleRepository();
}

function reportFailedCoupleRemove(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot remove a couple. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error('[emma] The registry failed while removing a couple.', error);
}

export async function removeCouple(
  id: string,
  couples: ICoupleRepository = currentCoupleRepository()
): Promise<void> {
  const existing = await couples.findCoupleById(id);
  if (!existing) {
    throw new CoupleNotFound(id);
  }

  try {
    await couples.removeCouple(id);
  } catch (error) {
    reportFailedCoupleRemove(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
