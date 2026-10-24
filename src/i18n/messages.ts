import en from './messages/en-GB.json';
import { defaultLocale, isLocale, type Locale } from './locales';
import { mergeOverEnglish, type Messages } from './translator';

/** The code is checked against the language files, then the bundler has included every file of the folder. */
export async function messagesFor(locale: Locale): Promise<Messages> {
  if (locale === defaultLocale || !isLocale(locale)) {
    return mergeOverEnglish(en, {});
  }
  const translated = (await import(`./messages/${locale}.json`)).default;
  return mergeOverEnglish(en, translated);
}
