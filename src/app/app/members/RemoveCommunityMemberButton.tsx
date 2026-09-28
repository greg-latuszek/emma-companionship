'use client';

import { useActionState } from 'react';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { submitCommunityMemberRemoval } from './actions';

export function RemoveCommunityMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}): JSX.Element {
  const removePerson = submitCommunityMemberRemoval.bind(null, memberId);
  const [state, formAction] = useActionState(removePerson, undefined);
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(`Usunąć ${memberName} z rejestru?`)) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-start gap-1"
    >
      {state?.formError ? (
        <p className={`text-sm ${surfaces.dangerText}`}>{state.formError}</p>
      ) : null}
      <button
        type="submit"
        className={`text-sm font-medium ${surfaces.dangerText} underline-offset-4 hover:underline`}
      >
        Usuń
      </button>
    </form>
  );
}
