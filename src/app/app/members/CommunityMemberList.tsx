'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useTranslate } from '@/i18n/LocaleProvider';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { CommunityMember } from '@/types/community-member';
import { RemoveCommunityMemberButton } from './RemoveCommunityMemberButton';
import {
  communityMemberFieldText,
  communityMemberListExtraFields,
  communityMemberListFieldLabelKeys,
  communityMemberListSortFields,
  communityMemberName,
  communityMemberThumbnail,
  defaultCommunityMemberListExtraFields,
  nextCommunityMemberListSort,
  readStoredCommunityMemberListExtraFields,
  readStoredCommunityMemberListSort,
  sortCommunityMembers,
  storeCommunityMemberListExtraFields,
  storeCommunityMemberListSort,
  toggleCommunityMemberListExtraField,
  type CommunityMemberListExtraField,
  type CommunityMemberListSortDirection,
  type CommunityMemberListSortField,
} from './community-member-list-state';
import { MirroredHorizontalScroll } from './MirroredHorizontalScroll';

function CommunityMemberFace({
  member,
}: {
  member: CommunityMember;
}): JSX.Element {
  const [pictureFailed, setPictureFailed] = useState(false);
  const pictureUrl = communityMemberThumbnail(member);
  const showPicture = Boolean(pictureUrl) && !pictureFailed;
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <span className={surfaces.face}>
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
  const translate = useTranslate();
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <div className="flex shrink-0 items-center gap-4">
      <Link
        href={`/app/members/${member.id}/edit`}
        className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
      >
        {translate('common.edit')}
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
  isImportant,
}: {
  field: CommunityMemberListSortField;
  sortField: CommunityMemberListSortField;
  sortDirection: CommunityMemberListSortDirection;
  onSort: (field: CommunityMemberListSortField) => void;
  isImportant?: boolean;
}): JSX.Element {
  const translate = useTranslate();
  const active = sortField === field;
  const surfaces = visualSurfaces(useVisualStyle());
  const textClass = isImportant
    ? surfaces.importantText
    : `font-medium ${surfaces.strongText}`;

  return (
    <button
      type="button"
      onClick={() => {
        onSort(field);
      }}
      className={`inline-flex items-center gap-1 text-left ${textClass} underline-offset-4 hover:underline`}
    >
      {translate(communityMemberListFieldLabelKeys[field])}
      {active ? <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span> : null}
    </button>
  );
}

