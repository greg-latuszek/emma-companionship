import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
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

export async function removeCouple(
  id: string,
  couples: ICoupleRepository = openRegistry().getCoupleRepository()
): Promise<void> {
  const existing = await couples.findCoupleById(id);
  if (!existing) {
    throw new CoupleNotFound(id);
  }

  try {
    await couples.removeCouple(id);
  } catch (error) {
    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'remove a couple',
      failedWhile: 'removing a couple',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
