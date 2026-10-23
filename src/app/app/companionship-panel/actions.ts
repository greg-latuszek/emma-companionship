'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  isLoginMemberNotFound,
  updateMemberVisualStyle,
} from '@/application/update-member-visual-style';
import { visualStyleToStore } from '@/types/auth';
import { messageRef } from '@/i18n/translator';
import {
  visualStyleFromForm,
  type VisualStyleFormState,
} from './visual-style-form-state';

export async function submitMemberVisualStyle(
  previous: VisualStyleFormState | undefined,
  formData: FormData
): Promise<VisualStyleFormState> {
  void previous;

  const session = await auth();
  const memberId = session?.user.memberId;
  if (!memberId) {
    return { formError: messageRef('panel.settings.signInAgain') };
  }

  const visualStyle = visualStyleFromForm(formData);
  if (!visualStyle) {
    return { formError: messageRef('panel.settings.chooseAppearance') };
  }

  try {
    await updateMemberVisualStyle(memberId, visualStyleToStore(visualStyle));
  } catch (error) {
    if (isLoginMemberNotFound(error)) {
      return { formError: messageRef('panel.settings.signInAgain') };
    }

    return { formError: messageRef('panel.settings.saveFailed') };
  }

  revalidatePath('/app', 'layout');
  return {};
}
