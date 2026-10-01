'use client';

import { useEffect, useState, type JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';
import { MirroredHorizontalScroll } from '../members/MirroredHorizontalScroll';
import {
  peopleWithoutCompanionColumnLabels,
  peopleWithoutCompanionColumns,
  personWithoutCompanionColumnText,
  readStoredPeopleWithoutCompanionShownColumns,
  storePeopleWithoutCompanionShownColumns,
  togglePeopleWithoutCompanionColumn,
  type PeopleWithoutCompanionColumn,
} from './people-without-companion-list-state';

function personFullName(person: PersonWithoutCompanion): string {
  return `${person.last_name} ${person.first_name}`;
}

export function PeopleWithoutCompanionList({
  people,
}: {
  people: PersonWithoutCompanion[];
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  const [shownColumns, setShownColumns] = useState<
    PeopleWithoutCompanionColumn[]
  >([]);

  useEffect(() => {
    setShownColumns(
      readStoredPeopleWithoutCompanionShownColumns(window.localStorage)
    );
  }, []);

  function toggleColumn(column: PeopleWithoutCompanionColumn): void {
    setShownColumns((current) => {
      const next = togglePeopleWithoutCompanionColumn(current, column);
      storePeopleWithoutCompanionShownColumns(next, window.localStorage);
      return next;
    });
  }

  if (people.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        Każda osoba ma akompaniatora.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Column toggle */}
      <fieldset className="flex flex-col gap-2">
        <legend className={`text-sm ${surfaces.secondaryText}`}>
          Pokaż kolumny
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {peopleWithoutCompanionColumns.map((column) => (
            <label key={column} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={shownColumns.includes(column)}
                onChange={() => toggleColumn(column)}
              />
              <span>{peopleWithoutCompanionColumnLabels[column]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Mobile cards */}
      <ul className={`divide-y ${surfaces.rowDivider} text-left lg:hidden`}>
        {people.map((person) => (
          <li key={person.id} className="flex flex-col gap-1 py-4">
            <span className="font-bold text-yellow-300">
              {personFullName(person)}
            </span>
            {shownColumns.map((column) => {
              const text = personWithoutCompanionColumnText(person, column);
              if (!text) return null;
              return (
                <span key={column} className={`text-sm ${surfaces.secondaryText}`}>
                  {peopleWithoutCompanionColumnLabels[column]}: {text}
                </span>
              );
            })}
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden min-w-0 max-w-full lg:block">
        <MirroredHorizontalScroll>
          <table className="w-max min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className={`border-b ${surfaces.hairline}`}>
                <th
                  className={`${surfaces.stickyCell} sticky left-0 z-10 min-w-[14rem] px-3 py-3 font-bold text-yellow-300`}
                >
                  Osoba
                </th>
                {shownColumns.map((column) => (
                  <th
                    key={column}
                    className="min-w-[12rem] px-3 py-3 font-semibold"
                  >
                    {peopleWithoutCompanionColumnLabels[column]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${surfaces.rowDivider}`}>
              {people.map((person) => (
                <tr key={person.id}>
                  <td
                    className={`${surfaces.stickyCell} sticky left-0 z-10 whitespace-nowrap px-3 py-3 font-bold text-yellow-300`}
                  >
                    {personFullName(person)}
                  </td>
                  {shownColumns.map((column) => (
                    <td
                      key={column}
                      className={`px-3 py-3 ${
                        column === 'community_engagement_status' &&
                        !person.community_engagement_status
                          ? surfaces.mutedText
                          : ''
                      }`}
                    >
                      {personWithoutCompanionColumnText(person, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </MirroredHorizontalScroll>
      </div>
    </div>
  );
}
