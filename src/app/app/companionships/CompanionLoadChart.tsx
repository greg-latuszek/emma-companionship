'use client';

import type { JSX } from 'react';
import type { CompanionLoad } from '@/application/list-companion-loads';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { useTranslate } from '@/i18n/LocaleProvider';
import { barLengthShare } from './companion-load-chart';

const overwhelmedBarClassName = 'bg-red-700';
const fineBarClassName = 'bg-green-700';

function accompaniedLastNames(companion: CompanionLoad): string {
  return companion.accompanied.map((unit) => unit.lastName).join(', ');
}

function barDescription(companion: CompanionLoad): string {
  return `${companion.load} ${companion.label} (${accompaniedLastNames(companion)})`;
}

function LegendSwatch({ className }: { className: string }): JSX.Element {
  return <span aria-hidden className={`h-3 w-3 shrink-0 rounded-sm ${className}`} />;
}

export function CompanionLoadChart({
  companions,
  limit,
}: {
  companions: CompanionLoad[];
  limit: number;
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());
  const translate = useTranslate();
  const largestLoad = Math.max(0, ...companions.map((companion) => companion.load));

  return (
    <section className="flex min-w-0 flex-col gap-4 text-left">
      <h2 className={`text-lg ${surfaces.headerText}`}>
        {translate('companionships.statistics.overwhelmed.title')}
      </h2>

      {companions.length === 0 ? (
        <p className={`text-center ${surfaces.mutedText}`}>
          {translate('companionships.statistics.overwhelmed.empty')}
        </p>
      ) : (
        <>
          <ul
            className={`flex flex-wrap gap-x-6 gap-y-1 text-sm ${surfaces.mutedText}`}
          >
            <li className="flex items-center gap-2">
              <LegendSwatch className={overwhelmedBarClassName} />
              {translate('companionships.statistics.overwhelmed.legendOverwhelmed', {
                count: limit,
              })}
            </li>
            <li className="flex items-center gap-2">
              <LegendSwatch className={fineBarClassName} />
              {translate('companionships.statistics.overwhelmed.legendFine')}
            </li>
          </ul>

          <ul className="flex min-w-0 flex-col gap-0.5">
            {companions.map((companion) => (
              <li
                key={`${companion.kind}-${companion.label}`}
                className="min-w-0 py-px"
                title={barDescription(companion)}
              >
                <div
                  className={`flex h-6 min-w-[7rem] items-center gap-2 rounded-r px-2 text-sm text-white ${
                    companion.isOverwhelmed
                      ? overwhelmedBarClassName
                      : fineBarClassName
                  }`}
                  style={{
                    width: `${barLengthShare(companion.load, largestLoad) * 100}%`,
                  }}
                >
                  <span className="shrink-0 font-bold">{companion.load}</span>
                  <span className="min-w-0 truncate">
                    {companion.label}{' '}
                    <span className="opacity-80">
                      ({accompaniedLastNames(companion)})
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
