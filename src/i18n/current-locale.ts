import { cookies } from 'next/headers';
import { localeCookieName, localeFromCookieValue, type Locale } from './locales';
import { messagesFor } from './messages';
import { createTranslator, type Translate } from './translator';

export async function currentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return localeFromCookieValue(cookieStore.get(localeCookieName)?.value);
}

export async function currentTranslator(): Promise<Translate> {
  return createTranslator(await messagesFor(await currentLocale()));
}
