'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
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
  companionshipFindDetailPeople,
  companionshipFindParticipantFieldText,
  companionshipFindVisibleFieldLabels,
  companionshipFindVisibleFields,
  defaultCompanionshipFindVisibleFields,
  readCompanionshipFindDetailFoldOpen,
  readStoredCompanionshipFindVisibleFields,
  storeCompanionshipFindDetailFoldOpen,
  storeCompanionshipFindVisibleFields,
  toggleCompanionshipFindVisibleField,
  type CompanionshipFindVisibleField,
} from './companionship-find-visible-fields';
import {
  submitDeleteProposedCompanionship,
  submitRememberProposedCompanionship,
} from './actions';
import { useTranslate } from '@/i18n/LocaleProvider';
import { messageRef, type MessageKey, type MessageRef } from '@/i18n/translator';

const selectOptionClassName = 'bg-white text-gray-900';

function companionshipParticipantOptionFromProposalChoice(
  choice: ProposedCompanionshipChoice
): CompanionshipParticipantOption {
  if (choice.kind === 'person') {
    return {
      kind: 'person',
      id: choice.companionId,
      label: choice.label,
      gender: null,
    };
  }
  return {
    kind: 'couple',
    id: choice.companionCoupleId,
    label: choice.label,
  };
}

function FieldError({
  message,
  className,
}: {
  message?: MessageRef;
  className: string;
}): JSX.Element | null {
  const translate = useTranslate();
  if (!message) {
    return null;
  }
  return <p className={`text-sm ${className}`}>{translate(message)}</p>;
}

function CompanionshipFindDetailFold({
  foldKey,
  titleKey,
  member,
  visibleFields,
  mutedTextClassName,
  strongTextClassName,
}: {
  foldKey: string;
  titleKey: MessageKey;
  member: CommunityMember;
  visibleFields: CompanionshipFindVisibleField[];
  mutedTextClassName: string;
  strongTextClassName: string;
}): JSX.Element {
  const translate = useTranslate();
  const [open, setOpen] = useState(() =>
    typeof window === 'undefined'
      ? true
      : readCompanionshipFindDetailFoldOpen(foldKey, window.localStorage)
  );

  useEffect(() => {
    setOpen(readCompanionshipFindDetailFoldOpen(foldKey, window.localStorage));
  }, [foldKey]);

  return (
    <details
      open={open}
      onToggle={(event) => {
        const nextOpen = event.currentTarget.open;
        setOpen(nextOpen);
        storeCompanionshipFindDetailFoldOpen(
          foldKey,
          nextOpen,
          window.localStorage
        );
      }}
      className="text-sm"
    >
      <summary className={`cursor-pointer select-none ${mutedTextClassName}`}>
        {translate(titleKey)}
      </summary>
      <div className="mt-2 flex flex-col gap-1 pl-1">
        {visibleFields.map((field) => (
          <p key={field} className={mutedTextClassName}>
            <span className={strongTextClassName}>
              {companionshipFindVisibleFieldLabels[field]}:{' '}
            </span>
            {companionshipFindParticipantFieldText(member, field)}
          </p>
        ))}
      </div>
    </details>
  );
}

function CompanionshipFindParticipantDetails({
  option,
  members,
  couples,
  visibleFields,
  mutedTextClassName,
  strongTextClassName,
}: {
  option: CompanionshipParticipantOption | undefined;
  members: CommunityMember[];
  couples: CoupleListItem[];
  visibleFields: CompanionshipFindVisibleField[];
  mutedTextClassName: string;
  strongTextClassName: string;
}): JSX.Element | null {
  const detailPeople = companionshipFindDetailPeople(
    option,
    members,
    couples
  );
  if (detailPeople.length === 0 || visibleFields.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {detailPeople.map(({ titleKey, member }) => (
        <CompanionshipFindDetailFold
          key={member.id}
          foldKey={member.id}
          titleKey={titleKey}
          member={member}
          visibleFields={visibleFields}
          mutedTextClassName={mutedTextClassName}
          strongTextClassName={strongTextClassName}
        />
      ))}
    </div>
  );
}

