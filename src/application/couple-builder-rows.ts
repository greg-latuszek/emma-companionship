/**
 * Couple-builder row proposals from unpaired married people.
 * Auto-pair only when a surname match-group has exactly one male and one female.
 */

import type { MarriedPersonWithoutCouple } from '@/types/couple';

export type CoupleBuilderRow = {
  husbandId: string | null;
  wifeId: string | null;
};

export function normalizeCoupleSurname(lastName: string): string {
  return lastName.trim().toLocaleLowerCase('pl');
}

/**
 * Surnames match when equal after lowercasing, or they share the same stem
 * and differ only by the final letter (Polish -ski/-ska style).
 */
export function surnamesMatchForCoupleProposal(
  leftLastName: string,
  rightLastName: string
): boolean {
  const left = normalizeCoupleSurname(leftLastName);
  const right = normalizeCoupleSurname(rightLastName);
  if (left.length === 0 || right.length === 0) {
    return false;
  }
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  return left.slice(0, -1) === right.slice(0, -1);
}

export function coupleRejectedPairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

function sortKeyForPerson(person: MarriedPersonWithoutCouple): string {
  return `${normalizeCoupleSurname(person.last_name)}\0${person.first_name.toLocaleLowerCase('pl')}`;
}

function sortKeyForRow(
  row: CoupleBuilderRow,
  peopleById: Map<string, MarriedPersonWithoutCouple>
): string {
  const husband = row.husbandId ? peopleById.get(row.husbandId) : undefined;
  const wife = row.wifeId ? peopleById.get(row.wifeId) : undefined;
  if (husband && wife) {
    return `${sortKeyForPerson(husband)}\0${sortKeyForPerson(wife)}`;
  }
  if (husband) {
    return sortKeyForPerson(husband);
  }
  if (wife) {
    return sortKeyForPerson(wife);
  }
  return '';
}

function surnameMatchGroups(
  people: MarriedPersonWithoutCouple[]
): MarriedPersonWithoutCouple[][] {
  const assigned = new Set<string>();
  const groups: MarriedPersonWithoutCouple[][] = [];

  for (const person of people) {
    if (assigned.has(person.id)) {
      continue;
    }

    const group: MarriedPersonWithoutCouple[] = [];
    const queue = [person];
    assigned.add(person.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      group.push(current);
      for (const candidate of people) {
        if (assigned.has(candidate.id)) {
          continue;
        }
        if (
          surnamesMatchForCoupleProposal(current.last_name, candidate.last_name)
        ) {
          assigned.add(candidate.id);
          queue.push(candidate);
        }
      }
    }

    groups.push(group);
  }

  return groups;
}

/**
 * Build initial builder rows: auto-pair exact 1♂+1♀ surname groups unless rejected;
 * everyone else is a single-side row. Sorted by last name.
 */
export function proposeCoupleBuilderRows(
  people: MarriedPersonWithoutCouple[],
  rejectedPairKeys: ReadonlySet<string> = new Set()
): CoupleBuilderRow[] {
  const peopleById = new Map(
    people.map((person) => [person.id as string, person])
  );
  const rows: CoupleBuilderRow[] = [];

  for (const group of surnameMatchGroups(people)) {
    const men = group.filter((person) => person.gender === 'male');
    const women = group.filter((person) => person.gender === 'female');

    if (
      men.length === 1 &&
      women.length === 1 &&
      !rejectedPairKeys.has(coupleRejectedPairKey(men[0].id, women[0].id))
    ) {
      rows.push({ husbandId: men[0].id, wifeId: women[0].id });
      continue;
    }

    for (const man of men) {
      rows.push({ husbandId: man.id, wifeId: null });
    }
    for (const woman of women) {
      rows.push({ husbandId: null, wifeId: woman.id });
    }
  }

  return rows.sort((left, right) =>
    sortKeyForRow(left, peopleById).localeCompare(
      sortKeyForRow(right, peopleById),
      'pl'
    )
  );
}

/**
 * Reconcile a saved draft with the current unpaired pool.
 * People who left the pool drop out; people new to the pool are auto-matched
 * among themselves (honouring rejected pairs). Existing draft rows for people
 * still in the pool are kept.
 */
