'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  companionshipRelationWriteSchema,
  coupleCompanionshipWriteSchema,
} from '@/schemas/companionship-relation';
import {
  addCompanionshipRelation,
  isCompanionAndAccompaniedAreSamePerson,
  isCompanionAndAccompaniedHaveDifferentGenders,
} from '@/application/add-companionship-relation';
import {
  addCoupleCompanionshipRelations,
  isCompanionAndAccompaniedAreSameCouple,
  isCoupleCompanionshipParticipantsAreNotEligible,
} from '@/application/add-couple-companionship-relations';
import {
  saveEditedCompanionshipRelation,
  isCompanionshipRelationNotFound,
  isCompanionAndAccompaniedAreSamePerson as isCompanionAndAccompaniedAreSamePersonUpdate,
  isCompanionAndAccompaniedHaveDifferentGenders as isCompanionAndAccompaniedHaveDifferentGendersUpdate,
} from '@/application/save-edited-companionship-relation';
import {
  saveEditedCoupleCompanionshipRelations,
  isCompanionAndAccompaniedAreSameCouple as isCompanionAndAccompaniedAreSameCoupleEdit,
  isCoupleCompanionshipParticipantsAreNotEligible as isCoupleCompanionshipParticipantsAreNotEligibleEdit,
  isCompanionshipRelationNotFound as isCompanionshipRelationNotFoundCoupleEdit,
} from '@/application/save-edited-couple-companionship-relations';
import {
  deleteCompanionshipRelation,
  isCompanionshipRelationNotFound as isCompanionshipRelationNotFoundDelete,
} from '@/application/delete-companionship-relation';
import {
  addProposedCompanionshipRelation,
  isCompanionAndAccompaniedAreSamePerson as isCompanionAndAccompaniedAreSamePersonProposed,
  isCompanionAndAccompaniedHaveDifferentGenders as isCompanionAndAccompaniedHaveDifferentGendersProposed,
  isProposedCompanionshipAlreadyExists,
} from '@/application/add-proposed-companionship-relation';
import {
  addProposedCoupleCompanionshipRelations,
  isCompanionAndAccompaniedAreSameCouple as isCompanionAndAccompaniedAreSameCoupleProposed,
  isCoupleCompanionshipParticipantsAreNotEligible as isCoupleCompanionshipParticipantsAreNotEligibleProposed,
} from '@/application/add-proposed-couple-companionship-relations';
import {
  deleteProposedCompanionshipRelation,
  deleteProposedCoupleCompanionshipRelations,
} from '@/application/delete-proposed-companionship-relation';
import {
  companionshipRelationFormStateAfterFailedSubmit,
  companionshipRelationFormValuesFromForm,
  polishCompanionshipRelationWriteIssues,
  type CompanionshipRelationFormState,
  type CompanionshipRelationFormValues,
} from './companionship-relation-form-state';
import { companionshipFindHref } from './companionship-find-form-state';

function redirectAfterNewCompanionship(formData: FormData): never {
  const returnTab = formData.get('return_tab')?.toString();
  redirect(
    returnTab === 'missing'
      ? '/app/companionships?tab=missing'
      : '/app/companionships'
  );
}

async function submitNewPersonCompanionshipRelation(
  values: CompanionshipRelationFormValues,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const parsed = companionshipRelationWriteSchema.safeParse({
    companion_id: values.companion_id,
    accompanied_id: values.accompanied_id,
    start_date: values.start_date,
    end_date: values.end_date,
    notes: values.notes,
  });

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

  return redirectAfterNewCompanionship(formData);
}

