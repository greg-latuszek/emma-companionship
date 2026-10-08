/**
 * Couple as a registry marriage link between two community members.
 * SQL: couples.member1_id = husband (male), couples.member2_id = wife (female).
 * Companionship relations stay person↔person; this type is not a companionship participant.
 */

import type { MemberId } from '@/types/auth';
import type { Gender } from '@/types/community-member';

export interface Couple {
  id: string;
  member1_id: MemberId;
  member2_id: MemberId;
}

export interface CoupleParticipant {
  id: MemberId;
  first_name: string;
  last_name: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export interface CoupleListItem {
  id: string;
  husband: CoupleParticipant;
  wife: CoupleParticipant;
}

/**
 * Married person with a known gender who is not yet linked in couples.
 * Eligible for the couple-building screen.
 */
export type MarriedPersonWithoutCouple = CoupleParticipant;
