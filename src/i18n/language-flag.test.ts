import { describe, expect, it } from 'vitest';
import { flagOfLanguage, isLanguageCode } from './language-flag';

describe('flagOfLanguage', () => {
  it('flagOfLanguage shows the flag of the country in the language code', () => {
    expect(flagOfLanguage('cs-CZ')).toBe('🇨🇿');
    expect(flagOfLanguage('sk-SK')).toBe('🇸🇰');
    expect(flagOfLanguage('pl-PL')).toBe('🇵🇱');
    expect(flagOfLanguage('en-GB')).toBe('🇬🇧');
  });

  it('flagOfLanguage lets a language name the country it is spoken in', () => {
    expect(flagOfLanguage('pt-PT')).toBe('🇵🇹');
    expect(flagOfLanguage('pt-BR')).toBe('🇧🇷');
  });

  it('flagOfLanguage gives no flag for a code without a country', () => {
    expect(flagOfLanguage('cs')).toBe('');
    expect(flagOfLanguage('not a code')).toBe('');
  });
});

describe('isLanguageCode', () => {
  it('isLanguageCode accepts only a language and a country', () => {
    expect(isLanguageCode('cs-CZ')).toBe(true);
    expect(isLanguageCode('cs')).toBe(false);
    expect(isLanguageCode('cs-cz')).toBe(false);
    expect(isLanguageCode('../cs-CZ')).toBe(false);
  });
});
