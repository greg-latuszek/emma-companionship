'use client';

import { useTransition } from 'react';
import type { JSX } from 'react';
import { chooseLanguage } from '@/i18n/choose-language';
import { useLocale, useTranslate } from '@/i18n/LocaleProvider';
import { languageChoices } from '@/i18n/locales';

export function LanguageSwitch(): JSX.Element {
  const locale = useLocale();
  const translate = useTranslate();
  const [isChanging, startChanging] = useTransition();

  return (
    <select
      aria-label={translate('language.label')}
      value={locale}
      disabled={isChanging}
      onChange={(event) => {
        const language = event.target.value;
        startChanging(() => chooseLanguage(language));
      }}
      className="rounded-full border border-white/30 bg-black/30 px-3 py-2 text-sm text-white backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {languageChoices.map((language) => (
        <option key={language.code} value={language.code} className="text-black">
          {language.flag} {language.name}
        </option>
      ))}
    </select>
  );
}
