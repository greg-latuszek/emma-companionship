'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useState, useTransition } from 'react';
import type { JSX } from 'react';
import {
  findAccompaniedCompanionshipOption,
  proposeCompanionCompanionshipOptions,
  type CompanionshipParticipantOption,
} from '@/application/companionship-add-participant-options';
import type { ProposedCompanionshipChoice } from '@/application/group-proposed-companionship-choices';
import type { CommunityMember } from '@/types/community-member';
import type { CoupleListItem } from '@/types/couple';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { CompanionshipParticipantKind } from './companionship-relation-form-state';
import {
  companionshipChooseFromFindHref,
  companionshipFindHref,
  proposedCompanionshipChoiceFromValue,
  proposedCompanionshipChoiceValue,
  type CompanionshipFindFormState,
  type CompanionshipFindFormValues,
} from './companionship-find-form-state';
import {
  submitDeleteProposedCompanionship,
  submitRememberProposedCompanionship,
} from './actions';

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

function FindParticipantSelects({
  members,
  couples,
  accompaniedOptions,
  proposalChoices,
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
  proposalChoices: ProposedCompanionshipChoice[];
  initialAccompaniedKind: CompanionshipParticipantKind | '';
  initialAccompaniedId: string;
  initialCompanionKind: CompanionshipParticipantKind | '';
  initialCompanionId: string;
  fieldControlClassName: string;
  dangerTextClassName: string;
  accompaniedError?: string;
  companionError?: string;
}): JSX.Element {
  const router = useRouter();
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
  const proposedCompanionIds = new Set(
    proposalChoices.map((choice) =>
      choice.kind === 'person' ? choice.companionId : choice.companionCoupleId
    )
  );
  const companionOptions = proposeCompanionCompanionshipOptions(
    accompanied,
    members,
    couples,
    companionId
  ).filter(
    (option) =>
      option.id === companionId || !proposedCompanionIds.has(option.id)
  );

  function chooseAccompanied(optionId: string): void {
    const option = findAccompaniedCompanionshipOption(
      accompaniedOptions,
      optionId
    );
    setAccompaniedId(optionId);
    setAccompaniedKind(option?.kind ?? '');
    setCompanionId('');
    setCompanionKind('');
    router.push(companionshipFindHref(optionId || undefined));
  }

  function chooseCompanion(optionId: string): void {
    const option = companionOptions.find(
      (candidate) => candidate.id === optionId
    );
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
            <option
              key={`${option.kind}-${option.id}`}
              value={option.id}
              className={selectOptionClassName}
            >
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={accompaniedError} className={dangerTextClassName} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Proponowany Akompaniator</span>
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

export function CompanionshipFindForm({
  members,
  couples,
  accompaniedOptions,
  proposalChoices,
  initialValues,
}: {
  members: CommunityMember[];
  couples: CoupleListItem[];
  accompaniedOptions: CompanionshipParticipantOption[];
  proposalChoices: ProposedCompanionshipChoice[];
  initialValues: CompanionshipFindFormValues;
}): JSX.Element {
  const router = useRouter();
  const [rememberState, rememberAction] = useActionState(
    submitRememberProposedCompanionship,
    undefined as CompanionshipFindFormState | undefined
  );
  const values = rememberState?.values
    ? {
        accompanied_kind: rememberState.values.accompanied_kind,
        accompanied_id: rememberState.values.accompanied_id,
        companion_kind: rememberState.values.companion_kind,
        companion_id: rememberState.values.companion_id,
      }
    : initialValues;
  const surfaces = visualSurfaces(useVisualStyle());
  const fieldControlClassName = surfaces.field;
  const rememberFormKey = rememberState?.restoreKey ?? 'pristine';

  const [selectedChoiceValue, setSelectedChoiceValue] = useState('');
  const [chooseError, setChooseError] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [isDeleting, startDelete] = useTransition();

  const accompanied = findAccompaniedCompanionshipOption(
    accompaniedOptions,
    values.accompanied_id
  );

  function chooseSelectedProposal(): void {
    const choice = proposedCompanionshipChoiceFromValue(
      selectedChoiceValue,
      proposalChoices
    );
    if (!choice || !accompanied) {
      setChooseError('Wybierz akompaniatora z listy propozycji.');
      return;
    }

    setChooseError(undefined);
    if (choice.kind === 'person' && accompanied.kind === 'person') {
      router.push(
        companionshipChooseFromFindHref({
          accompaniedKind: 'person',
          accompaniedId: accompanied.id,
          companionKind: 'person',
          companionId: choice.companionId,
          proposalId: choice.relationId,
        })
      );
      return;
    }

    if (choice.kind === 'couple' && accompanied.kind === 'couple') {
      router.push(
        companionshipChooseFromFindHref({
          accompaniedKind: 'couple',
          accompaniedId: accompanied.id,
          companionKind: 'couple',
          companionId: choice.companionCoupleId,
          husbandProposalId: choice.husbandRelationId,
          wifeProposalId: choice.wifeRelationId,
        })
      );
      return;
    }

    setChooseError('Wybierz akompaniatora z listy propozycji.');
  }

  function removeProposal(choice: ProposedCompanionshipChoice): void {
    setDeleteError(undefined);
    startDelete(async () => {
      const formData = new FormData();
      formData.set('accompanied_id', values.accompanied_id);
      if (choice.kind === 'person') {
        formData.set('proposal_kind', 'person');
        formData.set('proposal_id', choice.relationId);
      } else {
        formData.set('proposal_kind', 'couple');
        formData.set('husband_proposal_id', choice.husbandRelationId);
        formData.set('wife_proposal_id', choice.wifeRelationId);
      }
      const result = await submitDeleteProposedCompanionship(formData);
      if (!result.success) {
        setDeleteError(result.error ?? 'Nie udało się usunąć propozycji.');
        return;
      }
      if (selectedChoiceValue === proposedCompanionshipChoiceValue(choice)) {
        setSelectedChoiceValue('');
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {rememberState?.formError ? (
        <p className={surfaces.formError}>{rememberState.formError}</p>
      ) : null}
      {deleteError ? <p className={surfaces.formError}>{deleteError}</p> : null}
      {chooseError ? <p className={surfaces.formError}>{chooseError}</p> : null}

      <form
        key={rememberFormKey}
        action={rememberAction}
        className="flex flex-col gap-4 text-left"
      >
        <FindParticipantSelects
          key={rememberFormKey}
          members={members}
          couples={couples}
          accompaniedOptions={accompaniedOptions}
          proposalChoices={proposalChoices}
          initialAccompaniedKind={values.accompanied_kind}
          initialAccompaniedId={values.accompanied_id}
          initialCompanionKind={values.companion_kind}
          initialCompanionId={values.companion_id}
          fieldControlClassName={fieldControlClassName}
          dangerTextClassName={surfaces.dangerText}
          accompaniedError={rememberState?.fieldErrors?.accompanied_id}
          companionError={rememberState?.fieldErrors?.companion_id}
        />

        <div className="flex justify-end">
          <button type="submit" className={surfaces.primaryButton}>
            Zapamiętaj propozycję
          </button>
        </div>
      </form>

      <fieldset className="flex flex-col gap-3">
        <legend className={surfaces.headerText}>Lista propozycji Akompaniatora</legend>
        {proposalChoices.length === 0 ? (
          <p className={surfaces.mutedText}>
            Brak zapamiętanych propozycji dla wybranego akompaniowanego.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {proposalChoices.map((choice) => {
              const value = proposedCompanionshipChoiceValue(choice);
              return (
                <li
                  key={value}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 ${surfaces.choice(selectedChoiceValue === value)}`}
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="selected_proposal"
                      value={value}
                      checked={selectedChoiceValue === value}
                      onChange={() => {
                        setSelectedChoiceValue(value);
                        setChooseError(undefined);
                      }}
                    />
                    <span className={surfaces.strongText}>{choice.label}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeProposal(choice)}
                    disabled={isDeleting}
                    className={`text-sm font-medium ${surfaces.dangerText} underline-offset-4 hover:underline disabled:opacity-50`}
                  >
                    Usuń
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/app/companionships?tab=missing"
          className={surfaces.secondaryButton}
        >
          Anuluj
        </Link>
        <button
          type="button"
          onClick={chooseSelectedProposal}
          className={surfaces.primaryButton}
        >
          Wybierz Akompaniatora
        </button>
      </div>
    </div>
  );
}
