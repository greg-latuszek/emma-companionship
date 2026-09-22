'use client';

import { useActionState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import {
  useApplyVisualStyle,
  useVisualStyle,
} from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { visualStyles, type VisualStyle } from '@/types/auth';
import { submitMemberVisualStyle } from './actions';
import { visualStyleLabels } from './visual-style-form-state';

export function VisualStyleSettings(): JSX.Element {
  const [state, formAction] = useActionState(submitMemberVisualStyle, undefined);
  const visualStyle = useVisualStyle();
  const applyVisualStyle = useApplyVisualStyle();
  const surfaces = visualSurfaces(visualStyle);
  const styleBeforeChoice = useRef<VisualStyle>(visualStyle);

  useEffect(() => {
    if (state?.formError) {
      applyVisualStyle(styleBeforeChoice.current);
    }
  }, [state, applyVisualStyle]);

  return (
    <form action={formAction}>
      <h3 className="mb-2 text-lg font-bold">Ustawienia aplikacji</h3>
      <fieldset>
        <legend className={`mb-3 text-sm ${surfaces.mutedText}`}>Wygląd</legend>
        <div className="flex flex-col gap-2">
          {visualStyles.map((style) => {
            const isSelected = style === visualStyle;
            return (
              <button
                key={style}
                type="submit"
                name="visual_style"
                value={style}
                aria-pressed={isSelected}
                onClick={() => {
                  styleBeforeChoice.current = visualStyle;
                  applyVisualStyle(style);
                }}
                className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${surfaces.choice(isSelected)}`}
              >
                {visualStyleLabels[style]}
              </button>
            );
          })}
        </div>
      </fieldset>
      {state?.formError ? (
        <p className={`mt-3 text-sm ${surfaces.dangerText}`} role="alert">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
