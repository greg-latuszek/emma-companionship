'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import type { JSX } from 'react';
import {
  dragPersonOntoEmptyCoupleBuilderCell,
  proposeCoupleBuilderRows,
  reconcileCoupleBuilderDraft,
  rejectCoupleBuilderProposal,
  type CoupleBuilderRow,
} from '@/application/couple-builder-rows';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { MarriedPersonWithoutCouple } from '@/types/couple';
import { submitConfirmCouple } from './actions';
import {
  readStoredCoupleBuilderDraft,
  storeCoupleBuilderDraft,
} from './couple-builder-draft';
import {
  coupleListExtraFields,
  coupleListFieldLabels,
  coupleParticipantFieldText,
  defaultCoupleListExtraFields,
  readStoredCoupleListExtraFields,
  storeCoupleListExtraFields,
  toggleCoupleListExtraField,
  type CoupleListExtraField,
} from './couple-list-state';

function personName(person: MarriedPersonWithoutCouple): string {
  return `${person.first_name} ${person.last_name}`;
}

function BuilderPersonCell({
  person,
  extraFields,
  emptyLabel,
  onDropPerson,
  acceptsDrop,
}: {
  person: MarriedPersonWithoutCouple | null;
  extraFields: CoupleListExtraField[];
  emptyLabel: string;
  onDropPerson?: (personId: string) => void;
  acceptsDrop: boolean;
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  if (!person) {
    return (
      <div
        className={`min-h-16 rounded border border-dashed p-3 ${surfaces.hairline} ${acceptsDrop ? 'bg-white/10' : ''}`}
        onDragOver={(event) => {
          if (!acceptsDrop) {
            return;
          }
          event.preventDefault();
        }}
        onDrop={(event) => {
          if (!acceptsDrop || !onDropPerson) {
            return;
          }
          event.preventDefault();
          const personId = event.dataTransfer.getData('text/plain');
          if (personId) {
            onDropPerson(personId);
          }
        }}
      >
        <span className={`text-sm ${surfaces.mutedText}`}>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', person.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      className={`cursor-grab rounded border p-3 active:cursor-grabbing ${surfaces.hairline}`}
    >
      <p className={`font-medium ${surfaces.strongText}`}>{personName(person)}</p>
      {extraFields.map((field) => {
        const text = coupleParticipantFieldText(person, field);
        if (!text) {
          return null;
        }
        return (
          <p key={field} className={`text-sm ${surfaces.mutedText}`}>
            {coupleListFieldLabels[field]}: {text}
          </p>
        );
      })}
    </div>
  );
}

export function CoupleBuilder({
  people,
}: {
  people: MarriedPersonWithoutCouple[];
}): JSX.Element {
  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id as string, person])),
    [people]
  );
  const [rows, setRows] = useState<CoupleBuilderRow[]>([]);
  const [rejectedPairKeys, setRejectedPairKeys] = useState<string[]>([]);
  const [extraFields, setExtraFields] = useState<CoupleListExtraField[]>(
    defaultCoupleListExtraFields
  );
  const [rowError, setRowError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);
  const surfaces = visualSurfaces(useVisualStyle());

  useEffect(() => {
    const draft = readStoredCoupleBuilderDraft(window.localStorage);
    const rejected = new Set(draft?.rejectedPairKeys ?? []);
    const nextRows = draft
      ? reconcileCoupleBuilderDraft(people, draft.rows, rejected)
      : proposeCoupleBuilderRows(people, rejected);
    setRejectedPairKeys([...rejected]);
    setRows(nextRows);
    setExtraFields(readStoredCoupleListExtraFields(window.localStorage));
    setHydrated(true);
  }, [people]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    storeCoupleBuilderDraft(
      { rejectedPairKeys, rows },
      window.localStorage
    );
  }, [hydrated, rejectedPairKeys, rows]);

  function rememberExtraFields(next: CoupleListExtraField[]): void {
    setExtraFields(next);
    storeCoupleListExtraFields(next, window.localStorage);
  }

  function handleReject(rowIndex: number): void {
    setRowError(null);
    const result = rejectCoupleBuilderProposal(rows, rowIndex);
    setRows(result.rows);
    if (result.rejectedPairKey) {
      setRejectedPairKeys((current) =>
        current.includes(result.rejectedPairKey!)
          ? current
          : [...current, result.rejectedPairKey!]
      );
    }
  }

  function handleConfirm(rowIndex: number): void {
    const row = rows[rowIndex];
    if (!row?.husbandId || !row.wifeId) {
      return;
    }

    setRowError(null);
    startTransition(async () => {
      const result = await submitConfirmCouple({
        husbandId: row.husbandId!,
        wifeId: row.wifeId!,
      });
      if (!result.success) {
        setRowError(result.error ?? 'Wystąpił błąd');
        return;
      }
      setRows((current) =>
        current.filter(
          (currentRow) =>
            !(
              currentRow.husbandId === row.husbandId &&
              currentRow.wifeId === row.wifeId
            )
        )
      );
    });
  }

  function handleDrop(
    personId: string,
    targetRowIndex: number,
    side: 'husband' | 'wife'
  ): void {
    const person = peopleById.get(personId);
    if (!person) {
      return;
    }
    if (side === 'husband' && person.gender !== 'male') {
      return;
    }
    if (side === 'wife' && person.gender !== 'female') {
      return;
    }
    setRows((current) =>
      dragPersonOntoEmptyCoupleBuilderCell(
        current,
        personId,
        targetRowIndex,
        side
      )
    );
  }

  if (people.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        Wszyscy żonaci i zamężne ze znaną płcią są już w małżeństwach, albo brak
        takich osób w rejestrze.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <p className={`text-sm ${surfaces.mutedText}`}>
        Algorytm proponuje pary po nazwisku. Potwierdź ✓, odrzuć ✕ albo przeciągnij
        osobę na puste miejsce i potwierdź.
      </p>

      <fieldset className="flex flex-col gap-2 text-left">
        <legend className={`text-sm font-medium ${surfaces.strongText}`}>
          Widoczne pola
        </legend>
        <div className="flex flex-wrap gap-3">
          {coupleListExtraFields.map((field) => (
            <label
              key={field}
              className={`inline-flex items-center gap-2 text-sm ${surfaces.mutedText}`}
            >
              <input
                type="checkbox"
                checked={extraFields.includes(field)}
                onChange={() => {
                  rememberExtraFields(
                    toggleCoupleListExtraField(extraFields, field)
                  );
                }}
              />
              {coupleListFieldLabels[field]}
            </label>
          ))}
        </div>
      </fieldset>

      {rowError ? (
        <p className={`text-sm ${surfaces.formError}`}>{rowError}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        <div
          className={`hidden grid-cols-[1fr_1fr_auto] gap-3 border-b pb-2 lg:grid ${surfaces.rowDivider}`}
        >
          <span className={`font-medium ${surfaces.strongText}`}>Mąż</span>
          <span className={`font-medium ${surfaces.strongText}`}>Żona</span>
          <span className={`font-medium ${surfaces.strongText}`}>Akcje</span>
        </div>

        {rows.map((row, rowIndex) => {
          const husband = row.husbandId
            ? peopleById.get(row.husbandId) ?? null
            : null;
          const wife = row.wifeId ? peopleById.get(row.wifeId) ?? null : null;
          const canConfirm = Boolean(husband && wife);

          return (
            <div
              key={`${row.husbandId ?? 'h'}-${row.wifeId ?? 'w'}-${rowIndex}`}
              className={`grid grid-cols-1 gap-3 border-b pb-3 lg:grid-cols-[1fr_1fr_auto] ${surfaces.rowDivider}`}
            >
              <BuilderPersonCell
                person={husband}
                extraFields={extraFields}
                emptyLabel="Przeciągnij męża"
                acceptsDrop={row.husbandId == null}
                onDropPerson={(personId) =>
                  handleDrop(personId, rowIndex, 'husband')
                }
              />
              <BuilderPersonCell
                person={wife}
                extraFields={extraFields}
                emptyLabel="Przeciągnij żonę"
                acceptsDrop={row.wifeId == null}
                onDropPerson={(personId) =>
                  handleDrop(personId, rowIndex, 'wife')
                }
              />
              <div className="flex items-start gap-3 lg:flex-col">
                {canConfirm ? (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleConfirm(rowIndex)}
                      className={`text-lg font-medium ${surfaces.strongText} underline-offset-4 hover:underline disabled:opacity-50`}
                      aria-label="Potwierdź małżeństwo"
                      title="Potwierdź"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReject(rowIndex)}
                      className={`text-lg font-medium ${surfaces.dangerText} underline-offset-4 hover:underline disabled:opacity-50`}
                      aria-label="Odrzuć propozycję pary"
                      title="Odrzuć"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className={`text-sm ${surfaces.mutedText}`}>
                    Uzupełnij obie strony
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
