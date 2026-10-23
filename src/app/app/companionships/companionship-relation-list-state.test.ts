import { describe, expect, it } from 'vitest';
import { MemberId } from '@/types/auth';
import type { MaritalStatus } from '@/types/community-member';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import type { Locale } from '@/i18n/locales';
import { messagesFor } from '@/i18n/messages';
import { createTranslator } from '@/i18n/translator';
import {
  sortCompanionshipRelations,
  companionshipRelationListHistoryAkompaniamentExtrasStorageKey,
  defaultCompanionshipRelationListHistoryAkompaniamentExtras,
  readStoredCompanionshipRelationListHistoryAkompaniamentExtras,
  storeCompanionshipRelationListHistoryAkompaniamentExtras,
} from './companionship-relation-list-state';

describe('companionship relation list history akompaniament extras', () => {
  it('readStoredCompanionshipRelationListHistoryAkompaniamentExtras defaults to start and end dates', () => {
    const storage = {
      getItem: () => null,
    };

    expect(
      readStoredCompanionshipRelationListHistoryAkompaniamentExtras(storage)
    ).toEqual(defaultCompanionshipRelationListHistoryAkompaniamentExtras);
  });

  it('readStoredCompanionshipRelationListHistoryAkompaniamentExtras drops Status and keeps the end date', () => {
    const storage = {
      getItem: (key: string) =>
        key === companionshipRelationListHistoryAkompaniamentExtrasStorageKey
          ? JSON.stringify(['start_date', 'end_date', 'status'])
          : null,
    };

    expect(
      readStoredCompanionshipRelationListHistoryAkompaniamentExtras(storage)
    ).toEqual(['start_date', 'end_date']);
  });

  it('storeCompanionshipRelationListHistoryAkompaniamentExtras writes the history storage key', () => {
    const written: Record<string, string> = {};
    const storage = {
      setItem: (key: string, value: string) => {
        written[key] = value;
      },
    };

    storeCompanionshipRelationListHistoryAkompaniamentExtras(
      ['end_date'],
      storage
    );

    expect(
      written[companionshipRelationListHistoryAkompaniamentExtrasStorageKey]
    ).toBe(JSON.stringify(['end_date']));
  });
});

function aRelationWhereAccompaniedIs(maritalStatus: MaritalStatus): CompanionshipRelationListItem {
  const person = {
    id: MemberId(`person-${maritalStatus}`),
    first_name: 'Ada',
    last_name: 'Lovelace',
    marital_status: maritalStatus,
    consecrated_status: null,
    community_engagement_status: null,
  };
  return {
    id: maritalStatus,
    companion: { ...person, id: MemberId(`companion-${maritalStatus}`) },
    accompanied: person,
    status: 'active',
    start_date: null,
    end_date: null,
    notes: null,
  };
}

function translatorIn(locale: Locale) {
  return createTranslator(messagesFor(locale));
}

describe('sortCompanionshipRelations by a labelled field', () => {
  const relations = [
    aRelationWhereAccompaniedIs('widowed'),
    aRelationWhereAccompaniedIs('single'),
    aRelationWhereAccompaniedIs('married'),
  ];

  function idsSortedIn(locale: Locale): string[] {
    return sortCompanionshipRelations(
      relations,
      'accompanied_marital_status',
      'asc',
      translatorIn(locale), locale
    ).map((relation) => relation.id);
  }

  it('sortCompanionshipRelations orders marital statuses by the English words when the screen is English', () => {
    expect(idsSortedIn('en')).toEqual(['married', 'single', 'widowed']);
  });

  it('sortCompanionshipRelations orders marital statuses by the Polish words when the screen is Polish', () => {
    expect(idsSortedIn('pl')).toEqual(['single', 'married', 'widowed']);
  });
});
