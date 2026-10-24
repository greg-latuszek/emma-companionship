import { describe, expect, it, vi } from 'vitest';
import {
  groupCompanionLoads,
  listCompanionLoads,
  OVERWHELMED_COMPANION_LOAD,
} from '@/application/list-companion-loads';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import { MemberId } from '@/types/auth';
import type {
  CompanionshipRelationListItem,
  CompanionshipRelationParticipant,
  CompanionshipRelationStatus,
} from '@/types/companionship-relation';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';

const english = 'en-GB';

function aPerson(
  id: string,
  firstName: string,
  lastName: string
): CompanionshipRelationParticipant {
  return {
    id: MemberId(id),
    first_name: firstName,
    last_name: lastName,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}

function aSpouse(
  id: string,
  firstName: string,
  lastName: string,
  gender: CoupleParticipant['gender']
): CoupleParticipant {
  return {
    id: MemberId(id),
    first_name: firstName,
    last_name: lastName,
    gender,
    email: null,
    phone: null,
    notes: null,
  };
}

function aCouple(
  id: string,
  husband: CoupleParticipant,
  wife: CoupleParticipant
): CoupleListItem {
  return { id, husband, wife };
}

function accompanies(
  companion: CompanionshipRelationParticipant,
  accompanied: CompanionshipRelationParticipant,
  status: CompanionshipRelationStatus = 'active'
): CompanionshipRelationListItem {
  return {
    id: `${companion.id}-${accompanied.id}`,
    companion,
    accompanied,
    status,
    start_date: '2024-01-10',
    end_date: null,
    notes: null,
  };
}

function peopleNamed(lastNames: string[]): CompanionshipRelationParticipant[] {
  return lastNames.map((lastName) => aPerson(`person-${lastName}`, 'Adam', lastName));
}

const nowakJan = aPerson('nowak-jan', 'Jan', 'Nowak');
const nowakAnna = aPerson('nowak-anna', 'Anna', 'Nowak');
const nowakCouple = aCouple(
  'couple-nowak',
  aSpouse('nowak-jan', 'Jan', 'Nowak', 'male'),
  aSpouse('nowak-anna', 'Anna', 'Nowak', 'female')
);

const kowalskiPiotr = aPerson('kowalski-piotr', 'Piotr', 'Kowalski');
const kowalskaMaria = aPerson('kowalska-maria', 'Maria', 'Kowalska');
const kowalskiCouple = aCouple(
  'couple-kowalski',
  aSpouse('kowalski-piotr', 'Piotr', 'Kowalski', 'male'),
  aSpouse('kowalska-maria', 'Maria', 'Kowalska', 'female')
);

describe('groupCompanionLoads', () => {
  it('groupCompanionLoads counts one Accompanied per active relation of a person Companion', () => {
    const [zielinski, malinowski] = peopleNamed(['Zieliński', 'Malinowski']);
    const relations = [
      accompanies(nowakJan, zielinski),
      accompanies(nowakJan, malinowski),
    ];

    const loads = groupCompanionLoads(relations, [], english);

    expect(loads).toHaveLength(1);
    expect(loads[0]).toMatchObject({
      kind: 'person',
      label: 'Nowak Jan',
      load: 2,
    });
  });

  it('groupCompanionLoads marks a Companion overwhelmed when the number of Accompanied reaches the limit', () => {
    const relations = peopleNamed(['A', 'B', 'C', 'D']).map((accompanied) =>
      accompanies(nowakJan, accompanied)
    );

    const [load] = groupCompanionLoads(relations, [], english);

    expect(load.load).toBe(OVERWHELMED_COMPANION_LOAD);
    expect(load.isOverwhelmed).toBe(true);
  });

  it('groupCompanionLoads does not mark a Companion one Accompanied below the limit', () => {
    const relations = peopleNamed(['A', 'B', 'C']).map((accompanied) =>
      accompanies(nowakJan, accompanied)
    );

    const [load] = groupCompanionLoads(relations, [], english);

    expect(load.load).toBe(OVERWHELMED_COMPANION_LOAD - 1);
    expect(load.isOverwhelmed).toBe(false);
  });

  it('groupCompanionLoads ignores archived and proposed relations', () => {
    const [zielinski, malinowski, wisniewski] = peopleNamed([
      'Zieliński',
      'Malinowski',
      'Wiśniewski',
    ]);
    const relations = [
      accompanies(nowakJan, zielinski),
      accompanies(nowakJan, malinowski, 'archived'),
      accompanies(nowakJan, wisniewski, 'proposed'),
    ];

    const [load] = groupCompanionLoads(relations, [], english);

    expect(load.load).toBe(1);
  });

  it('groupCompanionLoads shows a Companion couple as one row when both spouses accompany someone', () => {
    const [zielinski, malinowski] = peopleNamed(['Zieliński', 'Malinowski']);
    const relations = [
      accompanies(nowakJan, zielinski),
      accompanies(nowakAnna, malinowski),
    ];

    const loads = groupCompanionLoads(relations, [nowakCouple], english);

    expect(loads).toHaveLength(1);
    expect(loads[0]).toMatchObject({
      kind: 'couple',
      label: 'Nowak, Jan + Anna',
      load: 2,
    });
  });

  it('groupCompanionLoads counts an Accompanied couple once for a Companion couple', () => {
    const relations = [
      accompanies(nowakJan, kowalskiPiotr),
      accompanies(nowakAnna, kowalskaMaria),
    ];

    const [load] = groupCompanionLoads(relations, [nowakCouple, kowalskiCouple], english);

    expect(load.load).toBe(1);
    expect(load.accompanied).toEqual([
      { label: 'Kowalski, Piotr + Maria', lastName: 'Kowalski' },
    ]);
  });

  it('groupCompanionLoads keeps a spouse as a person row when the other spouse accompanies nobody', () => {
    const [zielinski] = peopleNamed(['Zieliński']);
    const relations = [accompanies(nowakJan, zielinski)];

    const loads = groupCompanionLoads(relations, [nowakCouple], english);

    expect(loads).toHaveLength(1);
    expect(loads[0]).toMatchObject({ kind: 'person', label: 'Nowak Jan' });
  });

  it('groupCompanionLoads sorts by load, then by the Companion last name', () => {
    const [a, b, c] = peopleNamed(['A', 'B', 'C']);
    const adamski = aPerson('adamski', 'Ewa', 'Adamski');
    const zawadzki = aPerson('zawadzki', 'Ola', 'Zawadzki');
    const relations = [
      accompanies(zawadzki, a),
      accompanies(adamski, b),
      accompanies(nowakJan, a),
      accompanies(nowakJan, b),
      accompanies(nowakJan, c),
    ];

    const loads = groupCompanionLoads(relations, [], english);

    expect(loads.map((load) => load.label)).toEqual([
      'Nowak Jan',
      'Adamski Ewa',
      'Zawadzki Ola',
    ]);
  });

  it('groupCompanionLoads sorts Companion names by the rules of the chosen language', () => {
    const ostberg = aPerson('ostberg', 'Ola', 'Östberg');
    const zawadzki = aPerson('zawadzki', 'Ola', 'Zawadzki');
    const [a] = peopleNamed(['A']);
    const relations = [accompanies(zawadzki, a), accompanies(ostberg, a)];

    const german = groupCompanionLoads(relations, [], 'de-DE');
    const swedish = groupCompanionLoads(relations, [], 'sv-SE');

    expect(german.map((load) => load.lastName)).toEqual(['Östberg', 'Zawadzki']);
    expect(swedish.map((load) => load.lastName)).toEqual(['Zawadzki', 'Östberg']);
  });

  it('groupCompanionLoads lists the Accompanied last names alphabetically, one per couple', () => {
    const [zielinski, malinowski] = peopleNamed(['Zieliński', 'Malinowski']);
    const relations = [
      accompanies(nowakJan, zielinski),
      accompanies(nowakJan, kowalskiPiotr),
      accompanies(nowakJan, kowalskaMaria),
      accompanies(nowakJan, malinowski),
    ];

    const [load] = groupCompanionLoads(relations, [kowalskiCouple], english);

    expect(load.accompanied.map((unit) => unit.lastName)).toEqual([
      'Kowalski',
      'Malinowski',
      'Zieliński',
    ]);
  });

  it('groupCompanionLoads gives each Accompanied a full label, in couple form for a couple', () => {
    const [zielinski] = peopleNamed(['Zieliński']);
    const relations = [
      accompanies(nowakJan, zielinski),
      accompanies(nowakJan, kowalskiPiotr),
      accompanies(nowakJan, kowalskaMaria),
    ];

    const [load] = groupCompanionLoads(relations, [kowalskiCouple], english);

    expect(load.accompanied.map((unit) => unit.label)).toEqual([
      'Kowalski, Piotr + Maria',
      'Zieliński Adam',
    ]);
  });

  it('groupCompanionLoads returns nothing when there are no active relations', () => {
    expect(groupCompanionLoads([], [nowakCouple], english)).toEqual([]);
  });
});

describe('OVERWHELMED_COMPANION_LOAD', () => {
  it('OVERWHELMED_COMPANION_LOAD is four', () => {
    expect(OVERWHELMED_COMPANION_LOAD).toBe(4);
  });
});

describe('listCompanionLoads', () => {
  it('listCompanionLoads reads active relations and couples and groups them', async () => {
    const relations = {
      listCompanionshipRelations: vi
        .fn()
        .mockResolvedValue([
          accompanies(nowakJan, kowalskiPiotr),
          accompanies(nowakAnna, kowalskaMaria),
        ]),
    } as unknown as ICompanionshipRelationRepository;
    const couples = {
      listCouples: vi.fn().mockResolvedValue([nowakCouple, kowalskiCouple]),
    } as unknown as ICoupleRepository;

    const loads = await listCompanionLoads(english, relations, couples);

    expect(loads).toHaveLength(1);
    expect(loads[0]).toMatchObject({ label: 'Nowak, Jan + Anna', load: 1 });
  });
});
