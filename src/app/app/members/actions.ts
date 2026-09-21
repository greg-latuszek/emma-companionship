'use server';

import { redirect } from 'next/navigation';
import { communityMemberWriteSchema } from '@/schemas/community-member';
import {
  addCommunityMember,
  isDuplicateCommunityMemberEmail,
} from '@/application/add-community-member';
import {
  isCommunityMemberNotFound,
  updateCommunityMember,
} from '@/application/update-community-member';
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
