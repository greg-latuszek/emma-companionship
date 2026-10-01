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
  nextCompanionshipRelationListSort,
  personFieldText,
  readStoredCompanionshipRelationListAccompaniedExtras,
  readStoredCompanionshipRelationListAkompaniamentExtras,
  readStoredCompanionshipRelationListCompanionExtras,
  readStoredCompanionshipRelationListSort,
  sortCompanionshipRelations,
  storeCompanionshipRelationListAccompaniedExtras,
  storeCompanionshipRelationListAkompaniamentExtras,
  storeCompanionshipRelationListCompanionExtras,
  storeCompanionshipRelationListSort,
  toggleCompanionshipRelationListAkompaniamentExtraField,
  toggleCompanionshipRelationListPersonExtraField,
  type CompanionshipRelationListAkompaniamentExtraField,
  type CompanionshipRelationListPersonExtraField,
  type CompanionshipRelationListSortDirection,
  type CompanionshipRelationListSortField,
  companionshipRelationListAkompaniamentExtraFields,
  companionshipRelationListPersonExtraFields,
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
  
  const [akompaniamentExtras, setAkompaniamentExtras] = useState<
    CompanionshipRelationListAkompaniamentExtraField[]
  >([]);
  const [accompaniedExtras, setAccompaniedExtras] = useState<
    CompanionshipRelationListPersonExtraField[]
  >([]);
  const [companionExtras, setCompanionExtras] = useState<
    CompanionshipRelationListPersonExtraField[]
  >([]);
  
  const surfaces = visualSurfaces(useVisualStyle());

  useEffect(() => {
    const storedSort = readStoredCompanionshipRelationListSort(
      window.localStorage
    );
    setSortField(storedSort.sortField);
    setSortDirection(storedSort.sortDirection);
    
    setAkompaniamentExtras(
      readStoredCompanionshipRelationListAkompaniamentExtras(window.localStorage)
    );
    setAccompaniedExtras(
      readStoredCompanionshipRelationListAccompaniedExtras(window.localStorage)
    );
    setCompanionExtras(
      readStoredCompanionshipRelationListCompanionExtras(window.localStorage)
    );
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

  const showAccompaniedGroup = accompaniedExtras.length > 0;
  const showCompanionGroup = companionExtras.length > 0;

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
            <option value="accompanied">{companionshipRelationListFieldLabels['accompanied']}</option>
            <option value="companion">{companionshipRelationListFieldLabels['companion']}</option>
            <option value="start_date">{companionshipRelationListFieldLabels['start_date']}</option>
            <option value="status">{companionshipRelationListFieldLabels['status']}</option>
          </select>
        </label>
        
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Pokaż pola - Akompaniament</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {companionshipRelationListAkompaniamentExtraFields.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={akompaniamentExtras.includes(field)}
                  onChange={() => {
                    setAkompaniamentExtras((current) => {
                      const extras = toggleCompanionshipRelationListAkompaniamentExtraField(
                        current,
                        field
                      );
                      storeCompanionshipRelationListAkompaniamentExtras(
                        extras,
                        window.localStorage
                      );
                      return extras;
                    });
                  }}
                />
                <span>{companionshipRelationListFieldLabels[field]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Pokaż pola - Akompaniowany</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {companionshipRelationListPersonExtraFields.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accompaniedExtras.includes(field)}
                  onChange={() => {
                    setAccompaniedExtras((current) => {
                      const extras = toggleCompanionshipRelationListPersonExtraField(
                        current,
                        field
                      );
                      storeCompanionshipRelationListAccompaniedExtras(
                        extras,
                        window.localStorage
                      );
                      return extras;
                    });
                  }}
                />
                <span>{companionshipRelationListFieldLabels[field]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Pokaż pola - Akompaniator</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {companionshipRelationListPersonExtraFields.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={companionExtras.includes(field)}
                  onChange={() => {
                    setCompanionExtras((current) => {
                      const extras = toggleCompanionshipRelationListPersonExtraField(
                        current,
                        field
                      );
                      storeCompanionshipRelationListCompanionExtras(
                        extras,
                        window.localStorage
                      );
                      return extras;
                    });
                  }}
                />
                <span>{companionshipRelationListFieldLabels[field]}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
                {companionshipRelationListPersonExtraFields.filter((f) => accompaniedExtras.includes(f)).map((field) => {
                  const text = personFieldText(relation.accompanied, field);
                  if (!text) return null;
                  return (
                    <span key={field} className={`text-sm ${surfaces.secondaryText}`}>
                      {text}
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-white/60">
                  Akompaniator
                </span>
                <span className={`font-medium ${surfaces.strongText}`}>
                  {companionFullName(relation)}
                </span>
                {companionshipRelationListPersonExtraFields.filter((f) => companionExtras.includes(f)).map((field) => {
                  const text = personFieldText(relation.companion, field);
                  if (!text) return null;
                  return (
                    <span key={field} className={`text-sm ${surfaces.secondaryText}`}>
                      {text}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
              {akompaniamentExtras.includes('start_date') && relation.start_date ? (
                <span>Od {formatDate(relation.start_date)}</span>
              ) : null}
              {akompaniamentExtras.includes('status') ? (
                <span>{statusLabel(relation.status)}</span>
              ) : null}
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
        <div className="flex flex-col gap-4 text-left">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm">Pokaż pola</legend>
            
            <div className="flex flex-col gap-2">
              <div className="font-medium text-sm">Akompaniament</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pl-4">
                {companionshipRelationListAkompaniamentExtraFields.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={akompaniamentExtras.includes(field)}
                      onChange={() => {
                        setAkompaniamentExtras((current) => {
                          const extras = toggleCompanionshipRelationListAkompaniamentExtraField(
                            current,
                            field
                          );
                          storeCompanionshipRelationListAkompaniamentExtras(
                            extras,
                            window.localStorage
                          );
                          return extras;
                        });
                      }}
                    />
                    <span>{companionshipRelationListFieldLabels[field]}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="font-medium text-sm">Akompaniowany</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pl-4">
                {companionshipRelationListPersonExtraFields.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={accompaniedExtras.includes(field)}
                      onChange={() => {
                        setAccompaniedExtras((current) => {
                          const extras = toggleCompanionshipRelationListPersonExtraField(
                            current,
                            field
                          );
                          storeCompanionshipRelationListAccompaniedExtras(
                            extras,
                            window.localStorage
                          );
                          return extras;
                        });
                      }}
                    />
                    <span>{companionshipRelationListFieldLabels[field]}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="font-medium text-sm">Akompaniator</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pl-4">
                {companionshipRelationListPersonExtraFields.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={companionExtras.includes(field)}
                      onChange={() => {
                        setCompanionExtras((current) => {
                          const extras = toggleCompanionshipRelationListPersonExtraField(
                            current,
                            field
                          );
                          storeCompanionshipRelationListCompanionExtras(
                            extras,
                            window.localStorage
                          );
                          return extras;
                        });
                      }}
                    />
                    <span>{companionshipRelationListFieldLabels[field]}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        </div>
        
        <MirroredHorizontalScroll>
          <table className="w-max min-w-full border-collapse text-left text-sm mt-4">
            <thead>
              {/* Top tier header - Grouping */}
              <tr className={`border-b ${surfaces.hairline}`}>
                <th
                  colSpan={2 + akompaniamentExtras.length}
                  className={`${surfaces.stickyCell} sticky left-0 z-20 px-3 py-2 font-bold text-center`}
                >
                  Akompaniament
                </th>
                {showAccompaniedGroup ? (
                  <th
                    colSpan={accompaniedExtras.length}
                    className="px-3 py-2 font-bold text-center border-l border-white/20"
                  >
                    Akompaniowany
                  </th>
                ) : null}
                {showCompanionGroup ? (
                  <th
                    colSpan={companionExtras.length}
                    className="px-3 py-2 font-bold text-center border-l border-white/20"
                  >
                    Akompaniator
                  </th>
                ) : null}
                <th className="px-3 py-2">
                  <span className="sr-only">Działania</span>
                </th>
              </tr>
              
              {/* Bottom tier header - Individual columns */}
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
                  className={`${surfaces.stickyCell} sticky left-[14rem] z-10 min-w-[14rem] whitespace-nowrap px-3 py-3`}
                >
                  <SortHeader
                    field="companion"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={sortBy}
                    textClassName="font-bold text-yellow-300"
                  />
                </th>
                {akompaniamentExtras.includes('start_date') ? (
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
                ) : null}
                {akompaniamentExtras.includes('status') ? (
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
                ) : null}
                {companionshipRelationListPersonExtraFields.filter((f) => accompaniedExtras.includes(f)).map((field) => (
                  <th
                    key={field}
                    aria-sort={sortAria(`accompanied_${field}` as CompanionshipRelationListSortField, sortField, sortDirection)}
                    className="px-3 py-3 whitespace-nowrap"
                  >
                    <SortHeader
                      field={`accompanied_${field}` as CompanionshipRelationListSortField}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={sortBy}
                    />
                  </th>
                ))}
                {companionshipRelationListPersonExtraFields.filter((f) => companionExtras.includes(f)).map((field) => (
                  <th
                    key={field}
                    aria-sort={sortAria(`companion_${field}` as CompanionshipRelationListSortField, sortField, sortDirection)}
                    className="px-3 py-3 whitespace-nowrap"
                  >
                    <SortHeader
                      field={`companion_${field}` as CompanionshipRelationListSortField}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={sortBy}
                    />
                  </th>
                ))}
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
                    className={`${surfaces.stickyCell} sticky left-[14rem] z-10 whitespace-nowrap px-3 py-3 font-bold text-yellow-300`}
                  >
                    {companionFullName(relation)}
                  </td>
                  {akompaniamentExtras.includes('start_date') ? (
                    <td
                      className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                    >
                      {formatDate(relation.start_date)}
                    </td>
                  ) : null}
                  {akompaniamentExtras.includes('status') ? (
                    <td
                      className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                    >
                      {statusLabel(relation.status)}
                    </td>
                  ) : null}
                  {companionshipRelationListPersonExtraFields.filter((f) => accompaniedExtras.includes(f)).map((field) => (
                    <td
                      key={field}
                      className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                    >
                      {personFieldText(relation.accompanied, field)}
                    </td>
                  ))}
                  {companionshipRelationListPersonExtraFields.filter((f) => companionExtras.includes(f)).map((field) => (
                    <td
                      key={field}
                      className={`whitespace-nowrap px-3 py-3 ${surfaces.mutedText}`}
                    >
                      {personFieldText(relation.companion, field)}
                    </td>
                  ))}
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
