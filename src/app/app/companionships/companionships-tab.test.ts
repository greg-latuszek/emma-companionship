import { describe, expect, it } from 'vitest';
import { companionshipsTabFrom, companionshipsTabHref } from './companionships-tab';

describe('companionshipsTabFrom', () => {
  it('companionshipsTabFrom opens Utworzone Akompaniamenty when no tab is given', () => {
    const tab = companionshipsTabFrom(undefined);

    expect(tab).toBe('created');
  });

  it('companionshipsTabFrom opens Brakujące Akompaniamenty when tab is missing', () => {
    const tab = companionshipsTabFrom('missing');

    expect(tab).toBe('missing');
  });

  it('companionshipsTabFrom falls back to Utworzone Akompaniamenty for an unknown tab', () => {
    const tab = companionshipsTabFrom('archived');

    expect(tab).toBe('created');
  });

  it('companionshipsTabFrom falls back to Utworzone Akompaniamenty when the tab is repeated in the URL', () => {
    const tab = companionshipsTabFrom(['missing', 'created']);

    expect(tab).toBe('created');
  });
});

describe('companionshipsTabHref', () => {
  it('companionshipsTabHref keeps the plain address for Utworzone Akompaniamenty', () => {
    const href = companionshipsTabHref('created');

    expect(href).toBe('/app/companionships');
  });

  it('companionshipsTabHref adds tab=missing for Brakujące Akompaniamenty', () => {
    const href = companionshipsTabHref('missing');

    expect(href).toBe('/app/companionships?tab=missing');
  });
});
