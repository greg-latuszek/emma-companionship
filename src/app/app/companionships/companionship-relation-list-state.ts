import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import {
  maritalStatusLabels,
  consecratedStatusLabels,
  communityEngagementLabels,
} from '@/app/app/members/community-member-labels';

// Base fields in the Akompaniament group
export const companionshipRelationListBaseFields = [
  'accompanied',
  'companion',
  'start_date',
  'status',
] as const;

export type CompanionshipRelationListBaseField =
  (typeof companionshipRelationListBaseFields)[number];

// Toggleable fields for Akompaniament group (start_date and status are toggleable)
export const companionshipRelationListAkompaniamentExtraFields = [
  'start_date',
  'status',
] as const;

export type CompanionshipRelationListAkompaniamentExtraField =
  (typeof companionshipRelationListAkompaniamentExtraFields)[number];

// Toggleable fields for Akompaniowany and Akompaniator groups
export const companionshipRelationListPersonExtraFields = [
  'marital_status',
  'consecrated_status',
  'community_engagement_status',
] as const;

export type CompanionshipRelationListPersonExtraField =
  (typeof companionshipRelationListPersonExtraFields)[number];

// All sortable fields (base + person fields for both accompanied and companion)
export const companionshipRelationListSortFields = [
  'accompanied',
  'companion',
  'start_date',
  'status',
  'accompanied_marital_status',
  'accompanied_consecrated_status',
  'accompanied_community_engagement_status',
  'companion_marital_status',
  'companion_consecrated_status',
  'companion_community_engagement_status',
] as const;

export type CompanionshipRelationListSortField =
  (typeof companionshipRelationListSortFields)[number];

export type CompanionshipRelationListSortDirection = 'asc' | 'desc';

export type CompanionshipRelationListSort = {
  sortField: CompanionshipRelationListSortField;
  sortDirection: CompanionshipRelationListSortDirection;
};

export const defaultCompanionshipRelationListSort: CompanionshipRelationListSort =
  {
    sortField: 'accompanied',
    sortDirection: 'asc',
  };

export const defaultCompanionshipRelationListAkompaniamentExtras: CompanionshipRelationListAkompaniamentExtraField[] =
  ['start_date', 'status'];

export const defaultCompanionshipRelationListAccompaniedExtras: CompanionshipRelationListPersonExtraField[] =
  [];

export const defaultCompanionshipRelationListCompanionExtras: CompanionshipRelationListPersonExtraField[] =
  [];

export const companionshipRelationListFieldLabels: Record<
  | CompanionshipRelationListBaseField
  | CompanionshipRelationListPersonExtraField
  | `accompanied_${CompanionshipRelationListPersonExtraField}`
  | `companion_${CompanionshipRelationListPersonExtraField}`,
  string
> = {
  accompanied: 'Akompaniowany',
  companion: 'Akompaniator',
  start_date: 'Data rozpoczęcia',
  status: 'Status',
  marital_status: 'Stan cywilny',
  consecrated_status: 'Typ osoby konsekrowanej',
  community_engagement_status: 'Zaangażowanie we wspólnocie',
  accompanied_marital_status: 'Stan cywilny (Akompaniowany)',
  accompanied_consecrated_status: 'Typ osoby konsekrowanej (Akompaniowany)',
  accompanied_community_engagement_status:
    'Zaangażowanie we wspólnocie (Akompaniowany)',
  companion_marital_status: 'Stan cywilny (Akompaniator)',
  companion_consecrated_status: 'Typ osoby konsekrowanej (Akompaniator)',
  companion_community_engagement_status:
    'Zaangażowanie we wspólnocie (Akompaniator)',
};

export function accompaniedFullName(
  relation: CompanionshipRelationListItem
): string {
  return `${relation.accompanied.last_name} ${relation.accompanied.first_name}`;
}

export function companionFullName(
  relation: CompanionshipRelationListItem
): string {
  return `${relation.companion.last_name} ${relation.companion.first_name}`;
}

export function personFieldText(
  person: CompanionshipRelationListItem['accompanied'] | CompanionshipRelationListItem['companion'],
  field: CompanionshipRelationListPersonExtraField
): string {
  if (field === 'marital_status') {
    return person.marital_status ? maritalStatusLabels[person.marital_status] : '';
  }
  if (field === 'consecrated_status') {
    return person.consecrated_status
      ? consecratedStatusLabels[person.consecrated_status]
      : '';
  }
  if (field === 'community_engagement_status') {
    return person.community_engagement_status
      ? communityEngagementLabels[person.community_engagement_status]
      : '';
  }
  return '';
}

function statusLabel(status: string): string {
  return status === 'active' ? 'Aktywny' : 'Zarchiwizowany';
}

