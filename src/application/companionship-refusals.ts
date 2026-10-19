export {
  CompanionAndAccompaniedHaveDifferentGenders,
  isCompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/companionship-participant-genders';

export class CompanionAndAccompaniedAreSamePerson extends Error {
  constructor() {
    super('The companion and the accompanied person cannot be the same');
    this.name = 'CompanionAndAccompaniedAreSamePerson';
  }
}

export function isCompanionAndAccompaniedAreSamePerson(
  error: unknown
): error is CompanionAndAccompaniedAreSamePerson {
  return error instanceof CompanionAndAccompaniedAreSamePerson;
}

export class CompanionAndAccompaniedAreSameCouple extends Error {
  constructor() {
    super('The companion couple and the accompanied couple cannot be the same');
    this.name = 'CompanionAndAccompaniedAreSameCouple';
  }
}

export function isCompanionAndAccompaniedAreSameCouple(
  error: unknown
): error is CompanionAndAccompaniedAreSameCouple {
  return error instanceof CompanionAndAccompaniedAreSameCouple;
}

export class CoupleCompanionshipParticipantsAreNotEligible extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoupleCompanionshipParticipantsAreNotEligible';
  }
}

export function isCoupleCompanionshipParticipantsAreNotEligible(
  error: unknown
): error is CoupleCompanionshipParticipantsAreNotEligible {
  return error instanceof CoupleCompanionshipParticipantsAreNotEligible;
}

export class CompanionshipRelationNotFound extends Error {
  constructor(id: string) {
    super(`Companionship relation with id ${id} not found`);
    this.name = 'CompanionshipRelationNotFound';
  }
}

export function isCompanionshipRelationNotFound(
  error: unknown
): error is CompanionshipRelationNotFound {
  return error instanceof CompanionshipRelationNotFound;
}

export class ProposedCompanionshipAlreadyExists extends Error {
  constructor() {
    super('A proposed companionship already exists for this companion and accompanied person');
    this.name = 'ProposedCompanionshipAlreadyExists';
  }
}

export function isProposedCompanionshipAlreadyExists(
  error: unknown
): error is ProposedCompanionshipAlreadyExists {
  return error instanceof ProposedCompanionshipAlreadyExists;
}

export class ProposedCompanionshipNotFound extends Error {
  constructor() {
    super('The proposed companionship was not found');
    this.name = 'ProposedCompanionshipNotFound';
  }
}

export function isProposedCompanionshipNotFound(
  error: unknown
): error is ProposedCompanionshipNotFound {
  return error instanceof ProposedCompanionshipNotFound;
}
