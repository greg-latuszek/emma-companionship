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
  activateProposedCompanionshipRelation,
  activateProposedCoupleCompanionshipRelations,
} from '@/application/activate-proposed-companionship-relation';
import {
  companionshipRelationFormStateAfterFailedSubmit,
  companionshipRelationFormValuesFromForm,
  companionshipRelationWriteIssueMessages,
  type CompanionshipRelationFormState,
  type CompanionshipRelationFormValues,
} from './companionship-relation-form-state';
import { companionshipFindReturnHref } from './companionship-find-form-state';
import { messageRef, type MessageRef } from '@/i18n/translator';

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
      fieldErrors: companionshipRelationWriteIssueMessages(parsed.error.issues),
    });
  }

  try {
    await addCompanionshipRelation(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePerson(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.samePerson'),
      });
    }

    if (isCompanionAndAccompaniedHaveDifferentGenders(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.differentGenders'),
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: messageRef('companionshipError.saveFailed'),
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
      fieldErrors: companionshipRelationWriteIssueMessages(remappedIssues),
    });
  }

  try {
    await addCoupleCompanionshipRelations(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSameCouple(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.sameCouple'),
      });
    }

    if (isCoupleCompanionshipParticipantsAreNotEligible(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          messageRef('companionshipError.coupleNotEligibleToCreate'),
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: messageRef('companionshipError.saveFailed'),
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
      messageRef('companionshipError.mixedKinds'),
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
      fieldErrors: companionshipRelationWriteIssueMessages(parsed.error.issues),
    });
  }

  try {
    await saveEditedCompanionshipRelation(relationId, parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePersonUpdate(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.samePerson'),
      });
    }

    if (isCompanionAndAccompaniedHaveDifferentGendersUpdate(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.differentGenders'),
      });
    }

    if (isCompanionshipRelationNotFound(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.notFound'),
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: messageRef('companionshipError.updateFailed'),
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
      fieldErrors: companionshipRelationWriteIssueMessages(remappedIssues),
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
          messageRef('companionshipError.sameCouple'),
      });
    }

    if (isCoupleCompanionshipParticipantsAreNotEligibleEdit(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          messageRef('companionshipError.coupleNotEligibleToUpdate'),
      });
    }

    if (isCompanionshipRelationNotFoundCoupleEdit(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.notFound'),
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: messageRef('companionshipError.updateFailed'),
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
): Promise<{ success: boolean; error?: MessageRef }> {
  try {
    await deleteCompanionshipRelation(relationId);
    revalidatePath('/app/companionships');
    return { success: true };
  } catch (error) {
    if (isCompanionshipRelationNotFoundDelete(error)) {
      return {
        success: false,
        error: messageRef('companionshipError.notFound'),
      };
    }

    return {
      success: false,
      error: messageRef('companionshipError.deleteFailed'),
    };
  }
}

function redirectToFindCompanionship(input: {
  accompaniedId: string;
  changeRelationId?: string;
}): never {
  redirect(
    companionshipFindReturnHref({
      accompaniedId: input.accompaniedId,
      changeRelationId: input.changeRelationId,
    })
  );
}

async function submitRememberPersonProposedCompanionship(
  values: CompanionshipRelationFormValues,
  changeRelationId?: string
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
      fieldErrors: companionshipRelationWriteIssueMessages(parsed.error.issues),
    });
  }

  try {
    await addProposedCompanionshipRelation(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSamePersonProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.samePerson'),
      });
    }

    if (isCompanionAndAccompaniedHaveDifferentGendersProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.differentGenders'),
      });
    }

    if (isProposedCompanionshipAlreadyExists(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.proposalAlreadyRemembered'),
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: messageRef('companionshipError.proposalSaveFailed'),
    });
  }

  return redirectToFindCompanionship({
    accompaniedId: values.accompanied_id,
    changeRelationId,
  });
}

async function submitRememberCoupleProposedCompanionship(
  values: CompanionshipRelationFormValues,
  changeRelationId?: string
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
      fieldErrors: companionshipRelationWriteIssueMessages(remappedIssues),
    });
  }

  try {
    await addProposedCoupleCompanionshipRelations(parsed.data);
  } catch (error) {
    if (isCompanionAndAccompaniedAreSameCoupleProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          messageRef('companionshipError.sameCouple'),
      });
    }

    if (isCoupleCompanionshipParticipantsAreNotEligibleProposed(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          messageRef('companionshipError.proposalCoupleNotEligible'),
      });
    }

    if (isProposedCompanionshipAlreadyExists(error)) {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError: messageRef('companionshipError.proposalAlreadyRemembered'),
      });
    }

    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError: messageRef('companionshipError.proposalSaveFailed'),
    });
  }

  return redirectToFindCompanionship({
    accompaniedId: values.accompanied_id,
    changeRelationId,
  });
}

export async function submitRememberProposedCompanionship(
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);
  const changeRelationId = formData.get('change')?.toString() || undefined;

  if (values.accompanied_kind === 'couple' && values.companion_kind === 'couple') {
    return submitRememberCoupleProposedCompanionship(values, changeRelationId);
  }

  if (values.accompanied_kind === 'person' && values.companion_kind === 'person') {
    return submitRememberPersonProposedCompanionship(values, changeRelationId);
  }

  return companionshipRelationFormStateAfterFailedSubmit({
    values,
    formError:
      messageRef('companionshipError.proposalMixedKinds'),
  });
}

export async function submitDeleteProposedCompanionship(
  formData: FormData
): Promise<{ success: boolean; error?: MessageRef }> {
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
        error: messageRef('companionshipError.proposalDeleteFailed'),
      };
    }
  } catch {
    return {
      success: false,
      error: messageRef('companionshipError.proposalDeleteFailed'),
    };
  }

  revalidatePath('/app/companionships');
  return { success: true };
}

export async function submitActivateProposedCompanionshipFromFind(
  _previous: CompanionshipRelationFormState | undefined,
  formData: FormData
): Promise<CompanionshipRelationFormState> {
  const values = companionshipRelationFormValuesFromForm(formData);
  const proposalId = formData.get('proposal')?.toString() ?? '';
  const husbandProposalId = formData.get('proposal_husband')?.toString() ?? '';
  const wifeProposalId = formData.get('proposal_wife')?.toString() ?? '';
  const activation = {
    start_date: values.start_date.trim() === '' ? null : values.start_date,
    notes: values.notes.trim() === '' ? null : values.notes,
  };

  try {
    if (
      values.accompanied_kind === 'couple' &&
      values.companion_kind === 'couple'
    ) {
      if (!husbandProposalId || !wifeProposalId) {
        return companionshipRelationFormStateAfterFailedSubmit({
          values,
          formError: messageRef('companionshipError.proposalMissing'),
        });
      }
      await activateProposedCoupleCompanionshipRelations(
        husbandProposalId,
        wifeProposalId,
        activation
      );
    } else if (
      values.accompanied_kind === 'person' &&
      values.companion_kind === 'person'
    ) {
      if (!proposalId) {
        return companionshipRelationFormStateAfterFailedSubmit({
          values,
          formError: messageRef('companionshipError.proposalMissing'),
        });
      }
      await activateProposedCompanionshipRelation(proposalId, activation);
    } else {
      return companionshipRelationFormStateAfterFailedSubmit({
        values,
        formError:
          messageRef('companionshipError.mixedKinds'),
      });
    }
  } catch {
    return companionshipRelationFormStateAfterFailedSubmit({
      values,
      formError:
        messageRef('companionshipError.proposalActivateFailed'),
    });
  }

  revalidatePath('/app/companionships');
  redirect('/app/companionships');
}
