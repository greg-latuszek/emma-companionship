'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  isLoginMemberNotFound,
  updateMemberVisualStyle,
} from '@/application/update-member-visual-style';
import { visualStyleToStore } from '@/types/auth';
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
    return { formError: 'Zaloguj się ponownie, aby zmienić wygląd.' };
  }

  const visualStyle = visualStyleFromForm(formData);
  if (!visualStyle) {
    return { formError: 'Wybierz wygląd.' };
  }

  try {
    await updateMemberVisualStyle(memberId, visualStyleToStore(visualStyle));
  } catch (error) {
    if (isLoginMemberNotFound(error)) {
      return { formError: 'Zaloguj się ponownie, aby zmienić wygląd.' };
    }

    return { formError: 'Nie udało się zapisać wyglądu. Spróbuj ponownie.' };
  }

  revalidatePath('/app', 'layout');
  return {};
}
