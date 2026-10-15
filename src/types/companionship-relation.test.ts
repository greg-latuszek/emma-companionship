import { describe, expect, it } from 'vitest';
import { companionshipRelationStatuses } from '@/types/companionship-relation';

describe('companionshipRelationStatuses', () => {
  it('companionshipRelationStatuses includes proposed for Find Companion drafts', () => {
    expect(companionshipRelationStatuses).toEqual([
      'active',
      'archived',
      'proposed',
    ]);
  });
});
