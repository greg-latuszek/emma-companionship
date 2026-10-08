'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { companionshipRelationWriteSchema } from '@/schemas/companionship-relation';
import {
  addCompanionshipRelation,
  isCompanionAndAccompaniedAreSamePerson,
  isCompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/add-companionship-relation';
import {
  updateCompanionshipRelation,
  isCompanionshipRelationNotFound,
  isCompanionAndAccompaniedAreSamePerson as isCompanionAndAccompaniedAreSamePersonUpdate,
  isCompanionAndAccompaniedHaveDifferentGenders as isCompanionAndAccompaniedHaveDifferentGendersUpdate,
} from '@/application/update-companionship-relation';
import {
  deleteCompanionshipRelation,
  isCompanionshipRelationNotFound as isCompanionshipRelationNotFoundDelete,
} from '@/application/delete-companionship-relation';
import {
  companionshipRelationFormStateAfterFailedSubmit,
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
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(parsed.error.issues),
    });
  }

  try {
    await addCompanionshipRelation(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePerson(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany nie mogą być tą samą osobą.',
      });
    }

    if (isCompanionAndAccompaniedHaveDifferentGenders(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany muszą być tej samej płci.',
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: 'Nie udało się zapisać akompaniamentu. Spróbuj ponownie.',
    });
  }

  const returnTab = formData.get('return_tab')?.toString();
  redirect(
    returnTab === 'missing'
      ? '/app/companionships?tab=missing'
      : '/app/companionships'
  );
}

export async function submitEditCompanionshipRelation(
  relationId: string,
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);
  const parsed = companionshipRelationWriteSchema.safeParse(values);

  if (!parsed.success) {
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(parsed.error.issues),
    });
  }

  try {
    await updateCompanionshipRelation(relationId, parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePersonUpdate(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany nie mogą być tą samą osobą.',
      });
    }

    if (isCompanionAndAccompaniedHaveDifferentGendersUpdate(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany muszą być tej samej płci.',
      });
    }

    if (isCompanionshipRelationNotFound(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniament nie został znaleziony.',
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: 'Nie udało się zaktualizować akompaniamentu. Spróbuj ponownie.',
    });
  }

  redirect('/app/companionships');
}

export async function submitDeleteCompanionshipRelation(
  relationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteCompanionshipRelation(relationId);
    revalidatePath('/app/companionships');
    return { success: true };
  } catch (error) {
    if (isCompanionshipRelationNotFoundDelete(error)) {
      return {
        success: false,
        error: 'Akompaniament nie został znaleziony.',
      };
    }

    return {
      success: false,
      error: 'Nie udało się usunąć akompaniamentu. Spróbuj ponownie.',
    };
  }
}
