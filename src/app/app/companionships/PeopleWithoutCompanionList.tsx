'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';

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
      {/* Mobile cards */}
      <ul className={`divide-y ${surfaces.rowDivider} text-left lg:hidden`}>
        {people.map((person) => (
          <li key={person.id} className="flex flex-col gap-1 py-4">
            <span className={surfaces.importantText}>
              {personFullName(person)}
            </span>
            <Link
              href={`/app/companionships?tab=new&accompanied=${person.id}`}
              className={`mt-2 self-start text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
            >
              Przypisz akompaniatora
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden min-w-0 max-w-full lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className={`border-b ${surfaces.hairline}`}>
              <th
                className={`${surfaces.importantArea} min-w-[14rem] px-3 py-2 font-bold`}
              >
                Osoba
              </th>
              <th className="px-3 py-3">
                <span className="sr-only">Działania</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${surfaces.rowDivider}`}>
            {people.map((person) => (
              <tr key={person.id}>
                <td
                  className={`whitespace-nowrap px-3 py-3 ${surfaces.importantText}`}
                >
                  {personFullName(person)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Link
                    href={`/app/companionships?tab=new&accompanied=${person.id}`}
                    className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
                  >
                    Przypisz akompaniatora
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
