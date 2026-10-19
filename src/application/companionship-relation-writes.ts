import {
  CompanionAndAccompaniedAreSameCouple,
  CompanionAndAccompaniedAreSamePerson,
  CoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/companionship-refusals';
import {
  CompanionAndAccompaniedHaveDifferentGenders,
  companionshipParticipantsHaveDifferentGenders,
} from '@/application/companionship-participant-genders';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import {
  companionshipRelationWriteWithDefaults,
  type CompanionshipRelationWrite,
  type CompanionshipRelationWriteWithDefaults,
  type CoupleCompanionshipWrite,
} from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { Couple } from '@/types/couple';

type SpousePair = Pick<Couple, 'member1_id' | 'member2_id'>;
type SharedCompanionshipFields = Pick<
  CoupleCompanionshipWrite,
  'status' | 'start_date' | 'end_date' | 'notes'
>;

export function refuseSamePersonCompanionship(
  write: Pick<CompanionshipRelationWrite, 'companion_id' | 'accompanied_id'>
): void {
  if (write.companion_id === write.accompanied_id) {
    throw new CompanionAndAccompaniedAreSamePerson();
  }
}

export async function refuseDifferentGenderCompanionship(
  write: Pick<CompanionshipRelationWrite, 'companion_id' | 'accompanied_id'>,
  members: ICommunityMemberRepository
): Promise<void> {
  const companion = await members.findCommunityMemberById(MemberId(write.companion_id));
  const accompanied = await members.findCommunityMemberById(MemberId(write.accompanied_id));
  if (companionshipParticipantsHaveDifferentGenders(companion, accompanied)) {
    throw new CompanionAndAccompaniedHaveDifferentGenders();
  }
}

export async function requireDistinctCompanionAndAccompaniedCouples(
  write: Pick<CoupleCompanionshipWrite, 'companion_couple_id' | 'accompanied_couple_id'>,
  couples: ICoupleRepository
): Promise<[Couple, Couple]> {
  if (write.companion_couple_id === write.accompanied_couple_id) {
    throw new CompanionAndAccompaniedAreSameCouple();
  }

  const companionCouple = await couples.findCoupleById(write.companion_couple_id);
  const accompaniedCouple = await couples.findCoupleById(write.accompanied_couple_id);
  if (!companionCouple || !accompaniedCouple) {
    throw new CoupleCompanionshipParticipantsAreNotEligible(
      'Both the companion couple and the accompanied couple must exist'
    );
  }

  return [companionCouple, accompaniedCouple];
}

export function expandCoupleIntoHusbandAndWifeWrites(
  companionCouple: SpousePair,
  accompaniedCouple: SpousePair,
  write: SharedCompanionshipFields
): [CompanionshipRelationWriteWithDefaults, CompanionshipRelationWriteWithDefaults] {
  const shared = companionshipRelationWriteWithDefaults({
    companion_id: companionCouple.member1_id,
    accompanied_id: accompaniedCouple.member1_id,
    status: write.status,
    start_date: write.start_date,
    end_date: write.end_date,
    notes: write.notes,
  });

  return assignHusbandAndWifeCompanionshipWrites(companionCouple, accompaniedCouple, shared);
}

export function expandProposedCoupleIntoHusbandAndWifeWrites(
  companionCouple: SpousePair,
  accompaniedCouple: SpousePair,
  notes: string | null | undefined
): [CompanionshipRelationWriteWithDefaults, CompanionshipRelationWriteWithDefaults] {
  return assignHusbandAndWifeCompanionshipWrites(companionCouple, accompaniedCouple, {
    status: 'proposed',
    start_date: null,
    end_date: null,
    notes: notes ?? null,
  });
}

function assignHusbandAndWifeCompanionshipWrites(
  companionCouple: SpousePair,
  accompaniedCouple: SpousePair,
  shared: Omit<CompanionshipRelationWriteWithDefaults, 'companion_id' | 'accompanied_id'>
): [CompanionshipRelationWriteWithDefaults, CompanionshipRelationWriteWithDefaults] {
  return [
    {
      ...shared,
      companion_id: companionCouple.member1_id,
      accompanied_id: accompaniedCouple.member1_id,
    },
    {
      ...shared,
      companion_id: companionCouple.member2_id,
      accompanied_id: accompaniedCouple.member2_id,
    },
  ];
}
