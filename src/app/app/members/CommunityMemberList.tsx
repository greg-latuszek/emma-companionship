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
  nextCommunityMemberListSort,
  sortCommunityMembers,
  toggleCommunityMemberListExtraField,
  type CommunityMemberListExtraField,
  type CommunityMemberListSortDirection,
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

function CommunityMemberRowActions({
  member,
}: {
  member: CommunityMember;
}): JSX.Element {
  return (
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
  );
}

const fieldControlClassName =
  'rounded border border-white/35 bg-white/15 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/40';

const stickyCellClassName = 'bg-black/35 backdrop-blur-sm';

function sortAria(field: CommunityMemberListSortField, sortField: CommunityMemberListSortField, sortDirection: CommunityMemberListSortDirection) {
  if (sortField !== field) {
    return 'none' as const;
  }
  return sortDirection === 'asc' ? ('ascending' as const) : ('descending' as const);
}

function SortHeader({
  field,
  sortField,
  sortDirection,
  onSort,
}: {
  field: CommunityMemberListSortField;
  sortField: CommunityMemberListSortField;
  sortDirection: CommunityMemberListSortDirection;
  onSort: (field: CommunityMemberListSortField) => void;
}): JSX.Element {
  const active = sortField === field;

  return (
    <button
      type="button"
      onClick={() => {
        onSort(field);
      }}
      className="inline-flex items-center gap-1 text-left font-medium text-white underline-offset-4 hover:underline"
    >
      {communityMemberListFieldLabels[field]}
      {active ? <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span> : null}
    </button>
  );
}

export function CommunityMemberList({
  members,
}: {
  members: CommunityMember[];
}): JSX.Element {
  const [sortField, setSortField] =
    useState<CommunityMemberListSortField>('last_name');
  const [sortDirection, setSortDirection] =
    useState<CommunityMemberListSortDirection>('asc');
  const [extraFields, setExtraFields] = useState<CommunityMemberListExtraField[]>(
    defaultCommunityMemberListExtraFields
  );

  if (members.length === 0) {
    return (
      <p className="text-center text-white/80">Nie ma jeszcze osób w rejestrze.</p>
    );
  }

  const sortedMembers = sortCommunityMembers(members, sortField, sortDirection);

  function sortBy(field: CommunityMemberListSortField): void {
    const next = nextCommunityMemberListSort(sortField, sortDirection, field);
    setSortField(next.sortField);
    setSortDirection(next.sortDirection);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 text-left">
        <label className="flex flex-col gap-1 text-sm lg:hidden">
          <span>Sortuj według</span>
          <select
            value={sortField}
            onChange={(event) => {
              setSortField(event.target.value as CommunityMemberListSortField);
              setSortDirection('asc');
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

      <ul className="divide-y divide-white/20 text-left lg:hidden">
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
            <div className="pl-12 sm:pl-0">
              <CommunityMemberRowActions member={member} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/20">
              <th className={`${stickyCellClassName} sticky left-0 z-10 w-12 px-2 py-3`}>
                <span className="sr-only">Zdjęcie</span>
              </th>
              <th
                aria-sort={sortAria('first_name', sortField, sortDirection)}
                className={`${stickyCellClassName} sticky left-12 z-10 min-w-[7rem] px-3 py-3`}
              >
                <SortHeader
                  field="first_name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={sortBy}
                />
              </th>
              <th
                aria-sort={sortAria('last_name', sortField, sortDirection)}
                className={`${stickyCellClassName} sticky left-40 z-10 min-w-[7rem] px-3 py-3`}
              >
                <SortHeader
                  field="last_name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={sortBy}
                />
              </th>
              {extraFields.map((field) => (
                <th
                  key={field}
                  aria-sort={sortAria(field, sortField, sortDirection)}
                  className="px-3 py-3 whitespace-nowrap"
                >
                  <SortHeader
                    field={field}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={sortBy}
                  />
                </th>
              ))}
              <th className="px-3 py-3">
                <span className="sr-only">Działania</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {sortedMembers.map((member) => (
              <tr key={member.id}>
                <td className={`${stickyCellClassName} sticky left-0 z-10 px-2 py-3`}>
                  <CommunityMemberFace member={member} />
                </td>
                <td className={`${stickyCellClassName} sticky left-12 z-10 whitespace-nowrap px-3 py-3 font-medium text-white`}>
                  {member.first_name}
                </td>
                <td className={`${stickyCellClassName} sticky left-40 z-10 whitespace-nowrap px-3 py-3 font-medium text-white`}>
                  {member.last_name}
                </td>
                {extraFields.map((field) => (
                  <td key={field} className="whitespace-nowrap px-3 py-3 text-white/80">
                    {communityMemberFieldText(member, field)}
                  </td>
                ))}
                <td className="px-3 py-3">
                  <CommunityMemberRowActions member={member} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