function FindParticipantSelects({
  members,
  couples,
  accompaniedOptions,
  proposalChoices,
  lockedAccompanied,
  currentCompanionLabel,
  visibleFields,
  initialAccompaniedKind,
  initialAccompaniedId,
  initialCompanionKind,
  initialCompanionId,
  fieldControlClassName,
  dangerTextClassName,
  mutedTextClassName,
  strongTextClassName,
  accompaniedError,
  companionError,
}: {
  members: CommunityMember[];
  couples: CoupleListItem[];
  accompaniedOptions: CompanionshipParticipantOption[];
  proposalChoices: ProposedCompanionshipChoice[];
  lockedAccompanied?: CompanionshipParticipantOption;
  currentCompanionLabel?: string;
  visibleFields: CompanionshipFindVisibleField[];
  initialAccompaniedKind: CompanionshipParticipantKind | '';
  initialAccompaniedId: string;
  initialCompanionKind: CompanionshipParticipantKind | '';
  initialCompanionId: string;
  fieldControlClassName: string;
  dangerTextClassName: string;
  mutedTextClassName: string;
  strongTextClassName: string;
  accompaniedError?: MessageRef;
  companionError?: MessageRef;
}): JSX.Element {
  const translate = useTranslate();
  const router = useRouter();
  const [accompaniedId, setAccompaniedId] = useState(
    lockedAccompanied?.id ?? initialAccompaniedId
  );
  const [accompaniedKind, setAccompaniedKind] = useState<
    CompanionshipParticipantKind | ''
  >(lockedAccompanied?.kind ?? initialAccompaniedKind);
  const [companionId, setCompanionId] = useState(initialCompanionId);
  const [companionKind, setCompanionKind] = useState<
    CompanionshipParticipantKind | ''
  >(initialCompanionKind);

  const accompanied =
    lockedAccompanied ??
    findAccompaniedCompanionshipOption(accompaniedOptions, accompaniedId);
  const proposedCompanion =
    companionId === ''
      ? undefined
      : proposeCompanionCompanionshipOptions(
          accompanied,
          members,
          couples,
          companionId
        ).find((option) => option.id === companionId);
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
    accompanied?.kind === 'couple'
        ? translate('common.chooseCouple')
        : translate('common.choosePerson');

  return (
    <>
      <input type="hidden" name="accompanied_kind" value={accompaniedKind} />
      <input type="hidden" name="companion_kind" value={companionKind} />

      <label className="flex flex-col gap-1">
        <span>{translate('companionship.field.accompanied')}</span>
        {lockedAccompanied ? (
          <>
            <input type="hidden" name="accompanied_id" value={lockedAccompanied.id} />
            <p className={fieldControlClassName}>{lockedAccompanied.label}</p>
          </>
        ) : (
          <select
            name="accompanied_id"
            value={accompaniedId}
            onChange={(event) => chooseAccompanied(event.target.value)}
            className={fieldControlClassName}
            required
          >
            <option value="" className={selectOptionClassName}>
              {translate('common.choose')}
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
        )}
        <FieldError message={accompaniedError} className={dangerTextClassName} />
      </label>

      <CompanionshipFindParticipantDetails
        option={accompanied}
        members={members}
        couples={couples}
        visibleFields={visibleFields}
        mutedTextClassName={mutedTextClassName}
        strongTextClassName={strongTextClassName}
      />

      {currentCompanionLabel ? (
        <label className="flex flex-col gap-1">
          <span>{translate('companionships.find.currentCompanion')}</span>
          <p className={fieldControlClassName}>{currentCompanionLabel}</p>
        </label>
      ) : null}

      <label className="flex flex-col gap-1">
        <span>{translate('companionships.find.proposedCompanion')}</span>
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

      <CompanionshipFindParticipantDetails
        option={proposedCompanion}
        members={members}
        couples={couples}
        visibleFields={visibleFields}
        mutedTextClassName={mutedTextClassName}
        strongTextClassName={strongTextClassName}
      />
    </>
  );
}

