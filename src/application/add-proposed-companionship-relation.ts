/**
 * Persists a Find Companion person proposal (status = proposed).
 */

import { openRegistry } from '@/application/open-registry';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import {
  companionshipParticipantsHaveDifferentGenders,
  CompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/companionship-participant-genders';
import { CompanionAndAccompaniedAreSamePerson } from '@/application/add-companionship-relation';
import type { CompanionshipRelationWrite } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelation } from '@/types/companionship-relation';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export {
  CompanionAndAccompaniedAreSamePerson,
  isCompanionAndAccompaniedAreSamePerson,
} from '@/application/add-companionship-relation';

export {
  CompanionAndAccompaniedHaveDifferentGenders,
  isCompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/companionship-participant-genders';

export class ProposedCompanionshipAlreadyExists extends Error {
  constructor() {
    super(
      'A proposed companionship already exists for this companion and accompanied person'
    );
    this.name = 'ProposedCompanionshipAlreadyExists';
  }
}

export function isProposedCompanionshipAlreadyExists(
  error: unknown
): error is ProposedCompanionshipAlreadyExists {
  return error instanceof ProposedCompanionshipAlreadyExists;
}

function reportFailedProposedCompanionshipAdd(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot add a proposed companionship. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(
    '[emma] The registry failed while adding a proposed companionship.',
    error
  );
}

export async function addProposedCompanionshipRelation(
  write: CompanionshipRelationWrite,
  relations: ICompanionshipRelationRepository = openRegistry().getCompanionshipRelationRepository(),
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
): Promise<CompanionshipRelation> {
  if (write.companion_id === write.accompanied_id) {
    throw new CompanionAndAccompaniedAreSamePerson();
  }

  const companion = await members.findCommunityMemberById(
    MemberId(write.companion_id)
  );
  const accompanied = await members.findCommunityMemberById(
    MemberId(write.accompanied_id)
  );
  if (companionshipParticipantsHaveDifferentGenders(companion, accompanied)) {
    throw new CompanionAndAccompaniedHaveDifferentGenders();
  }

  const existingProposals =
    await relations.listProposedCompanionshipRelationsForAccompanied([
      write.accompanied_id,
    ]);
  if (
    existingProposals.some(
      (proposal) => proposal.companion.id === write.companion_id
    )
  ) {
    throw new ProposedCompanionshipAlreadyExists();
  }

  try {
    return await relations.addCompanionshipRelation({
      companion_id: write.companion_id,
      accompanied_id: write.accompanied_id,
      status: 'proposed',
      start_date: null,
      end_date: null,
      notes: write.notes ?? null,
    });
  } catch (error) {
    reportFailedProposedCompanionshipAdd(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
