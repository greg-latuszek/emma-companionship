import type { CompanionshipParticipantOption } from '@/application/companionship-add-participant-options';
import type { ProposedCompanionshipChoice } from '@/application/group-proposed-companionship-choices';
import {
  companionshipRelationFormStateAfterFailedSubmit,
  companionshipRelationFormValuesFromForm,
  newCompanionshipRelationFormValues,
  type CompanionshipParticipantKind,
  type CompanionshipRelationFormState,
  type CompanionshipRelationFormValues,
} from './companionship-relation-form-state';

export type CompanionshipFindFormValues = Pick<
  CompanionshipRelationFormValues,
  'accompanied_kind' | 'accompanied_id' | 'companion_kind' | 'companion_id'
>;

export type CompanionshipFindFormState = CompanionshipRelationFormState;

export {
  companionshipRelationFormStateAfterFailedSubmit as companionshipFindFormStateAfterFailedSubmit,
  companionshipRelationFormValuesFromForm,
};

export function newCompanionshipFindFormValues(
  accompaniedId: string | undefined,
  accompaniedOptions: readonly CompanionshipParticipantOption[]
): CompanionshipFindFormValues {
  const seeded = newCompanionshipRelationFormValues(
    accompaniedId,
    accompaniedOptions
  );
  return {
    accompanied_kind: seeded.accompanied_kind,
    accompanied_id: seeded.accompanied_id,
    companion_kind: '',
    companion_id: '',
  };
}

export function companionshipFindHref(accompaniedId?: string): string {
  if (accompaniedId) {
    return `/app/companionships?tab=find&accompanied=${accompaniedId}`;
  }
  return '/app/companionships?tab=find';
}

export function companionshipFindChangeHref(relationId: string): string {
  return `/app/companionships?tab=find&change=${relationId}`;
}

/** Prefer change-companion entry so Accompanied stays locked after Remember. */
export function companionshipFindReturnHref(input: {
  accompaniedId?: string;
  changeRelationId?: string;
}): string {
  if (input.changeRelationId) {
    return companionshipFindChangeHref(input.changeRelationId);
  }
  return companionshipFindHref(input.accompaniedId);
}

export function companionshipChooseFromFindHref(input: {
  accompaniedKind: CompanionshipParticipantKind;
  accompaniedId: string;
  companionKind: CompanionshipParticipantKind;
  companionId: string;
  proposalId?: string;
  husbandProposalId?: string;
  wifeProposalId?: string;
  changeRelationId?: string;
}): string {
  const params = new URLSearchParams({
    tab: 'new',
    from: 'find',
    accompanied_kind: input.accompaniedKind,
    accompanied: input.accompaniedId,
    companion_kind: input.companionKind,
    companion: input.companionId,
  });
  if (input.proposalId) {
    params.set('proposal', input.proposalId);
  }
  if (input.husbandProposalId) {
    params.set('proposal_husband', input.husbandProposalId);
  }
  if (input.wifeProposalId) {
    params.set('proposal_wife', input.wifeProposalId);
  }
  if (input.changeRelationId) {
    params.set('change', input.changeRelationId);
  }
  return `/app/companionships?${params.toString()}`;
}

export function proposedCompanionshipChoiceValue(
  choice: ProposedCompanionshipChoice
): string {
  if (choice.kind === 'person') {
    return `person:${choice.relationId}`;
  }
  return `couple:${choice.husbandRelationId}:${choice.wifeRelationId}`;
}

export function proposedCompanionshipChoiceFromValue(
  value: string,
  choices: readonly ProposedCompanionshipChoice[]
): ProposedCompanionshipChoice | undefined {
  return choices.find(
    (choice) => proposedCompanionshipChoiceValue(choice) === value
  );
}
