import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { MarriedPersonWithoutCouple } from '@/types/couple';

function currentCoupleRepository(): ICoupleRepository {
  startDatabasePool();
  return getRepositoryContainer().getCoupleRepository();
}

export async function listMarriedPeopleWithoutCouple(
  couples: ICoupleRepository = currentCoupleRepository()
): Promise<MarriedPersonWithoutCouple[]> {
  return couples.listMarriedPeopleWithoutCouple();
}
