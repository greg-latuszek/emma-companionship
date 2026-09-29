import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

export const companionshipRelationListSortFields = [
  'accompanied',
  'companion',
  'start_date',
  'status',
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

export const companionshipRelationListFieldLabels: Record<
  CompanionshipRelationListSortField,
  string
> = {
  accompanied: 'Akompaniowany',
  companion: 'Akompaniator',
  start_date: 'Data rozpoczęcia',
  status: 'Status',
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

export function companionshipRelationSortKey(
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
    return relation.status;
  }
  return '';
}

export function compareCompanionshipRelations(
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

  // Tie-breaker: sort by accompanied person's full name
  return accompaniedFullName(left).localeCompare(
    accompaniedFullName(right),
    'pl'
  );
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

export const companionshipRelationListSortStorageKey =
  'emma.companionship-relation-list.sort';

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