export function reconcileCoupleBuilderDraft(
  people: MarriedPersonWithoutCouple[],
  draftRows: CoupleBuilderRow[],
  rejectedPairKeys: ReadonlySet<string>
): CoupleBuilderRow[] {
  const peopleById = new Map(
    people.map((person) => [person.id as string, person])
  );
  const poolIds = new Set(people.map((person) => person.id as string));
  const placedIds = new Set<string>();
  const keptRows: CoupleBuilderRow[] = [];

  for (const row of draftRows) {
    const husbandId =
      row.husbandId && poolIds.has(row.husbandId) ? row.husbandId : null;
    const wifeId = row.wifeId && poolIds.has(row.wifeId) ? row.wifeId : null;
    if (!husbandId && !wifeId) {
      continue;
    }
    if (husbandId) {
      placedIds.add(husbandId);
    }
    if (wifeId) {
      placedIds.add(wifeId);
    }
    keptRows.push({ husbandId, wifeId });
  }

  const newcomers = people.filter(
    (person) => !placedIds.has(person.id as string)
  );
  const newcomerRows = proposeCoupleBuilderRows(newcomers, rejectedPairKeys);

  return [...keptRows, ...newcomerRows].sort((left, right) =>
    sortKeyForRow(left, peopleById).localeCompare(
      sortKeyForRow(right, peopleById),
      'pl'
    )
  );
}

/**
 * Move a person into an empty cell. Source row shrinks or disappears.
 * Does not write to the database — confirmation still requires ✓.
 */
export function dragPersonOntoEmptyCoupleBuilderCell(
  rows: CoupleBuilderRow[],
  personId: string,
  targetRowIndex: number,
  side: 'husband' | 'wife'
): CoupleBuilderRow[] {
  if (targetRowIndex < 0 || targetRowIndex >= rows.length) {
    return rows;
  }

  const target = rows[targetRowIndex];
  if (side === 'husband' && target.husbandId != null) {
    return rows;
  }
  if (side === 'wife' && target.wifeId != null) {
    return rows;
  }

  let sourceRowIndex = -1;
  let sourceSide: 'husband' | 'wife' | null = null;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.husbandId === personId) {
      sourceRowIndex = index;
      sourceSide = 'husband';
      break;
    }
    if (row.wifeId === personId) {
      sourceRowIndex = index;
      sourceSide = 'wife';
      break;
    }
  }

  if (sourceSide == null || sourceRowIndex < 0) {
    return rows;
  }

  // Husband column only accepts a person taken from a husband cell (same for wife).
  if (sourceSide !== side) {
    return rows;
  }

  if (sourceRowIndex === targetRowIndex) {
    return rows;
  }

  const next = rows.map((row) => ({ ...row }));
  next[targetRowIndex] = {
    ...next[targetRowIndex],
    [side === 'husband' ? 'husbandId' : 'wifeId']: personId,
  };

  const source = next[sourceRowIndex];
  const clearedSource: CoupleBuilderRow = {
    husbandId: sourceSide === 'husband' ? null : source.husbandId,
    wifeId: sourceSide === 'wife' ? null : source.wifeId,
  };

  if (clearedSource.husbandId == null && clearedSource.wifeId == null) {
    next.splice(sourceRowIndex, 1);
  } else {
    next[sourceRowIndex] = clearedSource;
  }

  return next;
}

export function rejectCoupleBuilderProposal(
  rows: CoupleBuilderRow[],
  rowIndex: number
): { rows: CoupleBuilderRow[]; rejectedPairKey: string | null } {
  const row = rows[rowIndex];
  if (!row || row.husbandId == null || row.wifeId == null) {
    return { rows, rejectedPairKey: null };
  }

  const rejectedPairKey = coupleRejectedPairKey(row.husbandId, row.wifeId);
  const next = [...rows];
  next.splice(
    rowIndex,
    1,
    { husbandId: row.husbandId, wifeId: null },
    { husbandId: null, wifeId: row.wifeId }
  );
  return { rows: next, rejectedPairKey };
}

export function removeCoupleBuilderRowAfterConfirm(
  rows: CoupleBuilderRow[],
  rowIndex: number
): CoupleBuilderRow[] {
  if (rowIndex < 0 || rowIndex >= rows.length) {
    return rows;
  }
  return rows.filter((_, index) => index !== rowIndex);
}
