import Link from 'next/link';
import type { JSX } from 'react';
import type { CommunityMember } from '@/types/community-member';
import { RemoveCommunityMemberButton } from './RemoveCommunityMemberButton';

function communityMemberName(member: CommunityMember): string {
  return `${member.first_name} ${member.last_name}`;
}

export function CommunityMemberList({
  members,
}: {
  members: CommunityMember[];
}): JSX.Element {
  if (members.length === 0) {
    return (
      <p className="text-center text-white/80">Nie ma jeszcze osób w rejestrze.</p>
    );
  }

  return (
    <ul className="divide-y divide-white/20 text-left">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="font-medium text-white">{communityMemberName(member)}</span>
            {member.email ? (
              <span className="text-sm text-white/70 break-all">{member.email}</span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link
              href={`/app/members/${member.id}/edit`}
              className="text-sm font-medium text-white underline-offset-4 hover:underline"
            >
              Edytuj
            </Link>
            {!member.hasLoginIdentity ? (
              <RemoveCommunityMemberButton
                memberId={member.id}
                memberName={communityMemberName(member)}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
