import { describe, expect, it } from 'vitest';
import { flagOfLanguage } from './language-flag';

describe('flagOfLanguage', () => {
  it('flagOfLanguage shows the flag of the country where the language is mostly spoken', () => {
    expect(flagOfLanguage('cs')).toBe('🇨🇿');
    expect(flagOfLanguage('sk')).toBe('🇸🇰');
    expect(flagOfLanguage('pl')).toBe('🇵🇱');
  });

  it('flagOfLanguage shows the British flag for English', () => {
    expect(flagOfLanguage('en')).toBe('🇬🇧');
  });

  it('flagOfLanguage follows the country named in the code when there is one', () => {
    expect(flagOfLanguage('pt-PT')).toBe('🇵🇹');
  });

  it('flagOfLanguage gives no flag for a code that is not a language', () => {
    expect(flagOfLanguage('xx')).toBe('');
    expect(flagOfLanguage('not a code')).toBe('');
  });
});
