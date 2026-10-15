import type { MemberId } from '@/types/auth';
import type {
  MaritalStatus,
  ConsecratedStatus,
  CommunityEngagementStatus,
} from '@/types/community-member';

export const companionshipRelationStatuses = [
  'active',
  'archived',
  'proposed',
] as const;
export type CompanionshipRelationStatus =
  (typeof companionshipRelationStatuses)[number];

export interface CompanionshipRelationParticipant {
  id: MemberId;
  first_name: string;
  last_name: string;
  marital_status: MaritalStatus | null;
  consecrated_status: ConsecratedStatus | null;
  community_engagement_status: CommunityEngagementStatus | null;
}

/**
 * Member eligible for companionship (not Looker-On) who has no active
 * companionship_relations row as accompanied_id. Archived history and
 * proposed drafts do not count as a current accompaniment.
 */
export type PersonWithoutCompanion = CompanionshipRelationParticipant;

export interface CompanionshipRelation {
  id: string;
  companion_id: MemberId;
  accompanied_id: MemberId;
  status: CompanionshipRelationStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

export interface CompanionshipRelationListItem {
  id: string;
  companion: CompanionshipRelationParticipant;
  accompanied: CompanionshipRelationParticipant;
  status: CompanionshipRelationStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}