function companionshipRelationSortKey(
  relation: CompanionshipRelationListItem,
  field: CompanionshipRelationListSortField
): string {
  if (field === 'accompanied') {
    return accompaniedFullName(relation);
  }
  if (field === 'companion') {
    return companionFullName(relation);
  }
  if (field === 'start_date') {
    return relation.start_date ?? '';
  }
  if (field === 'status') {
    return statusLabel(relation.status);
  }
  if (field === 'accompanied_marital_status') {
    return personFieldText(relation.accompanied, 'marital_status');
  }
  if (field === 'accompanied_consecrated_status') {
    return personFieldText(relation.accompanied, 'consecrated_status');
  }
  if (field === 'accompanied_community_engagement_status') {
    return personFieldText(relation.accompanied, 'community_engagement_status');
  }
  if (field === 'companion_marital_status') {
    return personFieldText(relation.companion, 'marital_status');
  }
  if (field === 'companion_consecrated_status') {
    return personFieldText(relation.companion, 'consecrated_status');
  }
  if (field === 'companion_community_engagement_status') {
    return personFieldText(relation.companion, 'community_engagement_status');
  }
  return '';
}

function compareCompanionshipRelations(
  left: CompanionshipRelationListItem,
  right: CompanionshipRelationListItem,
  sortField: CompanionshipRelationListSortField,
  direction: CompanionshipRelationListSortDirection = 'asc'
): number {
  const leftKey = companionshipRelationSortKey(left, sortField);
  const rightKey = companionshipRelationSortKey(right, sortField);

  if (leftKey === '' && rightKey !== '') {
    return 1;
  }
  if (rightKey === '' && leftKey !== '') {
    return -1;
  }

  const byField = leftKey.localeCompare(rightKey, 'pl');
  const directed = direction === 'desc' ? -byField : byField;
  if (directed !== 0) {
    return directed;
  }

  return accompaniedFullName(left).localeCompare(accompaniedFullName(right), 'pl');
}

export function sortCompanionshipRelations(
  relations: CompanionshipRelationListItem[],
  sortField: CompanionshipRelationListSortField,
  direction: CompanionshipRelationListSortDirection = 'asc'
): CompanionshipRelationListItem[] {
  return [...relations].sort((left, right) =>
    compareCompanionshipRelations(left, right, sortField, direction)
  );
}

export function nextCompanionshipRelationListSort(
  currentField: CompanionshipRelationListSortField,
  currentDirection: CompanionshipRelationListSortDirection,
  nextField: CompanionshipRelationListSortField
): {
  sortField: CompanionshipRelationListSortField;
  sortDirection: CompanionshipRelationListSortDirection;
} {
  if (currentField === nextField) {
    return {
      sortField: currentField,
      sortDirection: currentDirection === 'asc' ? 'desc' : 'asc',
    };
  }

  return { sortField: nextField, sortDirection: 'asc' };
}

export function toggleCompanionshipRelationListAkompaniamentExtraField(
  extras: CompanionshipRelationListAkompaniamentExtraField[],
  field: CompanionshipRelationListAkompaniamentExtraField
): CompanionshipRelationListAkompaniamentExtraField[] {
  if (extras.includes(field)) {
    return extras.filter((extra) => extra !== field);
  }
  return [...extras, field];
}

export function toggleCompanionshipRelationListPersonExtraField(
  extras: CompanionshipRelationListPersonExtraField[],
  field: CompanionshipRelationListPersonExtraField
): CompanionshipRelationListPersonExtraField[] {
  if (extras.includes(field)) {
    return extras.filter((extra) => extra !== field);
  }
  return [...extras, field];
}

// Storage keys
export const companionshipRelationListSortStorageKey =
  'emma.companionship-relation-list.sort';
export const companionshipRelationListAkompaniamentExtrasStorageKey =
  'emma.companionship-relation-list.akompaniament-extras';
export const companionshipRelationListAccompaniedExtrasStorageKey =
  'emma.companionship-relation-list.accompanied-extras';
export const companionshipRelationListCompanionExtrasStorageKey =
  'emma.companionship-relation-list.companion-extras';

// Sort storage functions
export function companionshipRelationListSortFromStoredValue(
  stored: string | null
): CompanionshipRelationListSort {
  if (stored == null) {
    return defaultCompanionshipRelationListSort;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return defaultCompanionshipRelationListSort;
    }

    const { sortField, sortDirection } = parsed as {
      sortField?: unknown;
      sortDirection?: unknown;
    };
    const fieldIsKnown = (
      companionshipRelationListSortFields as readonly string[]
    ).includes(sortField as string);
    const directionIsKnown =
      sortDirection === 'asc' || sortDirection === 'desc';

    if (!fieldIsKnown || !directionIsKnown) {
      return defaultCompanionshipRelationListSort;
    }

    return {
      sortField: sortField as CompanionshipRelationListSortField,
      sortDirection,
    };
  } catch {
    return defaultCompanionshipRelationListSort;
  }
}

