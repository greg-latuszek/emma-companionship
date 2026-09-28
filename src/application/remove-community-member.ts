import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import {
  CommunityMemberNotFound,
  isCommunityMemberNotFound,
} from '@/application/update-community-member';
import type { ICommunityMemberRepository } from '@/ports/repositories/ICommunityMemberRepository';
import type { MemberId } from '@/types/auth';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class CannotRemoveCommunityMemberWhoCanSignIn extends Error {
  constructor(readonly id: MemberId) {
    super(`The community member ${id} can sign in and must stay in the registry`);
    this.name = 'CannotRemoveCommunityMemberWhoCanSignIn';
  }
}

export function isCannotRemoveCommunityMemberWhoCanSignIn(
  error: unknown
): error is CannotRemoveCommunityMemberWhoCanSignIn {
  return error instanceof CannotRemoveCommunityMemberWhoCanSignIn;
}

export class CannotRemoveCommunityMemberLinkedToOtherData extends Error {
  constructor(readonly id: MemberId) {
    super(`The community member ${id} is linked to other data`);
    this.name = 'CannotRemoveCommunityMemberLinkedToOtherData';
  }
}

export function isCannotRemoveCommunityMemberLinkedToOtherData(
  error: unknown
): error is CannotRemoveCommunityMemberLinkedToOtherData {
  return error instanceof CannotRemoveCommunityMemberLinkedToOtherData;
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23503'
  );
}

function currentCommunityMemberRepository(): ICommunityMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getCommunityMemberRepository();
}

function reportFailedCommunityMemberRemoval(error: unknown): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] The registry cannot remove a community member. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error('[emma] The registry failed while removing a community member.', error);
}

export async function removeCommunityMember(
  id: MemberId,
  members: ICommunityMemberRepository = currentCommunityMemberRepository()
): Promise<void> {
  try {
    const existing = await members.findCommunityMemberById(id);
    if (!existing) {
      throw new CommunityMemberNotFound(id);
    }

    if (existing.hasLoginIdentity) {
      throw new CannotRemoveCommunityMemberWhoCanSignIn(id);
    }

    const removed = await members.removeCommunityMember(id);
    if (!removed) {
      throw new CommunityMemberNotFound(id);
    }
  } catch (error) {
    if (
      isCommunityMemberNotFound(error) ||
      isCannotRemoveCommunityMemberWhoCanSignIn(error)
    ) {
      throw error;
    }

    if (isForeignKeyViolation(error)) {
      throw new CannotRemoveCommunityMemberLinkedToOtherData(id);
    }

    reportFailedCommunityMemberRemoval(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
