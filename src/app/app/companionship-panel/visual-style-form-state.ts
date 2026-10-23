import { visualStyles, type VisualStyle } from '@/types/auth';
import type { MessageKey } from '@/i18n/translator';

export const visualStyleLabelKeys: Record<VisualStyle, MessageKey> = {
  'semi-transparent': 'visualStyle.semi-transparent',
  'high-contrast': 'visualStyle.high-contrast',
};

export type VisualStyleFormState = {
  formError?: string;
};

export function visualStyleFromForm(formData: FormData): VisualStyle | null {
  const value = formData.get('visual_style');
  if (typeof value !== 'string') {
    return null;
  }

  return visualStyles.find((style) => style === value) ?? null;
}
