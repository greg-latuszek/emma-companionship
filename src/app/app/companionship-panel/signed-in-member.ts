import type { Session } from 'next-auth';
import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import type { Member, MemberId, VisualStyle } from '@/types/auth';
import { visualStyleOrDefault } from '@/types/auth';

export type SignedInMember = {
  name: string;
  email: string;
  memberId?: MemberId;
  profilePicture: string | null;
  visualStyle: VisualStyle;
};

function currentMemberRepository(): IMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getMemberRepository();
}

async function storedLoginMember(
  memberId: MemberId | undefined,
  members: IMemberRepository
): Promise<Member | null> {
  if (!memberId) {
    return null;
  }

  try {
    return await members.findMemberById(memberId);
  } catch {
    return null;
  }
}

export async function signedInMemberFrom(
  session: Session,
  members: IMemberRepository = currentMemberRepository()
): Promise<SignedInMember> {
  const email = session.user.email ?? '';
  const stored = await storedLoginMember(session.user.memberId, members);

  return {
    name: session.user.name ?? email,
    email,
    memberId: session.user.memberId,
    profilePicture: session.user.image ?? stored?.profile_picture ?? null,
    visualStyle: visualStyleOrDefault(stored?.visual_style),
  };
}
