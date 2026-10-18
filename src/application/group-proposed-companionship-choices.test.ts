import { describe, expect, it } from 'vitest';
import { groupProposedCompanionshipChoices } from '@/application/group-proposed-companionship-choices';
import { MemberId } from '@/types/auth';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';

function aParticipant(
  id: string,
  firstName: string,
  lastName: string
): CompanionshipRelationListItem['companion'] {
  return {
    id: MemberId(id),
    first_name: firstName,
    last_name: lastName,
    marital_status: null,
    consecrated_status: null,
    community_engagement_status: null,
  };
}

function aProposal(
  overrides: Partial<CompanionshipRelationListItem> &
    Pick<CompanionshipRelationListItem, 'id' | 'companion' | 'accompanied'>
): CompanionshipRelationListItem {
  return {
    status: 'proposed',
    start_date: null,
    end_date: null,
    notes: null,
    ...overrides,
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
  husband?: CoupleParticipant;
  wife?: CoupleParticipant;
}): CoupleListItem {
  return {
    id: overrides.id,
    husband:
      overrides.husband ??
      aSpouse({
        id: 'h1',
        first_name: 'Jan',
        last_name: 'Kowalski',
        gender: 'male',
      }),
    wife:
      overrides.wife ??
      aSpouse({
        id: 'w1',
        first_name: 'Anna',
        last_name: 'Kowalska',
        gender: 'female',
      }),
  };
}

describe('groupProposedCompanionshipChoices', () => {
  it('groupProposedCompanionshipChoices keeps a single-person proposal as one radio choice', () => {
    const proposal = aProposal({
      id: 'p1',
      companion: aParticipant('c1', 'Piotr', 'Nowak'),
      accompanied: aParticipant('a1', 'Marek', 'Lis'),
    });

    expect(groupProposedCompanionshipChoices([proposal], [])).toEqual([
      {
        kind: 'person',
        relationId: 'p1',
        label: 'Nowak, Piotr',
        companionId: 'c1',
      },
    ]);
  });

  it('groupProposedCompanionshipChoices collapses matching husband and wife proposals into one couple radio', () => {
    const accompanied = aCouple({ id: 'ac' });
    const companion = aCouple({
      id: 'cc',
      husband: aSpouse({
        id: 'ch',
        first_name: 'Adam',
        last_name: 'Bąk',
        gender: 'male',
      }),
      wife: aSpouse({
        id: 'cw',
        first_name: 'Ewa',
        last_name: 'Bąk',
        gender: 'female',
      }),
    });
    const husbandProposal = aProposal({
      id: 'ph',
      companion: aParticipant('ch', 'Adam', 'Bąk'),
      accompanied: aParticipant('h1', 'Jan', 'Kowalski'),
    });
    const wifeProposal = aProposal({
      id: 'pw',
      companion: aParticipant('cw', 'Ewa', 'Bąk'),
      accompanied: aParticipant('w1', 'Anna', 'Kowalska'),
    });

    expect(
      groupProposedCompanionshipChoices(
        [husbandProposal, wifeProposal],
        [accompanied, companion]
      )
    ).toEqual([
      {
        kind: 'couple',
        husbandRelationId: 'ph',
        wifeRelationId: 'pw',
        label: 'Bąk, Adam + Ewa',
        companionCoupleId: 'cc',
      },
    ]);
  });
});
