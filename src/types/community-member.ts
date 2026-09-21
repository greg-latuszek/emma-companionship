/**
 * Community member as a registry person, not a login identity.
 * SQL column names stay as the members table named them.
 * hasLoginIdentity is derived later from oauth_id; it is not a column.
 */

import type { MemberId } from '@/types/auth';

export const genders = ['male', 'female'] as const;
export type Gender = (typeof genders)[number];

export const maritalStatuses = [
  'single',
  'married',
  'widowed',
  'consecrated',
] as const;
export type MaritalStatus = (typeof maritalStatuses)[number];

export const consecratedStatuses = [
  'priest',
  'deacon',
  'seminarian',
  'sister',
  'brother',
] as const;
export type ConsecratedStatus = (typeof consecratedStatuses)[number];

export const communityEngagementStatuses = [
  'Looker-On',
  'In-Probation',
  'Commited',
  'In-Fraternity-Probation',
  'Fraternity',
] as const;
export type CommunityEngagementStatus = (typeof communityEngagementStatuses)[number];

export const accompanyingReadinesses = [
  'Not Candidate',
  'Candidate',
  'Ready',
  'Active',
  'Overwhelmed',
  'Deactivated',
] as const;
export type AccompanyingReadiness = (typeof accompanyingReadinesses)[number];

export interface CommunityMember {
  id: MemberId;
  first_name: string;
  last_name: string;
  gender: Gender | null;
  marital_status: MaritalStatus | null;
  consecrated_status: ConsecratedStatus | null;
  community_engagement_status: CommunityEngagementStatus | null;
  accompanying_readiness: AccompanyingReadiness | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  hasLoginIdentity: boolean;
}
