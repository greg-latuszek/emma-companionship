import type { ZodIssue } from 'zod';

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
