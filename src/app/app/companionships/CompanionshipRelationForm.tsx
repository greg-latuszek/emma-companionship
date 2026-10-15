'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { JSX } from 'react';
import {
  findAccompaniedCompanionshipOption,
  formatCompanionshipCoupleOptionLabel,
  proposeCompanionCompanionshipOptions,
  type CompanionshipParticipantOption,
} from '@/application/companionship-add-participant-options';
import type { CommunityMember } from '@/types/community-member';
import type { CoupleListItem } from '@/types/couple';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import {
  companionshipSelectOptions,
  type CompanionshipParticipantKind,
  type CompanionshipRelationFormState,
  type CompanionshipRelationFormValues,
} from './companionship-relation-form-state';

export type LockedCoupleCompanionshipEdit = {
  accompaniedCouple: CoupleListItem;
  husbandRelationId: string;
  wifeRelationId: string;
};

/** Add form after Find Companion choose: both sides fixed; save activates the proposal. */
export type LockedFromFindCompanionship = {
  accompaniedKind: CompanionshipParticipantKind;
  accompaniedId: string;
  accompaniedLabel: string;
  companionKind: CompanionshipParticipantKind;
  companionId: string;
  companionLabel: string;
  proposalId?: string;
  husbandProposalId?: string;
  wifeProposalId?: string;
};

