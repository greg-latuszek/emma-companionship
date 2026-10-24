import {
  accompanyingReadinesses,
  communityEngagementStatuses,
  consecratedStatuses,
  genders,
  maritalStatuses,
} from '@/types/community-member';
import type { MessageKey } from '@/i18n/translator';

export const genderLabelKeys: Record<(typeof genders)[number], MessageKey> = {
  male: 'member.gender.male',
  female: 'member.gender.female',
};

export const maritalStatusLabelKeys: Record<
  (typeof maritalStatuses)[number],
  MessageKey
> = {
  single: 'member.maritalStatus.single',
  married: 'member.maritalStatus.married',
  widowed: 'member.maritalStatus.widowed',
  consecrated: 'member.maritalStatus.consecrated',
};

export const consecratedStatusLabelKeys: Record<
  (typeof consecratedStatuses)[number],
  MessageKey
> = {
  priest: 'member.consecratedStatus.priest',
  deacon: 'member.consecratedStatus.deacon',
  seminarian: 'member.consecratedStatus.seminarian',
  sister: 'member.consecratedStatus.sister',
  brother: 'member.consecratedStatus.brother',
};

export const communityEngagementLabelKeys: Record<
  (typeof communityEngagementStatuses)[number],
  MessageKey
> = {
  'Looker-On': 'member.engagement.lookerOn',
  'In-Probation': 'member.engagement.inProbation',
  Commited: 'member.engagement.committed',
  'In-Fraternity-Probation': 'member.engagement.inFraternityProbation',
  Fraternity: 'member.engagement.fraternity',
};

export const accompanyingReadinessLabelKeys: Record<
  (typeof accompanyingReadinesses)[number],
  MessageKey
> = {
  'Not Candidate': 'member.readiness.notCandidate',
  Candidate: 'member.readiness.candidate',
  Ready: 'member.readiness.ready',
  Active: 'member.readiness.active',
  Overwhelmed: 'member.readiness.overwhelmed',
  Deactivated: 'member.readiness.deactivated',
};
