'use client';

import { createContext, useContext, useMemo } from 'react';
import type { JSX, ReactNode } from 'react';
import type { Locale } from './locales';
import { createTranslator, type Messages, type Translate } from './translator';

type LocaleContextValue = { locale: Locale; translate: Translate };

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}): JSX.Element {
  const value = useMemo(
    () => ({ locale, translate: createTranslator(messages) }),
    [locale, messages]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('LocaleProvider is missing above this component');
  }
  return value;
}

export function useTranslate(): Translate {
  return useLocaleContext().translate;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}
