import { describe, expect, it } from 'vitest';
import { communityMembersPanelCard } from './community-members-panel-card';

describe('communityMembersPanelCard', () => {
  it('the companionship panel card for community members opens /app/members', () => {
    expect(communityMembersPanelCard()).toEqual({
      href: '/app/members',
      title: 'Członkowie wspólnoty',
    });
  });
});
