'use client';

import { useId, useState, type JSX } from 'react';
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

function companionKey(companion: CompanionLoad): string {
  return `${companion.kind}-${companion.label}`;
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
  const chartId = useId();
  const [unfoldedKeys, setUnfoldedKeys] = useState<ReadonlySet<string>>(new Set());
  const largestLoad = Math.max(0, ...companions.map((companion) => companion.load));

  function toggleUnfolded(key: string): void {
    setUnfoldedKeys((current) => {
      const next = new Set(current);
      if (!next.delete(key)) {
        next.add(key);
      }
      return next;
    });
  }

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
            {companions.map((companion) => {
              const key = companionKey(companion);
              const isUnfolded = unfoldedKeys.has(key);
              const accompaniedListId = `${chartId}-${key}`;
              return (
                <li key={key} className="min-w-0 py-px" title={barDescription(companion)}>
                  <button
                    type="button"
                    aria-expanded={isUnfolded}
                    aria-controls={accompaniedListId}
                    onClick={() => toggleUnfolded(key)}
                    className={`block w-full cursor-pointer text-left ${surfaces.focusOutline}`}
                  >
                    <div
                      className={`flex h-6 min-w-[7rem] items-center gap-2 rounded-r px-2 text-sm text-white hover:brightness-110 ${
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
                  </button>
                  {isUnfolded ? (
                    <ul
                      id={accompaniedListId}
                      className={`my-1 ml-2 flex flex-col gap-0.5 border-l py-1 pl-3 text-sm ${surfaces.hairline} ${surfaces.strongText}`}
                    >
                      {companion.accompanied.map((unit) => (
                        <li key={unit.label}>{unit.label}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