const emptyFormValues: CompanionshipRelationFormValues = {
  accompanied_kind: '',
  accompanied_id: '',
  companion_kind: '',
  companion_id: '',
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

function LockedPersonAccompaniedSelect({
  members,
  accompaniedCandidates,
  initialAccompaniedId,
  initialCompanionId,
  fieldControlClassName,
  dangerTextClassName,
  accompaniedError,
  companionError,
}: {
  members: CommunityMember[];
  accompaniedCandidates: CommunityMember[];
  initialAccompaniedId: string;
  initialCompanionId: string;
  fieldControlClassName: string;
  dangerTextClassName: string;
  accompaniedError?: string;
  companionError?: string;
}): JSX.Element {
  const [companionId, setCompanionId] = useState(initialCompanionId);

  const accompanied =
    accompaniedCandidates.find((member) => member.id === initialAccompaniedId) ??
    members.find((member) => member.id === initialAccompaniedId);

  const companionOptions = sortCommunityMembersByPolishName(
    companionshipSelectOptions(members, accompanied, companionId)
  );

  return (
    <>
      <input type="hidden" name="accompanied_kind" value="person" />
      <input type="hidden" name="companion_kind" value="person" />
      <label className="flex flex-col gap-1">
        <span>Akompaniowany</span>
        <input type="hidden" name="accompanied_id" value={initialAccompaniedId} />
        <p className={fieldControlClassName}>
          {accompanied ? formatMemberName(accompanied) : '—'}
        </p>
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

function LockedFromFindParticipants({
  lockedFromFind,
  fieldControlClassName,
  dangerTextClassName,
  accompaniedError,
  companionError,
}: {
  lockedFromFind: LockedFromFindCompanionship;
  fieldControlClassName: string;
  dangerTextClassName: string;
  accompaniedError?: string;
  companionError?: string;
}): JSX.Element {
  return (
    <>
      <input type="hidden" name="from" value="find" />
      <input
        type="hidden"
        name="accompanied_kind"
        value={lockedFromFind.accompaniedKind}
      />
      <input
        type="hidden"
        name="companion_kind"
        value={lockedFromFind.companionKind}
      />
      <input
        type="hidden"
        name="accompanied_id"
        value={lockedFromFind.accompaniedId}
      />
      <input
        type="hidden"
        name="companion_id"
        value={lockedFromFind.companionId}
      />
      {lockedFromFind.proposalId ? (
        <input type="hidden" name="proposal" value={lockedFromFind.proposalId} />
      ) : null}
      {lockedFromFind.husbandProposalId ? (
        <input
          type="hidden"
          name="proposal_husband"
          value={lockedFromFind.husbandProposalId}
        />
      ) : null}
      {lockedFromFind.wifeProposalId ? (
        <input
          type="hidden"
          name="proposal_wife"
          value={lockedFromFind.wifeProposalId}
        />
      ) : null}

      <label className="flex flex-col gap-1">
        <span>Akompaniowany</span>
        <p className={fieldControlClassName}>{lockedFromFind.accompaniedLabel}</p>
        <FieldError message={accompaniedError} className={dangerTextClassName} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Akompaniator</span>
        <p className={fieldControlClassName}>{lockedFromFind.companionLabel}</p>
        <FieldError message={companionError} className={dangerTextClassName} />
      </label>
    </>
  );
}

function LockedCoupleAccompaniedSelect({
  couples,
  lockedCoupleEdit,
  initialCompanionCoupleId,
  fieldControlClassName,
  dangerTextClassName,
  accompaniedError,
  companionError,
}: {
  couples: CoupleListItem[];
  lockedCoupleEdit: LockedCoupleCompanionshipEdit;
  initialCompanionCoupleId: string;
  fieldControlClassName: string;
  dangerTextClassName: string;
  accompaniedError?: string;
  companionError?: string;
}): JSX.Element {
  const [companionCoupleId, setCompanionCoupleId] = useState(
    initialCompanionCoupleId
  );

  const accompaniedOption: CompanionshipParticipantOption = {
    kind: 'couple',
    id: lockedCoupleEdit.accompaniedCouple.id,
    label: formatCompanionshipCoupleOptionLabel(
      lockedCoupleEdit.accompaniedCouple
    ),
  };
  const companionOptions = proposeCompanionCompanionshipOptions(
    accompaniedOption,
    [],
    couples,
    companionCoupleId
  );

  return (
    <>
      <input type="hidden" name="accompanied_kind" value="couple" />
      <input type="hidden" name="companion_kind" value="couple" />
      <input
        type="hidden"
        name="husband_relation_id"
        value={lockedCoupleEdit.husbandRelationId}
      />
      <input
        type="hidden"
        name="wife_relation_id"
        value={lockedCoupleEdit.wifeRelationId}
      />
      <label className="flex flex-col gap-1">
        <span>Akompaniowany</span>
        <input
          type="hidden"
          name="accompanied_id"
          value={lockedCoupleEdit.accompaniedCouple.id}
        />
        <p className={fieldControlClassName}>{accompaniedOption.label}</p>
        <FieldError message={accompaniedError} className={dangerTextClassName} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Akompaniator</span>
        <select
          name="companion_id"
          value={companionCoupleId}
          onChange={(event) => setCompanionCoupleId(event.target.value)}
          className={fieldControlClassName}
          required
        >
          <option value="" className={selectOptionClassName}>
            wybierz małżeństwo...
          </option>
          {companionOptions.map((option) => (
            <option
              key={`${option.kind}-${option.id}`}
              value={option.id}
              className={selectOptionClassName}
            >
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={companionError} className={dangerTextClassName} />
      </label>
    </>
  );
}

function MixedCompanionshipParticipantSelects({
  members,
  couples,
  accompaniedOptions,
  initialAccompaniedKind,
  initialAccompaniedId,
  initialCompanionKind,
  initialCompanionId,
  fieldControlClassName,
  dangerTextClassName,
  accompaniedError,
  companionError,
}: {
  members: CommunityMember[];
  couples: CoupleListItem[];
  accompaniedOptions: CompanionshipParticipantOption[];
  initialAccompaniedKind: CompanionshipParticipantKind | '';
  initialAccompaniedId: string;
  initialCompanionKind: CompanionshipParticipantKind | '';
  initialCompanionId: string;
  fieldControlClassName: string;
  dangerTextClassName: string;
  accompaniedError?: string;
  companionError?: string;
}): JSX.Element {
  const [accompaniedId, setAccompaniedId] = useState(initialAccompaniedId);
  const [accompaniedKind, setAccompaniedKind] = useState<
    CompanionshipParticipantKind | ''
  >(initialAccompaniedKind);
  const [companionId, setCompanionId] = useState(initialCompanionId);
  const [companionKind, setCompanionKind] = useState<
    CompanionshipParticipantKind | ''
  >(initialCompanionKind);

  const accompanied = findAccompaniedCompanionshipOption(
    accompaniedOptions,
    accompaniedId
  );
  const companionOptions = proposeCompanionCompanionshipOptions(
    accompanied,
    members,
    couples,
    companionId
  );

  function chooseAccompanied(optionId: string): void {
    const option = findAccompaniedCompanionshipOption(accompaniedOptions, optionId);
    setAccompaniedId(optionId);
    setAccompaniedKind(option?.kind ?? '');
    setCompanionId('');
    setCompanionKind('');
  }

  function chooseCompanion(optionId: string): void {
    const option = companionOptions.find((candidate) => candidate.id === optionId);
    setCompanionId(optionId);
    setCompanionKind(option?.kind ?? '');
  }

  const companionPlaceholder =
    accompanied?.kind === 'couple' ? 'wybierz małżeństwo...' : 'wybierz osobę...';

  return (
    <>
      <input type="hidden" name="accompanied_kind" value={accompaniedKind} />
      <input type="hidden" name="companion_kind" value={companionKind} />

      <label className="flex flex-col gap-1">
        <span>Akompaniowany</span>
        <select
          name="accompanied_id"
          value={accompaniedId}
          onChange={(event) => chooseAccompanied(event.target.value)}
          className={fieldControlClassName}
          required
        >
          <option value="" className={selectOptionClassName}>
            wybierz...
          </option>
          {accompaniedOptions.map((option) => (
            <option key={`${option.kind}-${option.id}`} value={option.id} className={selectOptionClassName}>
              {option.label}
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
          onChange={(event) => chooseCompanion(event.target.value)}
          className={fieldControlClassName}
          required
          disabled={!accompanied}
        >
          <option value="" className={selectOptionClassName}>
            {companionPlaceholder}
          </option>
          {companionOptions.map((option) => (
            <option key={`${option.kind}-${option.id}`} value={option.id} className={selectOptionClassName}>
              {option.label}
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
  accompaniedCandidates = [],
  accompaniedOptions,
  couples = [],
  accompaniedLocked = false,
  lockedCoupleEdit,
  lockedFromFind,
  initialValues,
  returnTab,
  cancelHref: cancelHrefOverride,
}: {
  action: CompanionshipRelationFormAction;
  members: CommunityMember[];
  /** Edit: locked accompanied person (and legacy person-only candidate list). */
  accompaniedCandidates?: CommunityMember[];
  /** Add: mixed person/couple Accompanied options. */
  accompaniedOptions?: CompanionshipParticipantOption[];
  /** Couples for Companion when Accompanied is a couple (add or couple edit). */
  couples?: CoupleListItem[];
  /** Edit person: show Accompanied as fixed text; only Companion is choosable. */
  accompaniedLocked?: boolean;
  /** Edit couple: locked accompanied couple + Companion couples dropdown. */
  lockedCoupleEdit?: LockedCoupleCompanionshipEdit;
  /** Add from Find Companion: both participants fixed; hide end date. */
  lockedFromFind?: LockedFromFindCompanionship;
  initialValues?: CompanionshipRelationFormValues;
  returnTab?: string;
  cancelHref?: string;
}): JSX.Element {
  const [state, formAction] = useActionState(action, undefined);
  const values = state?.values ?? initialValues ?? emptyFormValues;
  const surfaces = visualSurfaces(useVisualStyle());
  const fieldControlClassName = surfaces.field;

  const cancelHref =
    cancelHrefOverride ??
    (returnTab === 'missing'
      ? '/app/companionships?tab=missing'
      : '/app/companionships');

  // React resets the form after a Server Action. Remount with submitted values so
  // Accompanied / Companion stay selected under validation errors.
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

        {lockedFromFind ? (
          <LockedFromFindParticipants
            lockedFromFind={lockedFromFind}
            fieldControlClassName={fieldControlClassName}
            dangerTextClassName={surfaces.dangerText}
            accompaniedError={state?.fieldErrors?.accompanied_id}
            companionError={state?.fieldErrors?.companion_id}
          />
        ) : lockedCoupleEdit ? (
          <LockedCoupleAccompaniedSelect
            key={formKey}
            couples={couples}
            lockedCoupleEdit={lockedCoupleEdit}
            initialCompanionCoupleId={values.companion_id}
            fieldControlClassName={fieldControlClassName}
            dangerTextClassName={surfaces.dangerText}
            accompaniedError={state?.fieldErrors?.accompanied_id}
            companionError={state?.fieldErrors?.companion_id}
          />
        ) : accompaniedLocked ? (
          <LockedPersonAccompaniedSelect
            key={formKey}
            members={members}
            accompaniedCandidates={accompaniedCandidates}
            initialAccompaniedId={values.accompanied_id}
            initialCompanionId={values.companion_id}
            fieldControlClassName={fieldControlClassName}
            dangerTextClassName={surfaces.dangerText}
            accompaniedError={state?.fieldErrors?.accompanied_id}
            companionError={state?.fieldErrors?.companion_id}
          />
        ) : (
          <MixedCompanionshipParticipantSelects
            key={formKey}
            members={members}
            couples={couples}
            accompaniedOptions={accompaniedOptions ?? []}
            initialAccompaniedKind={values.accompanied_kind}
            initialAccompaniedId={values.accompanied_id}
            initialCompanionKind={values.companion_kind}
            initialCompanionId={values.companion_id}
            fieldControlClassName={fieldControlClassName}
            dangerTextClassName={surfaces.dangerText}
            accompaniedError={state?.fieldErrors?.accompanied_id}
            companionError={state?.fieldErrors?.companion_id}
          />
        )}

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

        {lockedFromFind ? null : (
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
        )}

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
