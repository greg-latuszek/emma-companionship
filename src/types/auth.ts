/**
 * Types for the live OAuth path.
 * Member is the login identity, not the full community registry row.
 */

export type MemberId = string & { readonly __brand: 'MemberId' };
export const MemberId = (id: string): MemberId => id as MemberId;

export const visualStyles = ['semi-transparent', 'high-contrast'] as const;
export type VisualStyle = (typeof visualStyles)[number];
export const defaultVisualStyle: VisualStyle = 'semi-transparent';

export function visualStyleOrDefault(
  visualStyle: VisualStyle | null | undefined
): VisualStyle {
  if (visualStyle === 'high-contrast' || visualStyle === 'semi-transparent') {
    return visualStyle;
  }
  return defaultVisualStyle;
}

export function visualStyleToStore(
  visualStyle: VisualStyle
): VisualStyle | null {
  if (visualStyle === defaultVisualStyle) {
    return null;
  }
  return visualStyle;
}

export interface Member {
  id: MemberId;
  first_name: string;
  last_name: string;
  email: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  is_active: boolean;
  revoked_at: Date | null;
  profile_picture: string | null;
  visual_style: VisualStyle | null;
}
