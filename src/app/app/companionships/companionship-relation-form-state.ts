import type { ZodIssue } from 'zod';
import type { CompanionshipParticipantOption } from '@/application/companionship-add-participant-options';
import type { CommunityMember } from '@/types/community-member';
import { messageRef, type MessageRef } from '@/i18n/translator';

export type CompanionshipParticipantKind = 'person' | 'couple';

export interface CompanionshipRelationFormValues {
  accompanied_kind: CompanionshipParticipantKind | '';
  accompanied_id: string;
  companion_kind: CompanionshipParticipantKind | '';
  companion_id: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export interface CompanionshipRelationFormState {
  values?: CompanionshipRelationFormValues;
  fieldErrors?: Partial<Record<keyof CompanionshipRelationFormValues, MessageRef>>;
  formError?: MessageRef;
  /** Unique per failed submit so the form remounts and keeps submitted selects visible. */
  restoreKey?: string;
}

export function companionshipRelationFormStateAfterFailedSubmit(
  state: Omit<CompanionshipRelationFormState, 'restoreKey'>
): CompanionshipRelationFormState {
  return {
    ...state,
    restoreKey: crypto.randomUUID(),
  };
}

/**
 * Options for one person select once the other participant is known.
 * No partner / partner without gender → everyone.
 * Partner with gender → same gender only; always keep the current selection visible
 * (e.g. after a gender validation error).
 */
export function companionshipSelectOptions(
  members: CommunityMember[],
  partner: Pick<CommunityMember, 'gender'> | undefined,
  selectedMemberId: string
): CommunityMember[] {
  if (partner?.gender == null) {
    return members;
  }
  return members.filter(
    (member) => member.id === selectedMemberId || member.gender === partner.gender
  );
}

/** Registry people who still appear on Missing Companionships (need a companion). */
export function communityMembersNeedingCompanion(
  members: CommunityMember[],
  peopleWithoutCompanion: ReadonlyArray<{ id: string }>
): CommunityMember[] {
  const ids = new Set(peopleWithoutCompanion.map((person) => person.id));
  return members.filter((member) => ids.has(member.id));
}

function companionshipParticipantKindFromForm(
  value: FormDataEntryValue | null
): CompanionshipParticipantKind | '' {
  if (value === 'person' || value === 'couple') {
    return value;
  }
  return '';
}

export function companionshipRelationFormValuesFromForm(
  formData: FormData
): CompanionshipRelationFormValues {
  return {
    accompanied_kind: companionshipParticipantKindFromForm(
      formData.get('accompanied_kind')
    ),
    accompanied_id: formData.get('accompanied_id')?.toString() ?? '',
    companion_kind: companionshipParticipantKindFromForm(
      formData.get('companion_kind')
    ),
    companion_id: formData.get('companion_id')?.toString() ?? '',
    start_date: formData.get('start_date')?.toString() ?? '',
    end_date: formData.get('end_date')?.toString() ?? '',
    notes: formData.get('notes')?.toString() ?? '',
  };
}

/**
 * Prefills Accompanied when the id matches a current accompanied option
 * (single person or eligible couple from Missing Companionships / Assign).
 */
export function newCompanionshipRelationFormValues(
  accompaniedId: string | undefined,
  accompaniedOptions: readonly CompanionshipParticipantOption[]
): CompanionshipRelationFormValues {
  const matchedOption =
    accompaniedId !== undefined
      ? accompaniedOptions.find((option) => option.id === accompaniedId)
      : undefined;

  return {
    accompanied_kind: matchedOption ? matchedOption.kind : '',
    accompanied_id: matchedOption ? matchedOption.id : '',
    companion_kind: '',
    companion_id: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    notes: '',
  };
}

/**
 * Prefills both participants for Add after Find Companion "choose".
 * Kinds and ids come from the handoff query (not only Missing options).
 */
export function fromFindCompanionshipRelationFormValues(input: {
  accompaniedKind: CompanionshipParticipantKind | '';
  accompaniedId: string;
  companionKind: CompanionshipParticipantKind | '';
  companionId: string;
}): CompanionshipRelationFormValues {
  return {
    accompanied_kind: input.accompaniedKind,
    accompanied_id: input.accompaniedId,
    companion_kind: input.companionKind,
    companion_id: input.companionId,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    notes: '',
  };
}

export function companionshipRelationWriteIssueMessages(
  issues: ZodIssue[]
): Partial<Record<keyof CompanionshipRelationFormValues, MessageRef>> {
  const fieldErrors: Partial<
    Record<keyof CompanionshipRelationFormValues, MessageRef>
  > = {};
  const fieldLabels: Record<keyof CompanionshipRelationFormValues, MessageRef> = {
    accompanied_kind: messageRef('companionshipForm.field.accompanied'),
    accompanied_id: messageRef('companionshipForm.field.accompanied'),
    companion_kind: messageRef('companionshipForm.field.companion'),
    companion_id: messageRef('companionshipForm.field.companion'),
    start_date: messageRef('companionshipForm.field.startDate'),
    end_date: messageRef('companionshipForm.field.endDate'),
    notes: messageRef('companionshipForm.field.notes'),
  };

  for (const issue of issues) {
    const field = issue.path[0] as keyof CompanionshipRelationFormValues;
    if (!field) continue;

    const values = { field: fieldLabels[field] ?? field };

    if (issue.code === 'invalid_type') {
      if (issue.received === 'undefined' || issue.received === 'null') {
        fieldErrors[field] = messageRef('validation.field.required', values);
      } else {
        fieldErrors[field] = messageRef('validation.field.wrongType', values);
      }
    } else if (issue.code === 'invalid_string') {
      if (issue.validation === 'uuid') {
        fieldErrors[field] =
          field === 'companion_id' || field === 'accompanied_id'
            ? messageRef('validation.field.needsChoice', values)
            : messageRef('validation.field.needsPersonChoice', values);
      } else if (issue.validation === 'regex') {
        fieldErrors[field] = messageRef('validation.field.needsDate', values);
      } else {
        fieldErrors[field] = messageRef('validation.field.badFormat', values);
      }
    } else if (issue.code === 'invalid_enum_value') {
      fieldErrors[field] = messageRef('validation.field.needsChoice', values);
    } else {
      fieldErrors[field] = messageRef('validation.field.hasError', {
        ...values,
        detail: issue.message,
      });
    }
  }

  return fieldErrors;
}
