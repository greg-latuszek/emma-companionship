import en from './messages/en-GB.json';
import pl from './messages/pl-PL.json';
import cs from './messages/cs-CZ.json';
import sk from './messages/sk-SK.json';
import type { Locale } from './locales';
import { mergeOverEnglish, type Messages } from './translator';

const translations: Record<Locale, Partial<Messages>> = {
  'en-GB': en,
  'pl-PL': pl,
  'cs-CZ': cs,
  'sk-SK': sk,
};

export function messagesFor(locale: Locale): Messages {
  return mergeOverEnglish(en, translations[locale]);
}