export function CompanionshipFindForm({
  members,
  couples,
  accompaniedOptions,
  proposalChoices,
  initialValues,
  lockedAccompanied,
  changeRelationId,
  currentCompanionLabel,
}: {
  members: CommunityMember[];
  couples: CoupleListItem[];
  accompaniedOptions: CompanionshipParticipantOption[];
  proposalChoices: ProposedCompanionshipChoice[];
  initialValues: CompanionshipFindFormValues;
  /** Change-companion entry: Accompanied is fixed to the active relation's person/couple. */
  lockedAccompanied?: CompanionshipParticipantOption;
  /** Active relation id from Created Companionships "change" entry. */
  changeRelationId?: string;
  /** Change-companion entry: current Companion shown after Accompanied details. */
  currentCompanionLabel?: string;
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
  const translate = useTranslate();
  const fieldControlClassName = surfaces.field;
  const rememberFormKey = rememberState?.restoreKey ?? 'pristine';

  const [selectedChoiceValue, setSelectedChoiceValue] = useState('');
  const [chooseError, setChooseError] = useState<MessageRef | undefined>();
  const [deleteError, setDeleteError] = useState<MessageRef | undefined>();
  const [isDeleting, startDelete] = useTransition();
  const [visibleFields, setVisibleFields] = useState<
    CompanionshipFindVisibleField[]
  >(defaultCompanionshipFindVisibleFields);

  useEffect(() => {
    setVisibleFields(
      readStoredCompanionshipFindVisibleFields(window.localStorage)
    );
  }, []);

  const accompanied =
    lockedAccompanied ??
    findAccompaniedCompanionshipOption(accompaniedOptions, values.accompanied_id);

  function chooseSelectedProposal(): void {
    const choice = proposedCompanionshipChoiceFromValue(
      selectedChoiceValue,
      proposalChoices
    );
    if (!choice || !accompanied) {
      setChooseError(messageRef('companionships.find.chooseFromList'));
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
          changeRelationId,
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
          changeRelationId,
        })
      );
      return;
    }

    setChooseError(messageRef('companionships.find.chooseFromList'));
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
        setDeleteError(result.error ?? messageRef('companionshipError.proposalDeleteFailed'));
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
        <p className={surfaces.formError}>{translate(rememberState.formError)}</p>
      ) : null}
      {deleteError ? <p className={surfaces.formError}>{translate(deleteError)}</p> : null}
      {chooseError ? <p className={surfaces.formError}>{translate(chooseError)}</p> : null}

      <details className="text-sm">
        <summary className={`cursor-pointer select-none ${surfaces.secondaryText}`}>
          {translate('common.visibleFields')}
        </summary>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 pl-1">
          {companionshipFindVisibleFields.map((field) => (
            <label key={field} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visibleFields.includes(field)}
                onChange={() => {
                  setVisibleFields((current) => {
                    const next = toggleCompanionshipFindVisibleField(
                      current,
                      field
                    );
                    storeCompanionshipFindVisibleFields(
                      next,
                      window.localStorage
                    );
                    return next;
                  });
                }}
              />
              <span>{companionshipFindVisibleFieldLabels[field]}</span>
            </label>
          ))}
        </div>
      </details>

      <form
        key={rememberFormKey}
        action={rememberAction}
        className="flex flex-col gap-4 text-left"
      >
        {changeRelationId ? (
          <input type="hidden" name="change" value={changeRelationId} />
        ) : null}
        <FindParticipantSelects
          key={rememberFormKey}
          members={members}
          couples={couples}
          accompaniedOptions={accompaniedOptions}
          proposalChoices={proposalChoices}
          lockedAccompanied={lockedAccompanied}
          currentCompanionLabel={currentCompanionLabel}
          visibleFields={visibleFields}
          initialAccompaniedKind={values.accompanied_kind}
          initialAccompaniedId={values.accompanied_id}
          initialCompanionKind={values.companion_kind}
          initialCompanionId={values.companion_id}
          fieldControlClassName={fieldControlClassName}
          dangerTextClassName={surfaces.dangerText}
          mutedTextClassName={surfaces.secondaryText}
          strongTextClassName={surfaces.strongText}
          accompaniedError={rememberState?.fieldErrors?.accompanied_id}
          companionError={rememberState?.fieldErrors?.companion_id}
        />

        <div className="flex justify-end">
          <button type="submit" className={surfaces.primaryButton}>
            {translate('companionships.find.remember')}
          </button>
        </div>
      </form>

      <fieldset className="flex flex-col gap-3">
        <legend className={surfaces.headerText}>
          {translate('companionships.find.proposalList')}
        </legend>
        {proposalChoices.length === 0 ? (
          <p className={surfaces.mutedText}>
            {translate('companionships.find.proposalListEmpty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {proposalChoices.map((choice) => {
              const value = proposedCompanionshipChoiceValue(choice);
              return (
                <li key={value} className="flex flex-col gap-2">
                  <div
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
                      {translate('common.delete')}
                    </button>
                  </div>
                  <CompanionshipFindParticipantDetails
                    option={companionshipParticipantOptionFromProposalChoice(
                      choice
                    )}
                    members={members}
                    couples={couples}
                    visibleFields={visibleFields}
                    mutedTextClassName={surfaces.secondaryText}
                    strongTextClassName={surfaces.strongText}
                  />
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
          {translate('common.cancel')}
        </Link>
        <button
          type="button"
          onClick={chooseSelectedProposal}
          className={surfaces.primaryButton}
        >
          {translate('companionships.find.choose')}
        </button>
      </div>
    </div>
  );
}
