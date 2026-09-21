'use client';

import { useActionState } from 'react';
import type { JSX } from 'react';
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
        <p className="text-sm text-red-700">{state.formError}</p>
      ) : null}
      <button
        type="submit"
        className="text-sm font-medium text-red-800 underline-offset-4 hover:underline"
      >
        Usuń
      </button>
    </form>
  );
}
