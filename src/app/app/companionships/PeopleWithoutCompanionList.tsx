'use client';

import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';
import { MirroredHorizontalScroll } from '../members/MirroredHorizontalScroll';

function personFullName(person: PersonWithoutCompanion): string {
  return `${person.last_name} ${person.first_name}`;
}

export function PeopleWithoutCompanionList({
  people,
}: {
  people: PersonWithoutCompanion[];
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  if (people.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        Każda osoba ma akompaniatora.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <ul className={`divide-y ${surfaces.rowDivider} text-left lg:hidden`}>
        {people.map((person) => (
          <li key={person.id} className="flex flex-col gap-1 py-4">
            <span className="font-bold text-yellow-300">
              {personFullName(person)}
            </span>
          </li>
        ))}
      </ul>

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
                </tr>
              ))}
            </tbody>
          </table>
        </MirroredHorizontalScroll>
      </div>
    </div>
  );
}
