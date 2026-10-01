import {
  communityEngagementLabels,
  consecratedStatusLabels,
  maritalStatusLabels,
} from '@/app/app/members/community-member-labels';
import type { CommunityEngagementStatus } from '@/types/community-member';
import type { PersonWithoutCompanion } from '@/types/companionship-relation';
import {
  companionshipRelationListPersonExtraFields,
  type CompanionshipRelationListPersonExtraField,
} from './companionship-relation-list-state';

export type PeopleWithoutCompanionColumn =
  CompanionshipRelationListPersonExtraField;

export const peopleWithoutCompanionColumns =
  companionshipRelationListPersonExtraFields;

export const peopleWithoutCompanionColumnLabels: Record<
  PeopleWithoutCompanionColumn,
  string
> = {
  marital_status: 'Stan cywilny',
  consecrated_status: 'Typ osoby konsekrowanej',
  community_engagement_status: 'Zaangażowanie we wspólnocie',
};

export const defaultPeopleWithoutCompanionShownColumns: PeopleWithoutCompanionColumn[] =
  ['marital_status', 'consecrated_status', 'community_engagement_status'];

export const peopleWithoutCompanionColumnStorageKey =
  'emma.people-without-companion-list.shown-columns';

export function engagementLabel(
  status: CommunityEngagementStatus | null
): string {
  return status ? communityEngagementLabels[status] : 'status nieznany';
}

export function personWithoutCompanionColumnText(
  person: PersonWithoutCompanion,
  column: PeopleWithoutCompanionColumn
): string {
  if (column === 'marital_status') {
    return person.marital_status
      ? maritalStatusLabels[person.marital_status]
      : '';
  }
  if (column === 'consecrated_status') {
    return person.consecrated_status
      ? consecratedStatusLabels[person.consecrated_status]
      : '';
  }
  return engagementLabel(person.community_engagement_status);
}

export function peopleWithoutCompanionShownColumns(
  stored: string | null
): PeopleWithoutCompanionColumn[] {
  if (stored === null) {
    return defaultPeopleWithoutCompanionShownColumns;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return defaultPeopleWithoutCompanionShownColumns;
    }

    const columns = parsed.filter(
      (field): field is PeopleWithoutCompanionColumn =>
        (peopleWithoutCompanionColumns as readonly string[]).includes(field)
    );

    if (parsed.length > 0 && columns.length === 0) {
      return defaultPeopleWithoutCompanionShownColumns;
    }

    return columns;
  } catch {
    return defaultPeopleWithoutCompanionShownColumns;
  }
}

export function readStoredPeopleWithoutCompanionShownColumns(
  storage: Pick<Storage, 'getItem'> | null
): PeopleWithoutCompanionColumn[] {
  if (!storage) {
    return defaultPeopleWithoutCompanionShownColumns;
  }
  return peopleWithoutCompanionShownColumns(
    storage.getItem(peopleWithoutCompanionColumnStorageKey)
  );
}

export function storePeopleWithoutCompanionShownColumns(
  columns: PeopleWithoutCompanionColumn[],
  storage: Pick<Storage, 'setItem'> | null
): void {
  storage?.setItem(
    peopleWithoutCompanionColumnStorageKey,
    JSON.stringify(columns)
  );
}

export function togglePeopleWithoutCompanionColumn(
  columns: PeopleWithoutCompanionColumn[],
  column: PeopleWithoutCompanionColumn
): PeopleWithoutCompanionColumn[] {
  if (columns.includes(column)) {
    return columns.filter((c) => c !== column);
  }
  return [...columns, column];
}
