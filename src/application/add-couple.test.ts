import { describe, expect, it, vi } from 'vitest';
import {
  addCouple,
  CoupleParticipantsAreNotEligible,
  HusbandAndWifeAreSamePerson,
} from '@/application/add-couple';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CoupleWrite } from '@/schemas/couple';
import { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import type { Couple, MarriedPersonWithoutCouple } from '@/types/couple';

function aCoupleWrite(overrides: Partial<CoupleWrite> = {}): CoupleWrite {
  return {
    husband_id: '11111111-1111-1111-1111-111111111111',
    wife_id: '22222222-2222-2222-2222-222222222222',
    ...overrides,
  };
}

function aCouple(overrides: Partial<Couple> = {}): Couple {
  return {
    id: 'couple-1',
    member1_id: MemberId('11111111-1111-1111-1111-111111111111'),
    member2_id: MemberId('22222222-2222-2222-2222-222222222222'),
    ...overrides,
  };
}

function aCommunityMember(
  overrides: Partial<CommunityMember> = {}
): CommunityMember {
  return {
    id: MemberId('11111111-1111-1111-1111-111111111111'),
    first_name: 'Jan',
    last_name: 'Kowalski',
    gender: 'male',
    marital_status: 'married',
    consecrated_status: null,
    community_engagement_status: null,
    accompanying_readiness: 'Not Candidate',
    email: null,
    phone: null,
    notes: null,
    profile_picture: null,
    hasLoginIdentity: false,
    ...overrides,
  };
}

function anUnpairedPerson(
  overrides: Partial<MarriedPersonWithoutCouple> = {}
): MarriedPersonWithoutCouple {
  return {
    id: MemberId('11111111-1111-1111-1111-111111111111'),
    first_name: 'Jan',
    last_name: 'Kowalski',
    gender: 'male',
    email: null,
    phone: null,
    notes: null,
    ...overrides,
  };
}

function aCoupleRepository(
  stubs: Partial<ICoupleRepository> = {}
): ICoupleRepository {
  return {
    listCouples: vi.fn(),
    listMarriedPeopleWithoutCouple: vi.fn().mockResolvedValue([
      anUnpairedPerson(),
      anUnpairedPerson({
        id: MemberId('22222222-2222-2222-2222-222222222222'),
        first_name: 'Anna',
        last_name: 'Kowalska',
        gender: 'female',
      }),
    ]),
    findCoupleById: vi.fn(),
    addCouple: vi.fn().mockResolvedValue(aCouple()),
    removeCouple: vi.fn(),
    ...stubs,
  };
}

function aCommunityMemberRepository(
  stubs: Partial<ICommunityMemberRepository> = {}
): ICommunityMemberRepository {
  return {
    listCommunityMembers: vi.fn(),
    findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) => {
      if (id === '11111111-1111-1111-1111-111111111111') {
        return aCommunityMember({ id, gender: 'male' });
      }
      if (id === '22222222-2222-2222-2222-222222222222') {
        return aCommunityMember({
          id,
          first_name: 'Anna',
          last_name: 'Kowalska',
          gender: 'female',
        });
      }
      return null;
    }),
    findCommunityMemberByEmail: vi.fn(),
    addCommunityMember: vi.fn(),
    updateCommunityMember: vi.fn(),
    removeCommunityMember: vi.fn(),
    ...stubs,
  };
}

describe('addCouple', () => {
  it('addCouple stores the couple when husband and wife are eligible married people', async () => {
    const couples = aCoupleRepository();
    const members = aCommunityMemberRepository();

    const stored = await addCouple(aCoupleWrite(), couples, members);

    expect(couples.addCouple).toHaveBeenCalledWith(aCoupleWrite());
    expect(stored).toEqual(aCouple());
  });

  it('addCouple refuses when husband and wife are the same person', async () => {
    const couples = aCoupleRepository();
    const members = aCommunityMemberRepository();

    await expect(
      addCouple(
        aCoupleWrite({
          husband_id: '11111111-1111-1111-1111-111111111111',
          wife_id: '11111111-1111-1111-1111-111111111111',
        }),
        couples,
        members
      )
    ).rejects.toThrow(HusbandAndWifeAreSamePerson);
    expect(couples.addCouple).not.toHaveBeenCalled();
  });

  it('addCouple refuses when the husband is not male', async () => {
    const couples = aCoupleRepository();
    const members = aCommunityMemberRepository({
      findCommunityMemberById: vi.fn().mockImplementation(async (id: MemberId) =>
        aCommunityMember({
          id,
          gender: id === '11111111-1111-1111-1111-111111111111' ? 'female' : 'female',
          first_name: id === '11111111-1111-1111-1111-111111111111' ? 'Jan' : 'Anna',
        })
      ),
    });

    await expect(addCouple(aCoupleWrite(), couples, members)).rejects.toThrow(
      CoupleParticipantsAreNotEligible
    );
    expect(couples.addCouple).not.toHaveBeenCalled();
  });

  it('addCouple refuses when either spouse is already in a couple', async () => {
    const couples = aCoupleRepository({
      listMarriedPeopleWithoutCouple: vi.fn().mockResolvedValue([
        anUnpairedPerson({
          id: MemberId('22222222-2222-2222-2222-222222222222'),
          gender: 'female',
          first_name: 'Anna',
          last_name: 'Kowalska',
        }),
      ]),
    });
    const members = aCommunityMemberRepository();

    await expect(addCouple(aCoupleWrite(), couples, members)).rejects.toThrow(
      CoupleParticipantsAreNotEligible
    );
    expect(couples.addCouple).not.toHaveBeenCalled();
  });
});
