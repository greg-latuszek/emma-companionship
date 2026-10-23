import en from './messages/en.json';
import pl from './messages/pl.json';
import cs from './messages/cs.json';
import sk from './messages/sk.json';
import type { Locale } from './locales';
import { createTranslator, mergeOverEnglish, type Messages } from './translator';

const translations: Record<Locale, Partial<Messages>> = { en, pl, cs, sk };

export function messagesFor(locale: Locale): Messages {
  return mergeOverEnglish(en, translations[locale]);
}

/** Lists are sorted by the Polish label whatever language the screen shows. */
export const translateInPolish = createTranslator(messagesFor('pl'));
