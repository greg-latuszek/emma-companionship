import type { MemberId } from '@/types/auth';

export const companionshipRelationStatuses = ['active', 'archived'] as const;
export type CompanionshipRelationStatus =
  (typeof companionshipRelationStatuses)[number];

export interface CompanionshipRelation {
  id: string;
  companion_id: MemberId;
  accompanied_id: MemberId;
  status: CompanionshipRelationStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}
