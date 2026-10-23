import en from './messages/en.json';
import pl from './messages/pl.json';
import type { Locale } from './locales';
import { mergeOverEnglish, type Messages } from './translator';

const translations: Record<Locale, Partial<Messages>> = { en, pl };

export function messagesFor(locale: Locale): Messages {
  return mergeOverEnglish(en, translations[locale]);
}
