import { describe, expect, it, vi } from 'vitest';
import { CoupleNotFound, removeCouple } from '@/application/remove-couple';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import { MemberId } from '@/types/auth';
import type { Couple } from '@/types/couple';

function aCouple(overrides: Partial<Couple> = {}): Couple {
  return {
    id: 'couple-1',
    member1_id: MemberId('11111111-1111-1111-1111-111111111111'),
    member2_id: MemberId('22222222-2222-2222-2222-222222222222'),
    ...overrides,
  };
}

function aCoupleRepository(
  stubs: Partial<ICoupleRepository> = {}
): ICoupleRepository {
  return {
    listCouples: vi.fn(),
    listMarriedPeopleWithoutCouple: vi.fn(),
    findCoupleById: vi.fn().mockResolvedValue(aCouple()),
    addCouple: vi.fn(),
    removeCouple: vi.fn(),
    ...stubs,
  };
}

describe('removeCouple', () => {
  it('removeCouple deletes the couple when it exists', async () => {
    const couples = aCoupleRepository();

    await removeCouple('couple-1', couples);

    expect(couples.removeCouple).toHaveBeenCalledWith('couple-1');
  });

  it('removeCouple tells the caller the couple is missing when the id is unknown', async () => {
    const couples = aCoupleRepository({
      findCoupleById: vi.fn().mockResolvedValue(null),
    });

    await expect(removeCouple('missing', couples)).rejects.toThrow(CoupleNotFound);
    expect(couples.removeCouple).not.toHaveBeenCalled();
  });
});