async function submitNewCoupleCompanionshipRelation(
  values: CompanionshipRelationFormValues,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const parsed = coupleCompanionshipWriteSchema.safeParse({
    companion_couple_id: values.companion_id,
    accompanied_couple_id: values.accompanied_id,
    start_date: values.start_date,
    end_date: values.end_date,
    notes: values.notes,
  });

  if (!parsed.success) {
    const remappedIssues = parsed.error.issues.map((issue) => {
      const path = [...issue.path];
      if (path[0] === 'companion_couple_id') {
        path[0] = 'companion_id';
      }
      if (path[0] === 'accompanied_couple_id') {
        path[0] = 'accompanied_id';
      }
      return { ...issue, path };
    });
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(remappedIssues),
    });
  }

  try {
    await addCoupleCompanionshipRelations(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSameCouple(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany nie mogą być tym samym małżeństwem.',
      });
    }

    if (isCoupleCompanionshipParticipantsAreNotEligible(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          'Wybrane małżeństwa nie mogą utworzyć akompaniamentu. Sprawdź, czy oboje małżonkowie akompaniowanego nadal czekają na akompaniatora.',
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: 'Nie udało się zapisać akompaniamentu. Spróbuj ponownie.',
    });
  }

  return redirectAfterNewCompanionship(formData);
}

export async function submitNewCompanionshipRelation(
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);

  if (values.accompanied_kind === 'couple' && values.companion_kind === 'couple') {
    return submitNewCoupleCompanionshipRelation(values, formData);
  }

  if (values.accompanied_kind === 'person' && values.companion_kind === 'person') {
    return submitNewPersonCompanionshipRelation(values, formData);
  }

  return companionshipRelationFormStateAfterFailedSubmit({
    values,
    formError:
      'Akompaniowany i akompaniator muszą być oboje osobami albo oboje małżeństwami.',
  });
}

async function submitEditPersonCompanionshipRelation(
  relationId: string,
  lockedAccompaniedId: string,
  values: CompanionshipRelationFormValues
): Promise<CompanionshipRelationFormState> {
  values.accompanied_id = lockedAccompaniedId;
  values.accompanied_kind = 'person';
  values.companion_kind = 'person';

  const parsed = companionshipRelationWriteSchema.safeParse({
    companion_id: values.companion_id,
    accompanied_id: values.accompanied_id,
    start_date: values.start_date,
    end_date: values.end_date,
    notes: values.notes,
  });

  if (!parsed.success) {
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(parsed.error.issues),
    });
  }

  try {
    await saveEditedCompanionshipRelation(relationId, parsed.data);
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

async function submitEditCoupleCompanionshipRelation(
  values: CompanionshipRelationFormValues,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const husbandRelationId =
    formData.get('husband_relation_id')?.toString() ?? '';
  const wifeRelationId = formData.get('wife_relation_id')?.toString() ?? '';

  const parsed = coupleCompanionshipWriteSchema.safeParse({
    companion_couple_id: values.companion_id,
    accompanied_couple_id: values.accompanied_id,
    start_date: values.start_date,
    end_date: values.end_date,
    notes: values.notes,
  });

  if (!parsed.success) {
    const remappedIssues = parsed.error.issues.map((issue) => {
      const path = [...issue.path];
      if (path[0] === 'companion_couple_id') {
        path[0] = 'companion_id';
      }
      if (path[0] === 'accompanied_couple_id') {
        path[0] = 'accompanied_id';
      }
      return { ...issue, path };
    });
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(remappedIssues),
    });
  }

  try {
    await saveEditedCoupleCompanionshipRelations(
      husbandRelationId,
      wifeRelationId,
      parsed.data
    );
  } catch (error) {
    if (isCompanionAndAccompaniedAreSameCoupleEdit(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          'Akompaniator i akompaniowany nie mogą być tym samym małżeństwem.',
      });
    }

    if (isCoupleCompanionshipParticipantsAreNotEligibleEdit(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          'Wybrane małżeństwa nie mogą zaktualizować akompaniamentu.',
      });
    }

    if (isCompanionshipRelationNotFoundCoupleEdit(error)) {
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

export async function submitEditCompanionshipRelation(
  relationId: string,
  lockedAccompaniedId: string,
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);

  if (values.accompanied_kind === 'couple' && values.companion_kind === 'couple') {
    return submitEditCoupleCompanionshipRelation(values, formData);
  }

  return submitEditPersonCompanionshipRelation(
    relationId,
    lockedAccompaniedId,
    values
  );
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

function redirectToFindCompanionship(accompaniedId: string): never {
  redirect(companionshipFindHref(accompaniedId));
}

async function submitRememberPersonProposedCompanionship(
  values: CompanionshipRelationFormValues
): Promise<CompanionshipRelationFormState> {
  const parsed = companionshipRelationWriteSchema.safeParse({
    companion_id: values.companion_id,
    accompanied_id: values.accompanied_id,
    start_date: null,
    end_date: null,
    notes: null,
  });

  if (!parsed.success) {
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(parsed.error.issues),
    });
  }

  try {
    await addProposedCompanionshipRelation(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePersonProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany nie mogą być tą samą osobą.',
      });
    }

    if (isCompanionAndAccompaniedHaveDifferentGendersProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Akompaniator i akompaniowany muszą być tej samej płci.',
      });
    }

    if (isProposedCompanionshipAlreadyExists(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Ta propozycja akompaniatora jest już zapamiętana.',
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: 'Nie udało się zapamiętać propozycji. Spróbuj ponownie.',
    });
  }

  return redirectToFindCompanionship(values.accompanied_id);
}

