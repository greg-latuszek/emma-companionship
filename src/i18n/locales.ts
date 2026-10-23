import { flagOfLanguage } from './language-flag';

export const locales = ['en-GB', 'pl-PL', 'cs-CZ', 'sk-SK', 'hu-HU'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en-GB';

export const localeCookieName = 'emma-language';

const languageNames: Record<Locale, string> = {
  'en-GB': 'English',
  'pl-PL': 'Polski',
  'cs-CZ': 'Čeština',
  'sk-SK': 'Slovenčina',
  'hu-HU': 'Magyar',
};

export const languageChoices: Record<Locale, { flag: string; name: string }> =
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      { flag: flagOfLanguage(locale), name: languageNames[locale] },
    ])
  ) as Record<Locale, { flag: string; name: string }>;

export function isLocale(value: string | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? '');
}

export function localeFromCookieValue(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}
