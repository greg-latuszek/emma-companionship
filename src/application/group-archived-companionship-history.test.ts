import { describe, expect, it } from 'vitest';
import { groupArchivedCompanionshipHistory } from '@/application/group-archived-companionship-history';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';

function aParticipant(overrides: {
  id: string;
  first_name: string;
  last_name: string;
}): CompanionshipRelationListItem['accompanied'] {
  return {
    id: MemberId(overrides.id),
    first_name: overrides.first_name,
    last_name: overrides.last_name,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}

function anArchivedRelation(overrides: {
  id: string;
  accompanied: ReturnType<typeof aParticipant>;
  companion: ReturnType<typeof aParticipant>;
  start_date?: string | null;
  end_date?: string | null;
}): CompanionshipRelationListItem {
  return {
    id: overrides.id,
    accompanied: overrides.accompanied,
    companion: overrides.companion,
    status: 'archived',
    start_date: overrides.start_date ?? '2023-01-01',
    end_date: overrides.end_date ?? '2024-06-01',
    notes: null,
  };
}

function aSpouse(overrides: {
  id: string;
  first_name: string;
  last_name: string;
  gender: CoupleParticipant['gender'];
}): CoupleParticipant {
  return {
    id: MemberId(overrides.id),
    first_name: overrides.first_name,
    last_name: overrides.last_name,
    gender: overrides.gender,
    email: null,
    phone: null,
    notes: null,
  };
}

function aCouple(overrides: {
  id: string;
  husband: ReturnType<typeof aSpouse>;
  wife: ReturnType<typeof aSpouse>;
}): CoupleListItem {
  return {
    id: overrides.id,
    husband: overrides.husband,
    wife: overrides.wife,
  };
}

const kowalskiHusband = aSpouse({
  id: 'jan',
  first_name: 'Jan',
  last_name: 'Kowalski',
  gender: 'male',
});
const kowalskiWife = aSpouse({
  id: 'anna',
  first_name: 'Anna',
  last_name: 'Kowalska',
  gender: 'female',
});
const nowakHusband = aSpouse({
  id: 'piotr',
  first_name: 'Piotr',
  last_name: 'Nowak',
  gender: 'male',
});
const nowakWife = aSpouse({
  id: 'ewa',
  first_name: 'Ewa',
  last_name: 'Nowak',
  gender: 'female',
});

const kowalskiCouple = aCouple({
  id: 'couple-kowalski',
  husband: kowalskiHusband,
  wife: kowalskiWife,
});
const nowakCouple = aCouple({
  id: 'couple-nowak',
  husband: nowakHusband,
  wife: nowakWife,
});

describe('groupArchivedCompanionshipHistory', () => {
  it('groupArchivedCompanionshipHistory collapses husband and wife archived rows into one couple row when both sides are registered couples with matching dates', () => {
    const husbandRow = anArchivedRelation({
      id: 'rel-h',
      accompanied: aParticipant({
        id: 'jan',
        first_name: 'Jan',
        last_name: 'Kowalski',
      }),
      companion: aParticipant({
        id: 'piotr',
        first_name: 'Piotr',
        last_name: 'Nowak',
      }),
    });
    const wifeRow = anArchivedRelation({
      id: 'rel-w',
      accompanied: aParticipant({
        id: 'anna',
        first_name: 'Anna',
        last_name: 'Kowalska',
      }),
      companion: aParticipant({
        id: 'ewa',
        first_name: 'Ewa',
        last_name: 'Nowak',
      }),
    });

    const rows = groupArchivedCompanionshipHistory(
      [husbandRow, wifeRow],
      [kowalskiCouple, nowakCouple]
    );

    expect(rows).toEqual([
      {
        kind: 'couple',
        accompaniedLabel: 'Kowalski, Jan + Anna',
        companionLabel: 'Nowak, Piotr + Ewa',
        start_date: '2023-01-01',
        end_date: '2024-06-01',
        notes: null,
        husbandRelationId: 'rel-h',
        wifeRelationId: 'rel-w',
      },
    ]);
  });

  it('groupArchivedCompanionshipHistory keeps a person row when the accompanied member is not in the couple registry', () => {
    const relation = anArchivedRelation({
      id: 'rel-1',
      accompanied: aParticipant({
        id: 'solo',
        first_name: 'Ala',
        last_name: 'Solo',
      }),
      companion: aParticipant({
        id: 'piotr',
        first_name: 'Piotr',
        last_name: 'Nowak',
      }),
    });

    const rows = groupArchivedCompanionshipHistory([relation], [nowakCouple]);

    expect(rows).toEqual([{ kind: 'person', relation }]);
  });

  it('groupArchivedCompanionshipHistory keeps person rows when spouse archives share different end dates', () => {
    const husbandRow = anArchivedRelation({
      id: 'rel-h',
      accompanied: aParticipant({
        id: 'jan',
        first_name: 'Jan',
        last_name: 'Kowalski',
      }),
      companion: aParticipant({
        id: 'piotr',
        first_name: 'Piotr',
        last_name: 'Nowak',
      }),
      end_date: '2024-01-01',
    });
    const wifeRow = anArchivedRelation({
      id: 'rel-w',
      accompanied: aParticipant({
        id: 'anna',
        first_name: 'Anna',
        last_name: 'Kowalska',
      }),
      companion: aParticipant({
        id: 'ewa',
        first_name: 'Ewa',
        last_name: 'Nowak',
      }),
      end_date: '2024-02-01',
    });

    const rows = groupArchivedCompanionshipHistory(
      [husbandRow, wifeRow],
      [kowalskiCouple, nowakCouple]
    );

    expect(rows).toEqual([
      { kind: 'person', relation: husbandRow },
      { kind: 'person', relation: wifeRow },
    ]);
  });

  it('groupArchivedCompanionshipHistory keeps person rows when companions are not a registered couple', () => {
    const husbandRow = anArchivedRelation({
      id: 'rel-h',
      accompanied: aParticipant({
        id: 'jan',
        first_name: 'Jan',
        last_name: 'Kowalski',
      }),
      companion: aParticipant({
        id: 'piotr',
        first_name: 'Piotr',
        last_name: 'Nowak',
      }),
    });
    const wifeRow = anArchivedRelation({
      id: 'rel-w',
      accompanied: aParticipant({
        id: 'anna',
        first_name: 'Anna',
        last_name: 'Kowalska',
      }),
      companion: aParticipant({
        id: 'other',
        first_name: 'Ola',
        last_name: 'Other',
      }),
    });

    const rows = groupArchivedCompanionshipHistory(
      [husbandRow, wifeRow],
      [kowalskiCouple, nowakCouple]
    );

    expect(rows).toEqual([
      { kind: 'person', relation: husbandRow },
      { kind: 'person', relation: wifeRow },
    ]);
  });

  it('groupArchivedCompanionshipHistory keeps person rows when only one spouse has an archived relation', () => {
    const husbandRow = anArchivedRelation({
      id: 'rel-h',
      accompanied: aParticipant({
        id: 'jan',
        first_name: 'Jan',
        last_name: 'Kowalski',
      }),
      companion: aParticipant({
        id: 'piotr',
        first_name: 'Piotr',
        last_name: 'Nowak',
      }),
    });

    const rows = groupArchivedCompanionshipHistory(
      [husbandRow],
      [kowalskiCouple, nowakCouple]
    );

    expect(rows).toEqual([{ kind: 'person', relation: husbandRow }]);
  });
});
