'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import type { PersonWithoutCompanionRow } from '@/application/group-people-without-companion';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { useTranslate } from '@/i18n/LocaleProvider';

function accompaniedIdFrom(row: PersonWithoutCompanionRow): string {
  return row.kind === 'person' ? row.person.id : row.couple.id;
}

function assignHref(row: PersonWithoutCompanionRow): string {
  return `/app/companionships?tab=new&accompanied=${accompaniedIdFrom(row)}`;
}

function findHref(row: PersonWithoutCompanionRow): string {
  return `/app/companionships?tab=find&accompanied=${accompaniedIdFrom(row)}`;
}

export function PeopleWithoutCompanionList({
  rows,
}: {
  rows: PersonWithoutCompanionRow[];
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());
  const translate = useTranslate();

  if (rows.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        {translate('companionships.missing.empty')}
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
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <Link
                href={assignHref(row)}
                className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
              >
                {translate('companionships.missing.assign')}
              </Link>
              <Link
                href={findHref(row)}
                className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
              >
                {translate('companionships.missing.find')}
              </Link>
            </div>
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
                {translate('companionships.missing.personOrCouple')}
              </th>
              <th className="px-3 py-3">
                <span className="sr-only">{translate('common.actions')}</span>
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
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <Link
                      href={assignHref(row)}
                      className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
                    >
                      {translate('companionships.missing.assign')}
                    </Link>
                    <Link
                      href={findHref(row)}
                      className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline`}
                    >
                      {translate('companionships.missing.find')}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
