import { describe, expect, it } from 'vitest';
import {
  defaultPeopleWithoutCompanionShownColumns,
  engagementLabel,
  peopleWithoutCompanionShownColumns,
} from './people-without-companion-list-state';

describe('peopleWithoutCompanionShownColumns', () => {
  it('peopleWithoutCompanionShownColumns shows every column when nothing was stored', () => {
    const columns = peopleWithoutCompanionShownColumns(null);

    expect(columns).toEqual(defaultPeopleWithoutCompanionShownColumns);
  });

  it('peopleWithoutCompanionShownColumns restores the columns the Delegate hid', () => {
    const stored = JSON.stringify(['marital_status', 'community_engagement_status']);

    const columns = peopleWithoutCompanionShownColumns(stored);

    expect(columns).toEqual(['marital_status', 'community_engagement_status']);
  });
});

describe('engagementLabel', () => {
  it('engagementLabel says status nieznany when the engagement status is empty', () => {
    const label = engagementLabel(null);

    expect(label).toBe('status nieznany');
  });
});
