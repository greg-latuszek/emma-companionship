import type { ZodIssue } from 'zod';
import type { CommunityMember } from '@/types/community-member';

export interface CompanionshipRelationFormValues {
  companion_id: string;
  accompanied_id: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export interface CompanionshipRelationFormState {
  values?: CompanionshipRelationFormValues;
  fieldErrors?: Partial<Record<keyof CompanionshipRelationFormValues, string>>;
  formError?: string;
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

export function companionshipRelationFormValuesFromForm(
  formData: FormData
): CompanionshipRelationFormValues {
  return {
    companion_id: formData.get('companion_id')?.toString() ?? '',
    accompanied_id: formData.get('accompanied_id')?.toString() ?? '',
    start_date: formData.get('start_date')?.toString() ?? '',
    end_date: formData.get('end_date')?.toString() ?? '',
    notes: formData.get('notes')?.toString() ?? '',
  };
}

export function newCompanionshipRelationFormValues(
  accompaniedId: string | undefined,
  members: CommunityMember[]
): CompanionshipRelationFormValues {
  const isKnown =
    accompaniedId !== undefined && members.some((m) => m.id === accompaniedId);
  return {
    companion_id: '',
    accompanied_id: isKnown ? accompaniedId : '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    notes: '',
  };
}

export function polishCompanionshipRelationWriteIssues(
  issues: ZodIssue[]
): Partial<Record<keyof CompanionshipRelationFormValues, string>> {
  const fieldErrors: Partial<Record<keyof CompanionshipRelationFormValues, string>> = {};
  const fieldLabels: Record<keyof CompanionshipRelationFormValues, string> = {
    companion_id: 'Akompaniator',
    accompanied_id: 'Akompaniowany',
    start_date: 'Data rozpoczęcia',
    end_date: 'Data zakończenia',
    notes: 'Notatki',
  };

  for (const issue of issues) {
    const field = issue.path[0] as keyof CompanionshipRelationFormValues;
    if (!field) continue;

    const label = fieldLabels[field] ?? field;

    if (issue.code === 'invalid_type') {
      if (issue.received === 'undefined' || issue.received === 'null') {
        fieldErrors[field] = `Pole "${label}" jest wymagane.`;
      } else {
        fieldErrors[field] = `Pole "${label}" ma nieprawidłowy typ.`;
      }
    } else if (issue.code === 'invalid_string') {
      if (issue.validation === 'uuid') {
        fieldErrors[field] = `Pole "${label}" wymaga wyboru osoby.`;
      } else if (issue.validation === 'regex') {
        fieldErrors[field] = `Pole "${label}" wymaga daty w formacie RRRR-MM-DD.`;
      } else {
        fieldErrors[field] = `Pole "${label}" ma nieprawidłowy format.`;
      }
    } else {
      fieldErrors[field] = `Pole "${label}" zawiera błąd: ${issue.message}`;
    }
  }

  return fieldErrors;
}
