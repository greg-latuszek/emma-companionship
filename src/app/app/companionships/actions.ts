'use server';

import { redirect } from 'next/navigation';
import { companionshipRelationWriteSchema } from '@/schemas/companionship-relation';
import {
  addCompanionshipRelation,
  isCompanionAndAccompaniedAreSamePerson,
} from '@/application/add-companionship-relation';
import {
  companionshipRelationFormValuesFromForm,
  polishCompanionshipRelationWriteIssues,
  type CompanionshipRelationFormState,
} from './companionship-relation-form-state';

export async function submitNewCompanionshipRelation(
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);
  const parsed = companionshipRelationWriteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(parsed.error.issues),
    };
  }

  try {
    await addCompanionshipRelation(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePerson(error)) {
      return {
        values,
        formError: 'Akompaniujący i akompaniowany nie mogą być tą samą osobą.',
      };
    }

    return {
      values,
      formError: 'Nie udało się zapisać akompaniamentu. Spróbuj ponownie.',
    };
  }

  redirect('/app/companionships');
}
