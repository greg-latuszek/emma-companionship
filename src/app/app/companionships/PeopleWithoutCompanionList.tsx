'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import type { PersonWithoutCompanionRow } from '@/application/group-people-without-companion';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';

function assignHref(row: PersonWithoutCompanionRow): string {
  const accompaniedId = row.kind === 'person' ? row.person.id : row.couple.id;
  return `/app/companionships?tab=new&accompanied=${accompaniedId}`;
}

export function PeopleWithoutCompanionList({
  rows,
}: {
  rows: PersonWithoutCompanionRow[];
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  if (rows.length === 0) {
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
        {rows.map((row) => (
          <li
            key={row.kind === 'person' ? row.person.id : row.couple.id}
            className="flex flex-col gap-1 py-4"
          >
            <span className={surfaces.importantText}>{row.label}</span>
            <Link
              href={assignHref(row)}
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
                Osoba / Małżeństwo
              </th>
              <th className="px-3 py-3">
                <span className="sr-only">Działania</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${surfaces.rowDivider}`}>
            {rows.map((row) => (
              <tr
                key={row.kind === 'person' ? row.person.id : row.couple.id}
              >
                <td
                  className={`whitespace-nowrap px-3 py-3 ${surfaces.importantText}`}
                >
                  {row.label}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Link
                    href={assignHref(row)}
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
