import { openRegistry } from '@/application/open-registry';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { MarriedPersonWithoutCouple } from '@/types/couple';

export async function listMarriedPeopleWithoutCouple(
  couples: ICoupleRepository = openRegistry().getCoupleRepository()
): Promise<MarriedPersonWithoutCouple[]> {
  return couples.listMarriedPeopleWithoutCouple();
}
