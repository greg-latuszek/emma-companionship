'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { companionshipRelationWriteSchema } from '@/schemas/companionship-relation';
import {
  addCompanionshipRelation,
  isCompanionAndAccompaniedAreSamePerson,
} from '@/application/add-companionship-relation';
import {
  updateCompanionshipRelation,
  isCompanionshipRelationNotFound,
  isCompanionAndAccompaniedAreSamePerson as isCompanionAndAccompaniedAreSamePersonUpdate,
} from '@/application/update-companionship-relation';
import {
  deleteCompanionshipRelation,
  isCompanionshipRelationNotFound as isCompanionshipRelationNotFoundDelete,
} from '@/application/delete-companionship-relation';
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
        formError: 'Akompaniator i akompaniowany nie mogą być tą samą osobą.',
      };
    }

    return {
      values,
      formError: 'Nie udało się zapisać akompaniamentu. Spróbuj ponownie.',
    };
  }

  redirect('/app/companionships');
}

export async function submitEditCompanionshipRelation(
  relationId: string,
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
    await updateCompanionshipRelation(relationId, parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePersonUpdate(error)) {
      return {
        values,
        formError: 'Akompaniator i akompaniowany nie mogą być tą samą osobą.',
      };
    }

    if (isCompanionshipRelationNotFound(error)) {
      return {
        values,
        formError: 'Akompaniament nie został znaleziony.',
      };
    }

    return {
      values,
      formError: 'Nie udało się zaktualizować akompaniamentu. Spróbuj ponownie.',
    };
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
