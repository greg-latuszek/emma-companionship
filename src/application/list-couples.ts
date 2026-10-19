import { openRegistry } from '@/application/open-registry';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CoupleListItem } from '@/types/couple';

export async function listCouples(
  couples: ICoupleRepository = openRegistry().getCoupleRepository()
): Promise<CoupleListItem[]> {
  return couples.listCouples();
}
