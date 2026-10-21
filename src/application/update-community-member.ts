import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
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

export async function updateCommunityMember(
  id: MemberId,
  write: CommunityMemberWrite,
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
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

    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'update a community member',
      failedWhile: 'updating a community member',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
