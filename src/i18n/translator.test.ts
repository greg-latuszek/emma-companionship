import { describe, expect, it } from 'vitest';
import en from './messages/en.json';
import pl from './messages/pl.json';
import { localeFromCookieValue } from './locales';
import { messagesFor } from './messages';
import { createTranslator, mergeOverEnglish, type Messages } from './translator';

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
  it('messagesFor gives Polish texts for pl', () => {
    expect(messagesFor('pl')['navbar.home']).toBe('Strona główna');
  });

  it('messagesFor gives English texts for en', () => {
    expect(messagesFor('en')['navbar.home']).toBe('Home page');
  });

  it('every Polish message key exists in the English file', () => {
    expect(Object.keys(en)).toEqual(expect.arrayContaining(Object.keys(pl)));
  });
});

describe('localeFromCookieValue', () => {
  it('localeFromCookieValue chooses English when the cookie is absent', () => {
    expect(localeFromCookieValue(undefined)).toBe('en');
  });

  it('localeFromCookieValue chooses English when the cookie names an unknown language', () => {
    expect(localeFromCookieValue('xx')).toBe('en');
  });

  it('localeFromCookieValue chooses Polish when the cookie says pl', () => {
    expect(localeFromCookieValue('pl')).toBe('pl');
  });
});
