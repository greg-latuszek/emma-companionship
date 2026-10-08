'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { JSX } from 'react';
import type { CommunityMember } from '@/types/community-member';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import {
  companionshipSelectOptions,
  type CompanionshipRelationFormState,
  type CompanionshipRelationFormValues,
} from './companionship-relation-form-state';

const emptyFormValues: CompanionshipRelationFormValues = {
  companion_id: '',
  accompanied_id: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  notes: '',
};

type CompanionshipRelationFormAction = (
  state: CompanionshipRelationFormState | undefined,
  formData: FormData
) => Promise<CompanionshipRelationFormState>;

const selectOptionClassName = 'bg-white text-gray-900';

function FieldError({
  message,
  className,
}: {
  message?: string;
  className: string;
}): JSX.Element | null {
  if (!message) {
    return null;
  }
  return <p className={`text-sm ${className}`}>{message}</p>;
}

function formatMemberName(member: CommunityMember): string {
  return `${member.last_name}, ${member.first_name}`;
}

function sortCommunityMembersByPolishName(members: CommunityMember[]): CommunityMember[] {
  return [...members].sort((a, b) =>
    formatMemberName(a).localeCompare(formatMemberName(b), 'pl')
  );
}

function CompanionshipParticipantSelects({
  members,
  initialAccompaniedId,
  initialCompanionId,
  fieldControlClassName,
  dangerTextClassName,
  accompaniedError,
  companionError,
}: {
  members: CommunityMember[];
  initialAccompaniedId: string;
  initialCompanionId: string;
  fieldControlClassName: string;
  dangerTextClassName: string;
  accompaniedError?: string;
  companionError?: string;
}): JSX.Element {
  const [accompaniedId, setAccompaniedId] = useState(initialAccompaniedId);
  const [companionId, setCompanionId] = useState(initialCompanionId);

  const accompanied = members.find((member) => member.id === accompaniedId);
  const companion = members.find((member) => member.id === companionId);

  const accompaniedOptions = sortCommunityMembersByPolishName(
    companionshipSelectOptions(members, companion, accompaniedId)
  );
  const companionOptions = sortCommunityMembersByPolishName(
    companionshipSelectOptions(members, accompanied, companionId)
  );

  return (
    <>
      <label className="flex flex-col gap-1">
        <span>Akompaniowany</span>
        <select
          name="accompanied_id"
          value={accompaniedId}
          onChange={(event) => setAccompaniedId(event.target.value)}
          className={fieldControlClassName}
          required
        >
          <option value="" className={selectOptionClassName}>
            wybierz osobę...
          </option>
          {accompaniedOptions.map((member) => (
            <option key={member.id} value={member.id} className={selectOptionClassName}>
              {formatMemberName(member)}
            </option>
          ))}
        </select>
        <FieldError message={accompaniedError} className={dangerTextClassName} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Akompaniator</span>
        <select
          name="companion_id"
          value={companionId}
          onChange={(event) => setCompanionId(event.target.value)}
          className={fieldControlClassName}
          required
        >
          <option value="" className={selectOptionClassName}>
            wybierz osobę...
          </option>
          {companionOptions.map((member) => (
            <option key={member.id} value={member.id} className={selectOptionClassName}>
              {formatMemberName(member)}
            </option>
          ))}
        </select>
        <FieldError message={companionError} className={dangerTextClassName} />
      </label>
    </>
  );
}

export function CompanionshipRelationForm({
  action,
  members,
  initialValues,
  returnTab,
}: {
  action: CompanionshipRelationFormAction;
  members: CommunityMember[];
  initialValues?: CompanionshipRelationFormValues;
  returnTab?: string;
}): JSX.Element {
  const [state, formAction] = useActionState(action, undefined);
  const values = state?.values ?? initialValues ?? emptyFormValues;
  const surfaces = visualSurfaces(useVisualStyle());
  const fieldControlClassName = surfaces.field;

  const cancelHref =
    returnTab === 'missing'
      ? '/app/companionships?tab=missing'
      : '/app/companionships';

  // React resets the form after a Server Action. Remount with submitted values so
  // Akompaniowany / Akompaniator stay selected under validation errors.
  const formKey = state?.restoreKey ?? 'pristine';

  return (
    <div className="flex flex-col gap-4 text-left">
      {state?.formError ? (
        <p className={surfaces.formError}>
          {state.formError}
        </p>
      ) : null}
      <form key={formKey} action={formAction} className="flex flex-col gap-4 text-left">
        <input type="hidden" name="return_tab" value={returnTab ?? ''} />

        <CompanionshipParticipantSelects
          key={formKey}
          members={members}
          initialAccompaniedId={values.accompanied_id}
          initialCompanionId={values.companion_id}
          fieldControlClassName={fieldControlClassName}
          dangerTextClassName={surfaces.dangerText}
          accompaniedError={state?.fieldErrors?.accompanied_id}
          companionError={state?.fieldErrors?.companion_id}
        />

        <label className="flex flex-col gap-1">
          <span>Data rozpoczęcia</span>
          <input
            name="start_date"
            type="date"
            defaultValue={values.start_date}
            className={fieldControlClassName}
          />
          <FieldError message={state?.fieldErrors?.start_date} className={surfaces.dangerText} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Data zakończenia (opcjonalnie)</span>
          <input
            name="end_date"
            type="date"
            defaultValue={values.end_date}
            className={fieldControlClassName}
          />
          <FieldError message={state?.fieldErrors?.end_date} className={surfaces.dangerText} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Notatki (opcjonalnie)</span>
          <textarea
            name="notes"
            defaultValue={values.notes}
            rows={4}
            className={fieldControlClassName}
          />
          <FieldError message={state?.fieldErrors?.notes} className={surfaces.dangerText} />
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            href={cancelHref}
            className={surfaces.secondaryButton}
          >
            Anuluj
          </Link>
          <button
            type="submit"
            className={surfaces.primaryButton}
          >
            Zapisz
          </button>
        </div>
      </form>
    </div>
  );
}
