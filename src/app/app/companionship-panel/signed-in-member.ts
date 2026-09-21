import type { Session } from 'next-auth';
import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import type { MemberId } from '@/types/auth';

export type SignedInMember = {
  name: string;
  email: string;
  memberId?: MemberId;
  profilePicture: string | null;
};

function currentMemberRepository(): IMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getMemberRepository();
}

async function profilePictureFromStoredMember(
  memberId: MemberId | undefined,
  members: IMemberRepository
): Promise<string | null> {
  if (!memberId) {
    return null;
  }

  try {
    const member = await members.findMemberById(memberId);
    return member?.profile_picture ?? null;
  } catch {
    return null;
  }
}

export async function signedInMemberFrom(
  session: Session,
  members: IMemberRepository = currentMemberRepository()
): Promise<SignedInMember> {
  const email = session.user.email ?? '';

  return {
    name: session.user.name ?? email,
    email,
    memberId: session.user.memberId,
    profilePicture:
      session.user.image ??
      (await profilePictureFromStoredMember(session.user.memberId, members)),
  };
}
