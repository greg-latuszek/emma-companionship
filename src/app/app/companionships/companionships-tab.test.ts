import { describe, expect, it } from 'vitest';
import { companionshipsTabFrom, companionshipsTabHref } from './companionships-tab';

describe('companionshipsTabFrom', () => {
  it('companionshipsTabFrom opens Created Companionships when no tab is given', () => {
    expect(companionshipsTabFrom(undefined)).toBe('created');
  });

  it('companionshipsTabFrom opens Missing Companionships when tab is missing', () => {
    expect(companionshipsTabFrom('missing')).toBe('missing');
  });

  it('companionshipsTabFrom opens Companionship History when tab is history', () => {
    expect(companionshipsTabFrom('history')).toBe('history');
  });

  it('companionshipsTabFrom opens Add Companionship when tab is new', () => {
    expect(companionshipsTabFrom('new')).toBe('new');
  });

  it('companionshipsTabFrom falls back to Created Companionships for an unknown tab', () => {
    expect(companionshipsTabFrom('archived')).toBe('created');
  });

  it('companionshipsTabFrom falls back to Created Companionships when the tab is repeated in the URL', () => {
    expect(companionshipsTabFrom(['missing', 'created'])).toBe('created');
  });
});

describe('companionshipsTabHref', () => {
  it('companionshipsTabHref keeps the plain address for Created Companionships', () => {
    expect(companionshipsTabHref('created')).toBe('/app/companionships');
  });

  it('companionshipsTabHref adds tab=missing for Missing Companionships', () => {
    expect(companionshipsTabHref('missing')).toBe(
      '/app/companionships?tab=missing'
    );
  });

  it('companionshipsTabHref adds tab=history for Companionship History', () => {
    expect(companionshipsTabHref('history')).toBe(
      '/app/companionships?tab=history'
    );
  });

  it('companionshipsTabHref adds tab=new for Add Companionship', () => {
    expect(companionshipsTabHref('new')).toBe('/app/companionships?tab=new');
  });
});
