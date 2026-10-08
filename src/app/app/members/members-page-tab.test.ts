import { describe, expect, it } from 'vitest';
import {
  membersPageTabFrom,
  membersPageTabHref,
} from '@/app/app/members/members-page-tab';

describe('membersPageTabFrom', () => {
  it('membersPageTabFrom opens Małżeństwa when tab is couples', () => {
    expect(membersPageTabFrom('couples')).toBe('couples');
  });

  it('membersPageTabFrom opens + Dodaj Małżeństwa when tab is build-couples', () => {
    expect(membersPageTabFrom('build-couples')).toBe('build-couples');
  });

  it('membersPageTabFrom opens the person list when tab is missing', () => {
    expect(membersPageTabFrom(undefined)).toBe('list');
  });
});

describe('membersPageTabHref', () => {
  it('membersPageTabHref builds the query for + Dodaj Małżeństwa', () => {
    expect(membersPageTabHref('build-couples')).toBe(
      '/app/members?tab=build-couples'
    );
  });
});
