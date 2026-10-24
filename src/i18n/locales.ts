import { flagOfLanguage } from './language-flag';

export type Locale = string;

export type LanguageChoice = { code: Locale; name: string; flag: string };

export const defaultLocale: Locale = 'en-GB';

export const localeCookieName = 'emma-language';

/** The language files found in src/i18n/messages when the app was built (see next.config.ts). */
export const languageChoices: LanguageChoice[] = (
  JSON.parse(process.env.LANGUAGE_CHOICES ?? '[]') as { code: Locale; name: string }[]
)
  .map(({ code, name }) => ({ code, name, flag: flagOfLanguage(code) }))
  .sort((left, right) =>
    left.code === defaultLocale
      ? -1
      : right.code === defaultLocale
        ? 1
        : left.code.localeCompare(right.code)
  );

export function isLocale(value: string | undefined): value is Locale {
  return languageChoices.some((language) => language.code === value);
}

export function localeFromCookieValue(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}
