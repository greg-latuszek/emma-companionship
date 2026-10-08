import type { CommunityMember } from '@/types/community-member';

export class CompanionAndAccompaniedHaveDifferentGenders extends Error {
  constructor() {
    super('The companion and the accompanied person must share the same gender');
    this.name = 'CompanionAndAccompaniedHaveDifferentGenders';
  }
}

export function isCompanionAndAccompaniedHaveDifferentGenders(
  error: unknown
): error is CompanionAndAccompaniedHaveDifferentGenders {
  return error instanceof CompanionAndAccompaniedHaveDifferentGenders;
}

type ParticipantGender = Pick<CommunityMember, 'gender'> | null;

export function companionshipParticipantsHaveDifferentGenders(
  companion: ParticipantGender,
  accompanied: ParticipantGender
): boolean {
  if (companion === null || accompanied === null) {
    return false;
  }
  if (companion.gender === null || accompanied.gender === null) {
    return false;
  }
  return companion.gender !== accompanied.gender;
}
