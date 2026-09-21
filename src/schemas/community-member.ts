/**
 * What a Delegate may write for a community member.
 * Allowed values match members-table CHECKs. Readiness default is applied here,
 * not in a form.
 */

import { z } from 'zod';
import {
  accompanyingReadinesses,
  communityEngagementStatuses,
  consecratedStatuses,
  genders,
  maritalStatuses,
  type AccompanyingReadiness,
} from '@/types/community-member';

function nullWhenBlank(value: unknown): unknown {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

const requiredName = z.string().trim().min(1).max(255);

function optionalCheckedValue<Values extends readonly [string, ...string[]]>(
  values: Values
) {
  return z.preprocess(nullWhenBlank, z.enum(values).nullable());
}

export const communityMemberWriteSchema = z.object({
  first_name: requiredName,
  last_name: requiredName,
  gender: optionalCheckedValue(genders),
  marital_status: optionalCheckedValue(maritalStatuses),
  consecrated_status: optionalCheckedValue(consecratedStatuses),
  community_engagement_status: optionalCheckedValue(communityEngagementStatuses),
  accompanying_readiness: optionalCheckedValue(accompanyingReadinesses),
  email: z.preprocess(nullWhenBlank, z.string().email().max(255).nullable()),
  phone: z.preprocess(nullWhenBlank, z.string().max(50).nullable()),
  notes: z.preprocess(nullWhenBlank, z.string().nullable()),
});

export type CommunityMemberWrite = Omit<
  z.output<typeof communityMemberWriteSchema>,
  'accompanying_readiness'
> & {
  accompanying_readiness?: AccompanyingReadiness | null;
};

export type CommunityMemberWriteWithDefaults = Omit<
  CommunityMemberWrite,
  'accompanying_readiness'
> & {
  accompanying_readiness: AccompanyingReadiness;
};

export function communityMemberWriteWithDefaults(
  write: CommunityMemberWrite
): CommunityMemberWriteWithDefaults {
  return {
    ...write,
    accompanying_readiness: write.accompanying_readiness ?? 'Not Candidate',
  };
}