export function readStoredCompanionshipRelationListSort(
  storage: Pick<Storage, 'getItem'> | null
): CompanionshipRelationListSort {
  if (!storage) {
    return defaultCompanionshipRelationListSort;
  }

  return companionshipRelationListSortFromStoredValue(
    storage.getItem(companionshipRelationListSortStorageKey)
  );
}

export function storeCompanionshipRelationListSort(
  sort: CompanionshipRelationListSort,
  storage: Pick<Storage, 'setItem'> | null
): void {
  storage?.setItem(
    companionshipRelationListSortStorageKey,
    JSON.stringify(sort)
  );
}

// Akompaniament extras storage functions
function akompaniamentExtrasFromStoredValue(
  stored: string | null
): CompanionshipRelationListAkompaniamentExtraField[] {
  if (stored == null) {
    return defaultCompanionshipRelationListAkompaniamentExtras;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return defaultCompanionshipRelationListAkompaniamentExtras;
    }

    const extras = parsed.filter(
      (
        field
      ): field is CompanionshipRelationListAkompaniamentExtraField =>
        (
          companionshipRelationListAkompaniamentExtraFields as readonly string[]
        ).includes(field)
    );

    if (parsed.length > 0 && extras.length === 0) {
      return defaultCompanionshipRelationListAkompaniamentExtras;
    }

    return extras;
  } catch {
    return defaultCompanionshipRelationListAkompaniamentExtras;
  }
}

export function readStoredCompanionshipRelationListAkompaniamentExtras(
  storage: Pick<Storage, 'getItem'> | null
): CompanionshipRelationListAkompaniamentExtraField[] {
  if (!storage) {
    return defaultCompanionshipRelationListAkompaniamentExtras;
  }

  return akompaniamentExtrasFromStoredValue(
    storage.getItem(companionshipRelationListAkompaniamentExtrasStorageKey)
  );
}

export function storeCompanionshipRelationListAkompaniamentExtras(
  extras: CompanionshipRelationListAkompaniamentExtraField[],
  storage: Pick<Storage, 'setItem'> | null
): void {
  storage?.setItem(
    companionshipRelationListAkompaniamentExtrasStorageKey,
    JSON.stringify(extras)
  );
}

// Person extras storage functions
function personExtrasFromStoredValue(
  stored: string | null,
  defaultValue: CompanionshipRelationListPersonExtraField[]
): CompanionshipRelationListPersonExtraField[] {
  if (stored == null) {
    return defaultValue;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return defaultValue;
    }

    const extras = parsed.filter(
      (field): field is CompanionshipRelationListPersonExtraField =>
        (
          companionshipRelationListPersonExtraFields as readonly string[]
        ).includes(field)
    );

    if (parsed.length > 0 && extras.length === 0) {
      return defaultValue;
    }

    return extras;
  } catch {
    return defaultValue;
  }
}

export function readStoredCompanionshipRelationListAccompaniedExtras(
  storage: Pick<Storage, 'getItem'> | null
): CompanionshipRelationListPersonExtraField[] {
  if (!storage) {
    return defaultCompanionshipRelationListAccompaniedExtras;
  }

  return personExtrasFromStoredValue(
    storage.getItem(companionshipRelationListAccompaniedExtrasStorageKey),
    defaultCompanionshipRelationListAccompaniedExtras
  );
}

export function storeCompanionshipRelationListAccompaniedExtras(
  extras: CompanionshipRelationListPersonExtraField[],
  storage: Pick<Storage, 'setItem'> | null
): void {
  storage?.setItem(
    companionshipRelationListAccompaniedExtrasStorageKey,
    JSON.stringify(extras)
  );
}

export function readStoredCompanionshipRelationListCompanionExtras(
  storage: Pick<Storage, 'getItem'> | null
): CompanionshipRelationListPersonExtraField[] {
  if (!storage) {
    return defaultCompanionshipRelationListCompanionExtras;
  }

  return personExtrasFromStoredValue(
    storage.getItem(companionshipRelationListCompanionExtrasStorageKey),
    defaultCompanionshipRelationListCompanionExtras
  );
}

export function storeCompanionshipRelationListCompanionExtras(
  extras: CompanionshipRelationListPersonExtraField[],
  storage: Pick<Storage, 'setItem'> | null
): void {
  storage?.setItem(
    companionshipRelationListCompanionExtrasStorageKey,
    JSON.stringify(extras)
  );
}

