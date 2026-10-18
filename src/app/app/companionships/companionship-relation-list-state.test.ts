import { describe, expect, it } from 'vitest';
import {
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

  it('readStoredCompanionshipRelationListHistoryAkompaniamentExtras drops Status and keeps Data zakończenia', () => {
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
