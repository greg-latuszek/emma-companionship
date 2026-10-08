import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CoupleListItem } from '@/types/couple';

function currentCoupleRepository(): ICoupleRepository {
  startDatabasePool();
  return getRepositoryContainer().getCoupleRepository();
}

export async function listCouples(
  couples: ICoupleRepository = currentCoupleRepository()
): Promise<CoupleListItem[]> {
  return couples.listCouples();
}
