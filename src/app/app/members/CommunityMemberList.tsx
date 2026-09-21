'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { JSX } from 'react';
import type { CommunityMember } from '@/types/community-member';
import { RemoveCommunityMemberButton } from './RemoveCommunityMemberButton';
import {
  communityMemberFieldText,
  communityMemberListExtraFields,
  communityMemberListFieldLabels,
  communityMemberListSortFields,
  communityMemberName,
  communityMemberThumbnail,
  defaultCommunityMemberListExtraFields,
  sortCommunityMembers,
  toggleCommunityMemberListExtraField,
  type CommunityMemberListExtraField,
  type CommunityMemberListSortField,
} from './community-member-list-state';

function CommunityMemberFace({
  member,
}: {
  member: CommunityMember;
}): JSX.Element {
  const [pictureFailed, setPictureFailed] = useState(false);
  const pictureUrl = communityMemberThumbnail(member);
  const showPicture = Boolean(pictureUrl) && !pictureFailed;

  return (
    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/20 ring-1 ring-white/40">
      {showPicture ? (
        <img
          src={pictureUrl ?? undefined}
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => {
            setPictureFailed(true);
          }}
        />
      ) : null}
    </span>
  );
}

const fieldControlClassName =
  'rounded border border-white/35 bg-white/15 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/40';

export function CommunityMemberList({
  members,
}: {
  members: CommunityMember[];
}): JSX.Element {
  const [sortField, setSortField] =
    useState<CommunityMemberListSortField>('last_name');
  const [extraFields, setExtraFields] = useState<CommunityMemberListExtraField[]>(
    defaultCommunityMemberListExtraFields
  );

  if (members.length === 0) {
    return (
      <p className="text-center text-white/80">Nie ma jeszcze osób w rejestrze.</p>
    );
  }

  const sortedMembers = sortCommunityMembers(members, sortField);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 text-left">
        <label className="flex flex-col gap-1 text-sm">
          <span>Sortuj według</span>
          <select
            value={sortField}
            onChange={(event) => {
              setSortField(event.target.value as CommunityMemberListSortField);
            }}
            className={fieldControlClassName}
          >
            {communityMemberListSortFields.map((field) => (
              <option key={field} value={field} className="bg-white text-gray-900">
                {communityMemberListFieldLabels[field]}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Pokaż pola</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {communityMemberListExtraFields.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={extraFields.includes(field)}
                  onChange={() => {
                    setExtraFields((current) =>
                      toggleCommunityMemberListExtraField(current, field)
                    );
                  }}
                />
                <span>{communityMemberListFieldLabels[field]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <ul className="divide-y divide-white/20 text-left">
        {sortedMembers.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <CommunityMemberFace member={member} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium text-white">
                  {communityMemberName(member)}
                </span>
                {extraFields.map((field) => {
                  const text = communityMemberFieldText(member, field);
                  if (!text) {
                    return null;
                  }
                  return (
                    <span key={field} className="text-sm text-white/70 break-all">
                      {text}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 pl-12 sm:pl-0">
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
    </div>
  );
}
