import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import en from './messages/en-GB.json';
import pl from './messages/pl-PL.json';
import { isLanguageCode } from './language-flag';
import { languageChoices, localeFromCookieValue } from './locales';
import { messagesFor } from './messages';
import {
  createTranslator,
  mergeOverEnglish,
  messageRef,
  type Messages,
} from './translator';

describe('createTranslator', () => {
  it('createTranslator fills a placeholder with its value', () => {
    const translate = createTranslator({ ...en, 'panel.companionships.missing': 'Missing: {count}' });

    expect(translate('panel.companionships.missing', { count: 5 })).toBe('Missing: 5');
  });

  it('createTranslator keeps a placeholder that has no value', () => {
    const translate = createTranslator({ ...en, 'panel.companionships.missing': 'Missing: {count}' });

    expect(translate('panel.companionships.missing')).toBe('Missing: {count}');
  });
});

describe('mergeOverEnglish', () => {
  it('mergeOverEnglish shows the English text when a key is missing from the translation', () => {
    const incompletePolish: Partial<Messages> = { ...pl };
    delete incompletePolish['panel.welcome'];

    const merged = mergeOverEnglish(en, incompletePolish);

    expect(merged['panel.welcome']).toBe(en['panel.welcome']);
    expect(merged['navbar.home']).toBe(pl['navbar.home']);
  });

  it('mergeOverEnglish shows the English text when the translation is blank', () => {
    const merged = mergeOverEnglish(en, { 'panel.welcome': '' });

    expect(merged['panel.welcome']).toBe(en['panel.welcome']);
  });
});

describe('messagesFor', () => {
  it('messagesFor gives Polish texts for pl-PL', async () => {
    expect((await messagesFor('pl-PL'))['navbar.home']).toBe('Strona główna');
  });

  it('messagesFor gives English texts for en-GB', async () => {
    expect((await messagesFor('en-GB'))['navbar.home']).toBe('Home page');
  });

  it('every English message key has a Polish text', () => {
    expect(Object.keys(pl)).toEqual(expect.arrayContaining(Object.keys(en)));
  });

  it('every Polish message key exists in the English file', () => {
    expect(Object.keys(en)).toEqual(expect.arrayContaining(Object.keys(pl)));
  });
});

describe('createTranslator with a message reference', () => {
  it('createTranslator translates a message reference with its own values', async () => {
    const translate = createTranslator(await messagesFor('en-GB'));

    expect(translate(messageRef('panel.companionships.missing', { count: 3 }))).toBe(
      'Missing companionships: 3'
    );
  });

  it('createTranslator translates a message reference nested in a value', async () => {
    const translate = createTranslator(await messagesFor('pl-PL'));
    const ref = messageRef('validation.field.required', {
      field: messageRef('companionship.field.startDate'),
    });

    expect(translate(ref)).toBe('Pole "Data rozpoczęcia" jest wymagane.');
  });
});

const messagesFolder = path.join(__dirname, 'messages');
const languageFiles = fs
  .readdirSync(messagesFolder)
  .filter((fileName) => fileName.endsWith('.json'))
  .map((fileName) => fileName.slice(0, -'.json'.length));

function textsOfLanguageFile(code: string): Record<string, string> {
  return JSON.parse(fs.readFileSync(path.join(messagesFolder, `${code}.json`), 'utf8'));
}

describe('every language file', () => {
  const placeholdersIn = (text: string): string[] =>
    (text.match(/\{\w+\}/g) ?? []).sort();

  it.each(languageFiles)('%s is named <language>-<COUNTRY>', (code) => {
    expect(isLanguageCode(code)).toBe(true);
  });

  it.each(languageFiles)('%s names itself', (code) => {
    expect(textsOfLanguageFile(code)['language.name']).toBeTruthy();
  });

  it.each(languageFiles)('%s keeps the placeholders of the English sentences', (code) => {
    for (const [key, text] of Object.entries(textsOfLanguageFile(code))) {
      const english = (en as Record<string, string>)[key];

      expect(placeholdersIn(text), key).toEqual(placeholdersIn(english ?? ''));
    }
  });

  it.each(languageFiles)('%s has no key that English does not have', (code) => {
    expect(Object.keys(en)).toEqual(
      expect.arrayContaining(Object.keys(textsOfLanguageFile(code)))
    );
  });
});

describe('languageChoices', () => {
  it('languageChoices offers every language file with English first', () => {
    const codes = languageChoices.map((language) => language.code);

    expect(codes[0]).toBe('en-GB');
    expect([...codes].sort()).toEqual([...languageFiles].sort());
  });

  it('languageChoices takes the name from the file and the flag from the country', () => {
    expect(languageChoices.find((language) => language.code === 'pl-PL')).toEqual({
      code: 'pl-PL',
      name: 'Polski',
      flag: '🇵🇱',
    });
  });
});

describe('messagesFor with a code that has no language file', () => {
  it('messagesFor gives the English texts', async () => {
    expect((await messagesFor('xx-XX'))['navbar.home']).toBe('Home page');
    expect((await messagesFor('../en-GB'))['navbar.home']).toBe('Home page');
  });
});

describe('localeFromCookieValue', () => {
  it('localeFromCookieValue chooses English when the cookie is absent', () => {
    expect(localeFromCookieValue(undefined)).toBe('en-GB');
  });

  it('localeFromCookieValue chooses English when the cookie names an unknown language', () => {
    expect(localeFromCookieValue('xx')).toBe('en-GB');
  });

  it('localeFromCookieValue chooses Polish when the cookie says pl', () => {
    expect(localeFromCookieValue('pl-PL')).toBe('pl-PL');
  });
});
