import { visualStyles, type VisualStyle } from '@/types/auth';

export const visualStyleLabels: Record<VisualStyle, string> = {
  'semi-transparent': 'Półprzeźroczysty',
  'high-contrast': 'Kontrastowy',
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
