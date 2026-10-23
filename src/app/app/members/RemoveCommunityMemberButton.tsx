'use client';

import { useActionState } from 'react';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { submitCommunityMemberRemoval } from './actions';
import { useTranslate } from '@/i18n/LocaleProvider';

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
  const translate = useTranslate();

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(translate('members.remove.confirm', { name: memberName }))) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-start gap-1"
    >
      {state?.formError ? (
        <p className={`text-sm ${surfaces.dangerText}`}>{translate(state.formError)}</p>
      ) : null}
      <button
        type="submit"
        className={`text-sm font-medium ${surfaces.dangerText} underline-offset-4 hover:underline`}
      >
        {translate('common.delete')}
      </button>
    </form>
  );
}
