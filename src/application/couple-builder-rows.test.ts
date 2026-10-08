import { describe, expect, it } from 'vitest';
import {
  coupleRejectedPairKey,
  dragPersonOntoEmptyCoupleBuilderCell,
  proposeCoupleBuilderRows,
  reconcileCoupleBuilderDraft,
  rejectCoupleBuilderProposal,
  surnamesMatchForCoupleProposal,
} from '@/application/couple-builder-rows';
import { MemberId } from '@/types/auth';
import type { MarriedPersonWithoutCouple } from '@/types/couple';

function aPerson(overrides: {
  id: string;
  first_name: string;
  last_name: string;
  gender: MarriedPersonWithoutCouple['gender'];
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}): MarriedPersonWithoutCouple {
  return {
    email: overrides.email ?? null,
    phone: overrides.phone ?? null,
    notes: overrides.notes ?? null,
    first_name: overrides.first_name,
    last_name: overrides.last_name,
    gender: overrides.gender,
    id: MemberId(overrides.id),
  };
}

describe('surnamesMatchForCoupleProposal', () => {
  it('surnamesMatchForCoupleProposal accepts equal surnames after lowercasing', () => {
    expect(surnamesMatchForCoupleProposal('Kowalski', 'kowalski')).toBe(true);
  });

  it('surnamesMatchForCoupleProposal accepts Polish surnames that differ only by the last letter', () => {
    expect(surnamesMatchForCoupleProposal('Kowalski', 'Kowalska')).toBe(true);
  });

  it('surnamesMatchForCoupleProposal rejects surnames that differ by more than the last letter', () => {
    expect(surnamesMatchForCoupleProposal('Nowak', 'Nowacka')).toBe(false);
  });
});

describe('proposeCoupleBuilderRows', () => {
  it('proposeCoupleBuilderRows auto-pairs when a surname group has exactly one husband and one wife', () => {
    const rows = proposeCoupleBuilderRows([
      aPerson({
        id: 'm1',
        first_name: 'Jan',
        last_name: 'Kowalski',
        gender: 'male',
      }),
      aPerson({
        id: 'w1',
        first_name: 'Anna',
        last_name: 'Kowalska',
        gender: 'female',
      }),
    ]);

    expect(rows).toEqual([{ husbandId: 'm1', wifeId: 'w1' }]);
  });

  it('proposeCoupleBuilderRows leaves everyone single-sided when more than one man and one woman share a surname group', () => {
    const rows = proposeCoupleBuilderRows([
      aPerson({
        id: 'm1',
        first_name: 'Jan',
        last_name: 'Kowalski',
        gender: 'male',
      }),
      aPerson({
        id: 'm2',
        first_name: 'Piotr',
        last_name: 'Kowalski',
        gender: 'male',
      }),
      aPerson({
        id: 'w1',
        first_name: 'Anna',
        last_name: 'Kowalska',
        gender: 'female',
      }),
    ]);

    // Sorted by last name: Kowalska before Kowalski.
    expect(rows).toEqual([
      { husbandId: null, wifeId: 'w1' },
      { husbandId: 'm1', wifeId: null },
      { husbandId: 'm2', wifeId: null },
    ]);
  });

  it('proposeCoupleBuilderRows skips auto-pair when the Delegate already rejected that pair', () => {
    const rejected = new Set([coupleRejectedPairKey('m1', 'w1')]);
    const rows = proposeCoupleBuilderRows(
      [
        aPerson({
          id: 'm1',
          first_name: 'Jan',
          last_name: 'Kowalski',
          gender: 'male',
        }),
        aPerson({
          id: 'w1',
          first_name: 'Anna',
          last_name: 'Kowalska',
          gender: 'female',
        }),
      ],
      rejected
    );

    expect(rows).toEqual([
      { husbandId: null, wifeId: 'w1' },
      { husbandId: 'm1', wifeId: null },
    ]);
  });
});

describe('rejectCoupleBuilderProposal', () => {
  it('rejectCoupleBuilderProposal splits a proposal into two single-side rows and returns the rejected pair key', () => {
    const result = rejectCoupleBuilderProposal(
      [{ husbandId: 'm1', wifeId: 'w1' }],
      0
    );

    expect(result.rejectedPairKey).toBe(coupleRejectedPairKey('m1', 'w1'));
    expect(result.rows).toEqual([
      { husbandId: 'm1', wifeId: null },
      { husbandId: null, wifeId: 'w1' },
    ]);
  });
});

describe('dragPersonOntoEmptyCoupleBuilderCell', () => {
  it('dragPersonOntoEmptyCoupleBuilderCell moves a person into an empty cell and removes an emptied source row', () => {
    const rows = dragPersonOntoEmptyCoupleBuilderCell(
      [
        { husbandId: 'm1', wifeId: null },
        { husbandId: null, wifeId: 'w1' },
      ],
      'm1',
      1,
      'husband'
    );

    expect(rows).toEqual([{ husbandId: 'm1', wifeId: 'w1' }]);
  });

  it('dragPersonOntoEmptyCoupleBuilderCell leaves a single-side source when the source row still has the other spouse', () => {
    const rows = dragPersonOntoEmptyCoupleBuilderCell(
      [
        { husbandId: 'm1', wifeId: 'w2' },
        { husbandId: 'm3', wifeId: null },
      ],
      'w2',
      1,
      'wife'
    );

    expect(rows).toEqual([
      { husbandId: 'm1', wifeId: null },
      { husbandId: 'm3', wifeId: 'w2' },
    ]);
  });

  it('dragPersonOntoEmptyCoupleBuilderCell refuses to drop onto a filled cell', () => {
    const original = [
      { husbandId: 'm1', wifeId: null },
      { husbandId: 'm2', wifeId: 'w1' },
    ];

    expect(
      dragPersonOntoEmptyCoupleBuilderCell(original, 'm1', 1, 'husband')
    ).toEqual(original);
  });
});

describe('reconcileCoupleBuilderDraft', () => {
  it('reconcileCoupleBuilderDraft keeps draft rows for people still unpaired and auto-matches newcomers', () => {
    const people = [
      aPerson({
        id: 'm1',
        first_name: 'Jan',
        last_name: 'Nowak',
        gender: 'male',
      }),
      aPerson({
        id: 'w1',
        first_name: 'Anna',
        last_name: 'Nowak',
        gender: 'female',
      }),
      aPerson({
        id: 'm2',
        first_name: 'Piotr',
        last_name: 'Kowalski',
        gender: 'male',
      }),
      aPerson({
        id: 'w2',
        first_name: 'Ewa',
        last_name: 'Kowalska',
        gender: 'female',
      }),
    ];

    const rows = reconcileCoupleBuilderDraft(
      people,
      [{ husbandId: 'm1', wifeId: null }],
      new Set()
    );

    expect(rows).toContainEqual({ husbandId: 'm1', wifeId: null });
    expect(rows).toContainEqual({ husbandId: 'm2', wifeId: 'w2' });
    expect(rows).toContainEqual({ husbandId: null, wifeId: 'w1' });
  });
});
