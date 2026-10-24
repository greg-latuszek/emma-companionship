import { describe, expect, it } from 'vitest';
import { companionshipsPanelCard } from './companionships-panel-card';

describe('companionshipsPanelCard', () => {
  it('companionshipsPanelCard tells how many people still miss a companion', () => {
    expect(companionshipsPanelCard(5, 2).missingCount).toBe(5);
  });

  it('companionshipsPanelCard carries the overwhelmed count next to the missing count', () => {
    expect(companionshipsPanelCard(5, 2).overwhelmedCount).toBe(2);
  });
});
