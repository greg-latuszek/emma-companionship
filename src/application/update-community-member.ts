import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import {
  DuplicateCommunityMemberEmail,
  isDuplicateCommunityMemberEmail,
} from '@/application/add-community-member';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import {
  communityMemberWriteWithDefaults,
  type CommunityMemberWrite,
} from '@/schemas/community-member';
import type { MemberId } from '@/types/auth';
import type { CommunityMember } from '@/types/community-member';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class CommunityMemberNotFound extends Error {
  constructor(readonly id: MemberId) {
    super(`The community member ${id} is not in the registry`);
    this.name = 'CommunityMemberNotFound';
  }
}

export function isCommunityMemberNotFound(
  error: unknown
): error is CommunityMemberNotFound {
  return error instanceof CommunityMemberNotFound;
}

function currentCommunityMemberRepository(): ICommunityMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getCommunityMemberRepository();
}

function reportFailedCommunityMemberUpdate(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot update a community member. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error('[emma] The registry failed while updating a community member.', error);
}

export async function updateCommunityMember(
  id: MemberId,
  write: CommunityMemberWrite,
  members: ICommunityMemberRepository = currentCommunityMemberRepository()
): Promise<CommunityMember> {
  const writeWithDefaults = communityMemberWriteWithDefaults(write);

  try {
    const existing = await members.findCommunityMemberById(id);
    if (!existing) {
      throw new CommunityMemberNotFound(id);
    }

    if (writeWithDefaults.email) {
      const owner = await members.findCommunityMemberByEmail(writeWithDefaults.email);
      if (owner && owner.id !== id) {
        throw new DuplicateCommunityMemberEmail(writeWithDefaults.email);
      }
    }

    const updated = await members.updateCommunityMember(id, writeWithDefaults);
    if (!updated) {
      throw new CommunityMemberNotFound(id);
    }

    return updated;
  } catch (error) {
    if (
      isCommunityMemberNotFound(error) ||
      isDuplicateCommunityMemberEmail(error)
    ) {
      throw error;
    }

    reportFailedCommunityMemberUpdate(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