export function CommunityMemberList({
  members,
}: {
  members: CommunityMember[];
}): JSX.Element {
  const translate = useTranslate();
  const [sortField, setSortField] =
    useState<CommunityMemberListSortField>('last_name');
  const [sortDirection, setSortDirection] =
    useState<CommunityMemberListSortDirection>('asc');
  const [extraFields, setExtraFields] = useState<CommunityMemberListExtraField[]>(
    defaultCommunityMemberListExtraFields
  );
  const surfaces = visualSurfaces(useVisualStyle());

  useEffect(() => {
    const storedSort = readStoredCommunityMemberListSort(window.localStorage);
    setSortField(storedSort.sortField);
    setSortDirection(storedSort.sortDirection);
    setExtraFields(readStoredCommunityMemberListExtraFields(window.localStorage));
  }, []);

  if (members.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        {translate('members.list.empty')}
      </p>
    );
  }

  const sortedMembers = sortCommunityMembers(members, sortField, sortDirection);

  function rememberSort(
    field: CommunityMemberListSortField,
    direction: CommunityMemberListSortDirection
  ): void {
    setSortField(field);
    setSortDirection(direction);
    storeCommunityMemberListSort(
      { sortField: field, sortDirection: direction },
      window.localStorage
    );
  }

  function sortBy(field: CommunityMemberListSortField): void {
    const next = nextCommunityMemberListSort(sortField, sortDirection, field);
    rememberSort(next.sortField, next.sortDirection);
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 text-left">
        <label className="flex flex-col gap-1 text-sm lg:hidden">
          <span>{translate('common.sortBy')}</span>
          <select
            value={sortField}
            onChange={(event) => {
              rememberSort(
                event.target.value as CommunityMemberListSortField,
                'asc'
              );
            }}
            className={surfaces.field}
          >
            {communityMemberListSortFields.map((field) => (
              <option key={field} value={field} className="bg-white text-gray-900">
                {translate(communityMemberListFieldLabelKeys[field])}
              </option>
            ))}
          </select>
        </label>

        <details className="text-sm">
          <summary className={`cursor-pointer select-none ${surfaces.secondaryText}`}>
            {translate('common.visibleFields')}
          </summary>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 pl-1">
            {communityMemberListExtraFields.map((field) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={extraFields.includes(field)}
                  onChange={() => {
                    setExtraFields((current) => {
                      const extras = toggleCommunityMemberListExtraField(
                        current,
                        field
                      );
                      storeCommunityMemberListExtraFields(
                        extras,
                        window.localStorage
                      );
                      return extras;
                    });
                  }}
                />
                <span>{translate(communityMemberListFieldLabelKeys[field])}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      <ul className={`divide-y ${surfaces.rowDivider} text-left lg:hidden`}>
        {sortedMembers.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <CommunityMemberFace member={member} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className={`font-medium ${surfaces.strongText}`}>
                  {communityMemberName(member)}
                </span>
                {communityMemberListExtraFields.filter((f) => extraFields.includes(f)).map((field) => {
                  const text = communityMemberFieldText(member, field, translate);
                  if (!text) {
                    return null;
                  }
                  return (
                    <span key={field} className={`text-sm ${surfaces.secondaryText} break-all`}>
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

      <div className="hidden min-w-0 max-w-full lg:block">
        <MirroredHorizontalScroll>
        <table className="w-max min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className={`border-b ${surfaces.hairline}`}>
              <th className={`${surfaces.importantArea} sticky left-0 z-10 w-12 px-2 py-3`}>
                <span className="sr-only">{translate('members.list.photo')}</span>
              </th>
              <th
                aria-sort={sortAria('first_name', sortField, sortDirection)}
                className={`${surfaces.importantArea} sticky left-12 z-10 min-w-[7rem] px-3 py-3`}
              >
                <SortHeader
                  field="first_name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={sortBy}
                  isImportant
                />
              </th>
              <th
                aria-sort={sortAria('last_name', sortField, sortDirection)}
                className={`${surfaces.importantArea} sticky left-40 z-10 min-w-[7rem] px-3 py-3`}
              >
                <SortHeader
                  field="last_name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={sortBy}
                  isImportant
                />
              </th>
              {communityMemberListExtraFields.filter((f) => extraFields.includes(f)).map((field) => (
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
              <th className="px-3 py-3 whitespace-nowrap">
                <span className="sr-only">{translate('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${surfaces.rowDivider}`}>
            {sortedMembers.map((member) => (
              <tr key={member.id}>
                <td className={`${surfaces.importantArea} sticky left-0 z-10 px-2 py-3`}>
                  <CommunityMemberFace member={member} />
                </td>
                <td className={`${surfaces.importantArea} sticky left-12 z-10 whitespace-nowrap px-3 py-3 ${surfaces.importantText}`}>
                  {member.first_name}
                </td>
                <td className={`${surfaces.importantArea} sticky left-40 z-10 whitespace-nowrap px-3 py-3 ${surfaces.importantText}`}>
                  {member.last_name}
                </td>
                {communityMemberListExtraFields.filter((f) => extraFields.includes(f)).map((field) => (
                  <td key={field} className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}>
                    {communityMemberFieldText(member, field, translate)}
                  </td>
                ))}
                <td className="px-3 py-3 whitespace-nowrap">
                  <CommunityMemberRowActions member={member} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </MirroredHorizontalScroll>
      </div>
    </div>
  );
}
