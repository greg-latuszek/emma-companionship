'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { communityMemberWriteSchema } from '@/schemas/community-member';
import { coupleWriteSchema } from '@/schemas/couple';
import {
  addCommunityMember,
  isDuplicateCommunityMemberEmail,
} from '@/application/add-community-member';
import {
  addCouple,
  isCoupleParticipantsAreNotEligible,
  isHusbandAndWifeAreSamePerson,
} from '@/application/add-couple';
import {
  isCoupleNotFound,
  removeCouple,
} from '@/application/remove-couple';
import {
  isCommunityMemberNotFound,
  updateCommunityMember,
} from '@/application/update-community-member';
import {
  isCannotRemoveCommunityMemberLinkedToOtherData,
  isCannotRemoveCommunityMemberWhoCanSignIn,
  removeCommunityMember,
} from '@/application/remove-community-member';
import { MemberId } from '@/types/auth';
import {
  communityMemberFormValuesFromForm,
  polishCommunityMemberWriteIssues,
  type CommunityMemberFormState,
} from './community-member-form-state';

export async function submitNewCommunityMember(
  _previous: CommunityMemberFormState | undefined,
  formData: FormData
): Promise<CommunityMemberFormState> {
  const values = communityMemberFormValuesFromForm(formData);
  const parsed = communityMemberWriteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      values,
      fieldErrors: polishCommunityMemberWriteIssues(parsed.error.issues),
    };
  }

  try {
    await addCommunityMember(parsed.data);
  } catch (error) {
    if (isDuplicateCommunityMemberEmail(error)) {
      return {
        values,
        formError: 'Ten adres e-mail jest już w rejestrze.',
      };
    }

    return {
      values,
      formError: 'Nie udało się zapisać osoby. Spróbuj ponownie.',
    };
  }

  redirect('/app/members');
}

export async function submitCommunityMemberEdits(
  memberId: string,
  _previous: CommunityMemberFormState | undefined,
  formData: FormData
): Promise<CommunityMemberFormState> {
  const values = communityMemberFormValuesFromForm(formData);
  const parsed = communityMemberWriteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      values,
      fieldErrors: polishCommunityMemberWriteIssues(parsed.error.issues),
    };
  }

  try {
    await updateCommunityMember(MemberId(memberId), parsed.data);
  } catch (error) {
    if (isDuplicateCommunityMemberEmail(error)) {
      return {
        values,
        formError: 'Ten adres e-mail jest już w rejestrze.',
      };
    }

    if (isCommunityMemberNotFound(error)) {
      return {
        values,
        formError: 'Nie znaleziono tej osoby.',
      };
    }

    return {
      values,
      formError: 'Nie udało się zapisać osoby. Spróbuj ponownie.',
    };
  }

  redirect('/app/members');
}

export async function submitCommunityMemberRemoval(
  memberId: string,
  previous: { formError?: string } | undefined,
  formData: FormData
): Promise<{ formError?: string }> {
  void previous;
  void formData;

  try {
    await removeCommunityMember(MemberId(memberId));
  } catch (error) {
    if (isCannotRemoveCommunityMemberWhoCanSignIn(error)) {
      return {
        formError: 'Nie można usunąć osoby, która loguje się do aplikacji.',
      };
    }

    if (isCannotRemoveCommunityMemberLinkedToOtherData(error)) {
      return {
        formError: 'Nie można usunąć, bo osoba jest powiązana z innymi danymi.',
      };
    }

    if (isCommunityMemberNotFound(error)) {
      return {
        formError: 'Nie znaleziono tej osoby.',
      };
    }

    return {
      formError: 'Nie udało się usunąć osoby. Spróbuj ponownie.',
    };
  }

  redirect('/app/members');
}

export async function submitConfirmCouple(input: {
  husbandId: string;
  wifeId: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = coupleWriteSchema.safeParse({
    husband_id: input.husbandId,
    wife_id: input.wifeId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: 'Nieprawidłowe dane małżeństwa.',
    };
  }

  try {
    await addCouple(parsed.data);
    revalidatePath('/app/members');
    return { success: true };
  } catch (error) {
    if (isHusbandAndWifeAreSamePerson(error)) {
      return {
        success: false,
        error: 'Mąż i żona nie mogą być tą samą osobą.',
      };
    }

    if (isCoupleParticipantsAreNotEligible(error)) {
      return {
        success: false,
        error:
          'Nie można utworzyć małżeństwa — sprawdź płeć, stan cywilny i czy osoby nie są już w parze.',
      };
    }

    return {
      success: false,
      error: 'Nie udało się zapisać małżeństwa. Spróbuj ponownie.',
    };
  }
}

export async function submitDecoupleCouple(
  coupleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await removeCouple(coupleId);
    revalidatePath('/app/members');
    return { success: true };
  } catch (error) {
    if (isCoupleNotFound(error)) {
      return {
        success: false,
        error: 'Małżeństwo nie zostało znalezione.',
      };
    }

    return {
      success: false,
      error: 'Nie udało się rozłączyć małżeństwa. Spróbuj ponownie.',
    };
  }
}