async function submitRememberCoupleProposedCompanionship(
  values: CompanionshipRelationFormValues
): Promise<CompanionshipRelationFormState> {
  const parsed = coupleCompanionshipWriteSchema.safeParse({
    companion_couple_id: values.companion_id,
    accompanied_couple_id: values.accompanied_id,
    start_date: null,
    end_date: null,
    notes: null,
  });

  if (!parsed.success) {
    const remappedIssues = parsed.error.issues.map((issue) => {
      const path = [...issue.path];
      if (path[0] === 'companion_couple_id') {
        path[0] = 'companion_id';
      }
      if (path[0] === 'accompanied_couple_id') {
        path[0] = 'accompanied_id';
      }
      return { ...issue, path };
    });
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      fieldErrors: polishCompanionshipRelationWriteIssues(remappedIssues),
    });
  }

  try {
    await addProposedCoupleCompanionshipRelations(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSameCoupleProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          'Akompaniator i akompaniowany nie mogą być tym samym małżeństwem.',
      });
    }

    if (isCoupleCompanionshipParticipantsAreNotEligibleProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          'Wybrane małżeństwa nie mogą utworzyć propozycji akompaniamentu.',
      });
    }

    if (isProposedCompanionshipAlreadyExists(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: 'Ta propozycja akompaniatora jest już zapamiętana.',
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: 'Nie udało się zapamiętać propozycji. Spróbuj ponownie.',
    });
  }

  return redirectToFindCompanionship(values.accompanied_id);
}

export async function submitRememberProposedCompanionship(
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);

  if (values.accompanied_kind === 'couple' && values.companion_kind === 'couple') {
    return submitRememberCoupleProposedCompanionship(values);
  }

  if (values.accompanied_kind === 'person' && values.companion_kind === 'person') {
    return submitRememberPersonProposedCompanionship(values);
  }

  return companionshipRelationFormStateAfterFailedSubmit({
    values,
    formError:
      'Akompaniowany i proponowany akompaniator muszą być oboje osobami albo oboje małżeństwami.',
  });
}

export async function submitDeleteProposedCompanionship(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const proposalKind = formData.get('proposal_kind')?.toString();

  try {
    if (proposalKind === 'person') {
      const proposalId = formData.get('proposal_id')?.toString() ?? '';
      await deleteProposedCompanionshipRelation(proposalId);
    } else if (proposalKind === 'couple') {
      const husbandProposalId =
        formData.get('husband_proposal_id')?.toString() ?? '';
      const wifeProposalId = formData.get('wife_proposal_id')?.toString() ?? '';
      await deleteProposedCoupleCompanionshipRelations(
        husbandProposalId,
        wifeProposalId
      );
    } else {
      return {
        success: false,
        error: 'Nie udało się usunąć propozycji. Spróbuj ponownie.',
      };
    }
  } catch {
    return {
      success: false,
      error: 'Nie udało się usunąć propozycji. Spróbuj ponownie.',
    };
  }

  revalidatePath('/app/companionships');
  return { success: true };
}
