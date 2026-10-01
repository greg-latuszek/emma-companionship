import { describe, expect, it } from 'vitest';
import { companionshipsPanelCard } from './companionships-panel-card';

describe('companionshipsPanelCard', () => {
  it('companionshipsPanelCard tells how many people still miss a companion', () => {
    expect(companionshipsPanelCard(5).missingCount).toBe(5);
  });
});
