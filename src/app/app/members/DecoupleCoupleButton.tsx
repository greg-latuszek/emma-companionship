'use client';

import { useState, useTransition } from 'react';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { submitDecoupleCouple } from './actions';

export function DecoupleCoupleButton({
  coupleId,
  coupleName,
}: {
  coupleId: string;
  coupleName: string;
}): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const surfaces = visualSurfaces(useVisualStyle());

  function handleDecouple() {
    startTransition(async () => {
      const result = await submitDecoupleCouple(coupleId);
      if (!result.success) {
        setError(result.error ?? 'Wystąpił błąd');
        setShowConfirm(false);
      }
    });
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className={`text-sm ${surfaces.mutedText}`}>
          Czy na pewno chcesz rozłączyć małżeństwo?
        </p>
        <p className={`text-xs ${surfaces.secondaryText}`}>{coupleName}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDecouple}
            disabled={isPending}
            className={`text-sm font-medium ${surfaces.dangerText} underline-offset-4 hover:underline disabled:opacity-50`}
            aria-label="Potwierdź rozłączenie małżeństwa"
          >
            {isPending ? 'Rozłączanie...' : 'Tak, rozłącz'}
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
        aria-label={`Rozłącz małżeństwo ${coupleName}`}
        title="Rozłącz"
      >
        ✕
      </button>
      {error ? (
        <p className={`text-xs ${surfaces.dangerText}`}>{error}</p>
      ) : null}
    </div>
  );
}
