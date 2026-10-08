import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { CoupleWrite } from '@/schemas/couple';
import { MemberId } from '@/types/auth';
import type { Couple } from '@/types/couple';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class HusbandAndWifeAreSamePerson extends Error {
  constructor() {
    super('The husband and the wife cannot be the same person');
    this.name = 'HusbandAndWifeAreSamePerson';
  }
}

export function isHusbandAndWifeAreSamePerson(
  error: unknown
): error is HusbandAndWifeAreSamePerson {
  return error instanceof HusbandAndWifeAreSamePerson;
}

export class CoupleParticipantsAreNotEligible extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoupleParticipantsAreNotEligible';
  }
}

export function isCoupleParticipantsAreNotEligible(
  error: unknown
): error is CoupleParticipantsAreNotEligible {
  return error instanceof CoupleParticipantsAreNotEligible;
}

function currentCoupleRepository(): ICoupleRepository {
  startDatabasePool();
  return getRepositoryContainer().getCoupleRepository();
}

function currentCommunityMemberRepository(): ICommunityMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getCommunityMemberRepository();
}

function reportFailedCoupleAdd(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot add a couple. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error('[emma] The registry failed while adding a couple.', error);
}

export async function addCouple(
  write: CoupleWrite,
  couples: ICoupleRepository = currentCoupleRepository(),
  members: ICommunityMemberRepository = currentCommunityMemberRepository()
): Promise<Couple> {
  if (write.husband_id === write.wife_id) {
    throw new HusbandAndWifeAreSamePerson();
  }

  const husband = await members.findCommunityMemberById(MemberId(write.husband_id));
  const wife = await members.findCommunityMemberById(MemberId(write.wife_id));

  if (!husband || !wife) {
    throw new CoupleParticipantsAreNotEligible(
      'Both spouses must exist in the community registry'
    );
  }

  if (husband.gender !== 'male' || wife.gender !== 'female') {
    throw new CoupleParticipantsAreNotEligible(
      'A couple requires a male husband and a female wife'
    );
  }

  if (husband.marital_status !== 'married' || wife.marital_status !== 'married') {
    throw new CoupleParticipantsAreNotEligible(
      'Both spouses must have marital status married'
    );
  }

  const unpaired = await couples.listMarriedPeopleWithoutCouple();
  const unpairedIds = new Set(unpaired.map((person) => person.id));
  if (!unpairedIds.has(husband.id) || !unpairedIds.has(wife.id)) {
    throw new CoupleParticipantsAreNotEligible(
      'Both spouses must be unmarried to a couple in the registry'
    );
  }

  try {
    return await couples.addCouple(write);
  } catch (error) {
    reportFailedCoupleAdd(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
