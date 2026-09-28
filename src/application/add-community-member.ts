import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import {
  communityMemberWriteWithDefaults,
  type CommunityMemberWrite,
} from '@/schemas/community-member';
import type { CommunityMember } from '@/types/community-member';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class DuplicateCommunityMemberEmail extends Error {
  constructor(readonly email: string) {
    super(`A community member already has the email ${email}`);
    this.name = 'DuplicateCommunityMemberEmail';
  }
}

export function isDuplicateCommunityMemberEmail(
  error: unknown
): error is DuplicateCommunityMemberEmail {
  return error instanceof DuplicateCommunityMemberEmail;
}

function currentCommunityMemberRepository(): ICommunityMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getCommunityMemberRepository();
}

function reportFailedCommunityMemberAdd(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot add a community member. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error('[emma] The registry failed while adding a community member.', error);
}

export async function addCommunityMember(
  write: CommunityMemberWrite,
  members: ICommunityMemberRepository = currentCommunityMemberRepository()
): Promise<CommunityMember> {
  const writeWithDefaults = communityMemberWriteWithDefaults(write);

  try {
    if (writeWithDefaults.email) {
      const existing = await members.findCommunityMemberByEmail(writeWithDefaults.email);
      if (existing) {
        throw new DuplicateCommunityMemberEmail(writeWithDefaults.email);
      }
    }

    return await members.addCommunityMember(writeWithDefaults);
  } catch (error) {
    if (isDuplicateCommunityMemberEmail(error)) {
      throw error;
    }

    reportFailedCommunityMemberAdd(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
