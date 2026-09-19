/**
 * Types for the live Google OAuth path.
 * Member is the login identity, not the full community registry row.
 */

export type MemberId = string & { readonly __brand: 'MemberId' };
export const MemberId = (id: string): MemberId => id as MemberId;

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
}
