'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLocale, localeCookieName } from './locales';

const oneYearInSeconds = 60 * 60 * 24 * 365;

export async function chooseLanguage(language: string): Promise<void> {
  if (!isLocale(language)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, language, {
    path: '/',
    maxAge: oneYearInSeconds,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
