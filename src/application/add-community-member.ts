import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import {
  communityMemberWriteWithDefaults,
  type CommunityMemberWrite,
} from '@/schemas/community-member';
import type { CommunityMember } from '@/types/community-member';
import {
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

export async function addCommunityMember(
  write: CommunityMemberWrite,
  members: ICommunityMemberRepository = openRegistry().getCommunityMemberRepository()
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

    reportFailedRegistryOperation(error, {
      actor: 'The registry',
      cannot: 'add a community member',
      failedWhile: 'adding a community member',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
