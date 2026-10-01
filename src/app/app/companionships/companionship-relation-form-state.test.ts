import { describe, expect, it } from 'vitest';
import { newCompanionshipRelationFormValues } from './companionship-relation-form-state';
import type { CommunityMember } from '@/types/community-member';

const memberA = { id: '550e8400-e29b-41d4-a716-446655440001' } as CommunityMember;
const members = [memberA];

describe('newCompanionshipRelationFormValues', () => {
  it('newCompanionshipRelationFormValues preselects the accompanied member who is known', () => {
    const values = newCompanionshipRelationFormValues(memberA.id, members);

    expect(values.accompanied_id).toBe(memberA.id);
  });

  it('newCompanionshipRelationFormValues ignores an accompanied id that is not a member', () => {
    const values = newCompanionshipRelationFormValues('unknown-id', members);

    expect(values.accompanied_id).toBe('');
  });
});
