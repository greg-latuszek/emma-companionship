'use client';

import { useTransition, useState } from 'react';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { submitDeleteCompanionshipRelation } from './actions';

export function DeleteCompanionshipRelationButton({
  relationId,
  accompaniedName,
  companionName,
}: {
  relationId: string;
  accompaniedName: string;
  companionName: string;
}): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const surfaces = visualSurfaces(useVisualStyle());

  function handleDelete() {
    startTransition(async () => {
      const result = await submitDeleteCompanionshipRelation(relationId);
      if (!result.success) {
        setError(result.error ?? 'Wystąpił błąd');
        setShowConfirm(false);
      }
    });
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-white/80">
          Czy na pewno chcesz usunąć akompaniament?
        </p>
        <p className="text-xs text-white/60">
          {accompaniedName} ← {companionName}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className={`text-sm font-medium ${surfaces.dangerText} underline-offset-4 hover:underline disabled:opacity-50`}
          >
            {isPending ? 'Usuwanie...' : 'Tak, usuń'}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className={`text-sm font-medium ${surfaces.strongText} underline-offset-4 hover:underline disabled:opacity-50`}
          >
            Anuluj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setShowConfirm(true);
        }}
        className={`text-sm font-medium ${surfaces.dangerText} underline-offset-4 hover:underline`}
      >
        Usuń
      </button>
      {error ? (
        <p className={`text-xs ${surfaces.dangerText}`}>{error}</p>
      ) : null}
    </div>
  );
}
