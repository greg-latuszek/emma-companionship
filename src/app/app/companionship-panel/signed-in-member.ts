import type { Session } from 'next-auth';
import type { MemberId } from '@/types/auth';

export type SignedInMember = {
  name: string;
  email: string;
  memberId?: MemberId;
  profilePicture: string | null;
};

export function signedInMemberFrom(session: Session): SignedInMember {
  const email = session.user.email ?? '';

  return {
    name: session.user.name ?? email,
    email,
    memberId: session.user.memberId,
    profilePicture: session.user.image ?? null,
  };
}
