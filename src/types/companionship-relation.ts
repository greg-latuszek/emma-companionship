import type { MemberId } from '@/types/auth';

export const companionshipRelationStatuses = ['active', 'archived'] as const;
export type CompanionshipRelationStatus =
  (typeof companionshipRelationStatuses)[number];

export interface CompanionshipRelationParticipant {
  id: MemberId;
  first_name: string;
  last_name: string;
}

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
