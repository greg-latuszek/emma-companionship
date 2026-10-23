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
import { messageRef, type MessageRef } from '@/i18n/translator';
import {
  communityMemberFormValuesFromForm,
  communityMemberWriteIssueMessages,
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
      fieldErrors: communityMemberWriteIssueMessages(parsed.error.issues),
    };
  }

  try {
    await addCommunityMember(parsed.data);
  } catch (error) {
    if (isDuplicateCommunityMemberEmail(error)) {
      return {
        values,
        formError: messageRef('memberError.duplicateEmail'),
      };
    }

    return {
      values,
      formError: messageRef('memberError.saveFailed'),
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
      fieldErrors: communityMemberWriteIssueMessages(parsed.error.issues),
    };
  }

  try {
    await updateCommunityMember(MemberId(memberId), parsed.data);
  } catch (error) {
    if (isDuplicateCommunityMemberEmail(error)) {
      return {
        values,
        formError: messageRef('memberError.duplicateEmail'),
      };
    }

    if (isCommunityMemberNotFound(error)) {
      return {
        values,
        formError: messageRef('memberError.notFound'),
      };
    }

    return {
      values,
      formError: messageRef('memberError.saveFailed'),
    };
  }

  redirect('/app/members');
}

export async function submitCommunityMemberRemoval(
  memberId: string,
  previous: { formError?: MessageRef } | undefined,
  formData: FormData
): Promise<{ formError?: MessageRef }> {
  void previous;
  void formData;

  try {
    await removeCommunityMember(MemberId(memberId));
  } catch (error) {
    if (isCannotRemoveCommunityMemberWhoCanSignIn(error)) {
      return {
        formError: messageRef('memberError.removeCanSignIn'),
      };
    }

    if (isCannotRemoveCommunityMemberLinkedToOtherData(error)) {
      return {
        formError: messageRef('memberError.removeLinkedToOtherData'),
      };
    }

    if (isCommunityMemberNotFound(error)) {
      return {
        formError: messageRef('memberError.notFound'),
      };
    }

    return {
      formError: messageRef('memberError.removeFailed'),
    };
  }

  redirect('/app/members');
}

export async function submitConfirmCouple(input: {
  husbandId: string;
  wifeId: string;
}): Promise<{ success: boolean; error?: MessageRef }> {
  const parsed = coupleWriteSchema.safeParse({
    husband_id: input.husbandId,
    wife_id: input.wifeId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: messageRef('coupleError.invalidData'),
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
        error: messageRef('coupleError.sameSpouse'),
      };
    }

    if (isCoupleParticipantsAreNotEligible(error)) {
      return {
        success: false,
        error:
          messageRef('coupleError.notEligible'),
      };
    }

    return {
      success: false,
      error: messageRef('coupleError.saveFailed'),
    };
  }
}

export async function submitDecoupleCouple(
  coupleId: string
): Promise<{ success: boolean; error?: MessageRef }> {
  try {
    await removeCouple(coupleId);
    revalidatePath('/app/members');
    return { success: true };
  } catch (error) {
    if (isCoupleNotFound(error)) {
      return {
        success: false,
        error: messageRef('coupleError.notFound'),
      };
    }

    return {
      success: false,
      error: messageRef('coupleError.decoupleFailed'),
    };
  }
}
