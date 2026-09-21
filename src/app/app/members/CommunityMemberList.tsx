import type { JSX } from 'react';
import type { CommunityMember } from '@/types/community-member';

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
      <p className="text-gray-600 text-center">Nie ma jeszcze osób w rejestrze.</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 text-left">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
        >
          <span className="font-medium text-gray-900">{communityMemberName(member)}</span>
          {member.email ? (
            <span className="text-sm text-gray-500 break-all">{member.email}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
