'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import { MirroredHorizontalScroll } from '../members/MirroredHorizontalScroll';
import { DeleteCompanionshipRelationButton } from './DeleteCompanionshipRelationButton';
import {
  accompaniedFullName,
  companionFullName,
  companionshipRelationListFieldLabels,
  companionshipRelationListSortFields,
  nextCompanionshipRelationListSort,
  readStoredCompanionshipRelationListSort,
  sortCompanionshipRelations,
  storeCompanionshipRelationListSort,
  type CompanionshipRelationListSortDirection,
  type CompanionshipRelationListSortField,
} from './companionship-relation-list-state';

function sortAria(
  field: CompanionshipRelationListSortField,
  sortField: CompanionshipRelationListSortField,
  sortDirection: CompanionshipRelationListSortDirection
) {
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
  textClassName,
}: {
  field: CompanionshipRelationListSortField;
  sortField: CompanionshipRelationListSortField;
  sortDirection: CompanionshipRelationListSortDirection;
  onSort: (field: CompanionshipRelationListSortField) => void;
  textClassName?: string;
}): JSX.Element {
  const active = sortField === field;
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <button
      type="button"
      onClick={() => {
        onSort(field);
      }}
      className={`inline-flex items-center gap-1 text-left font-medium ${textClassName ?? surfaces.strongText} underline-offset-4 hover:underline`}
    >
      {companionshipRelationListFieldLabels[field]}
      {active ? (
        <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      ) : null}
    </button>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return '—';
  }
  return dateString;
}

function statusLabel(status: string): string {
  return status === 'active' ? 'Aktywny' : 'Zarchiwizowany';
}

export function CompanionshipRelationList({
  relations,
}: {
  relations: CompanionshipRelationListItem[];
}): JSX.Element {
  const [sortField, setSortField] =
    useState<CompanionshipRelationListSortField>('accompanied');
  const [sortDirection, setSortDirection] =
    useState<CompanionshipRelationListSortDirection>('asc');
  const surfaces = visualSurfaces(useVisualStyle());

  useEffect(() => {
    const storedSort = readStoredCompanionshipRelationListSort(
      window.localStorage
    );
    setSortField(storedSort.sortField);
    setSortDirection(storedSort.sortDirection);
  }, []);

  if (relations.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        Nie ma jeszcze żadnych zapisanych akompaniamentów.
      </p>
    );
  }

  const sortedRelations = sortCompanionshipRelations(
    relations,
    sortField,
    sortDirection
  );

  function rememberSort(
    field: CompanionshipRelationListSortField,
    direction: CompanionshipRelationListSortDirection
  ): void {
    setSortField(field);
    setSortDirection(direction);
    storeCompanionshipRelationListSort(
      { sortField: field, sortDirection: direction },
      window.localStorage
    );
  }

  function sortBy(field: CompanionshipRelationListSortField): void {
    const next = nextCompanionshipRelationListSort(
      sortField,
      sortDirection,
      field
    );
    rememberSort(next.sortField, next.sortDirection);
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Mobile sort control */}
      <div className="flex flex-col gap-4 text-left lg:hidden">
        <label className="flex flex-col gap-1 text-sm">
          <span>Sortuj według</span>
          <select
            value={sortField}
            onChange={(event) => {
              rememberSort(
                event.target.value as CompanionshipRelationListSortField,
                'asc'
              );
            }}
            className={surfaces.field}
          >
            {companionshipRelationListSortFields.map((field) => (
              <option
                key={field}
                value={field}
                className="bg-white text-gray-900"
              >
                {companionshipRelationListFieldLabels[field]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Mobile card view */}
      <ul className={`divide-y ${surfaces.rowDivider} text-left lg:hidden`}>
        {sortedRelations.map((relation) => (
          <li key={relation.id} className="flex flex-col gap-3 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-white/60">
                  Akompaniowany
                </span>
                <span className={`font-medium ${surfaces.strongText}`}>
                  {accompaniedFullName(relation)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-white/60">
                  Akompaniator
                </span>
                <span className={`font-medium ${surfaces.strongText}`}>
                  {companionFullName(relation)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
              {relation.start_date ? (
                <span>Od {formatDate(relation.start_date)}</span>
              ) : null}
              <span>{statusLabel(relation.status)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <Link
                href={`/app/companionships/${relation.id}/edit`}
                className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
              >
                Edytuj
              </Link>
              <DeleteCompanionshipRelationButton
                relationId={relation.id}
                accompaniedName={accompaniedFullName(relation)}
                companionName={companionFullName(relation)}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table view */}
      <div className="hidden min-w-0 max-w-full lg:block">
        <MirroredHorizontalScroll>
          <table className="w-max min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className={`border-b ${surfaces.hairline}`}>
                <th
                  aria-sort={sortAria('accompanied', sortField, sortDirection)}
                  className={`${surfaces.stickyCell} sticky left-0 z-10 min-w-[14rem] px-3 py-3`}
                >
                  <SortHeader
                    field="accompanied"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={sortBy}
                    textClassName="font-bold text-yellow-300"
                  />
                </th>
                <th
                  aria-sort={sortAria('companion', sortField, sortDirection)}
                  className="min-w-[14rem] whitespace-nowrap px-3 py-3"
                >
                  <SortHeader
                    field="companion"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={sortBy}
                  />
                </th>
                <th
                  aria-sort={sortAria('start_date', sortField, sortDirection)}
                  className="whitespace-nowrap px-3 py-3"
                >
                  <SortHeader
                    field="start_date"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={sortBy}
                  />
                </th>
                <th
                  aria-sort={sortAria('status', sortField, sortDirection)}
                  className="whitespace-nowrap px-3 py-3"
                >
                  <SortHeader
                    field="status"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={sortBy}
                  />
                </th>
                <th className="px-3 py-3 whitespace-nowrap">
                  <span className="sr-only">Działania</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${surfaces.rowDivider}`}>
              {sortedRelations.map((relation) => (
                <tr key={relation.id}>
                  <td
                    className={`${surfaces.stickyCell} sticky left-0 z-10 whitespace-nowrap px-3 py-3 font-bold text-yellow-300`}
                  >
                    {accompaniedFullName(relation)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                  >
                    {companionFullName(relation)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                  >
                    {formatDate(relation.start_date)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                  >
                    {statusLabel(relation.status)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex gap-4">
                      <Link
                        href={`/app/companionships/${relation.id}/edit`}
                        className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
                      >
                        Edytuj
                      </Link>
                      <DeleteCompanionshipRelationButton
                        relationId={relation.id}
                        accompaniedName={accompaniedFullName(relation)}
                        companionName={companionFullName(relation)}
                      />
                    </div>
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
