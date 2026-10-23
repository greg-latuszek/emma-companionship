export const locales = ['en', 'pl', 'cs'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeCookieName = 'emma-language';

export const languageChoices: Record<Locale, { flag: string; name: string }> = {
  en: { flag: '🇬🇧', name: 'English' },
  pl: { flag: '🇵🇱', name: 'Polski' },
  cs: { flag: '🇨🇿', name: 'Čeština' },
};

export function isLocale(value: string | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? '');
}

export function localeFromCookieValue(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}
