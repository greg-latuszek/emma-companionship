import { describe, expect, it } from 'vitest';
import {
  companionshipChooseFromFindHref,
  companionshipFindHref,
  companionshipFindReturnHref,
  newCompanionshipFindFormValues,
  proposedCompanionshipChoiceFromValue,
  proposedCompanionshipChoiceValue,
} from './companionship-find-form-state';

describe('companionshipFindHref', () => {
  it('companionshipFindHref opens the Find tab alone', () => {
    expect(companionshipFindHref()).toBe('/app/companionships?tab=find');
  });

  it('companionshipFindHref keeps the Accompanied id when refreshing proposals', () => {
    expect(companionshipFindHref('acc-1')).toBe(
      '/app/companionships?tab=find&accompanied=acc-1'
    );
  });
});

describe('companionshipFindReturnHref', () => {
  it('companionshipFindReturnHref prefers the change-companion entry over Accompanied id', () => {
    expect(
      companionshipFindReturnHref({
        accompaniedId: 'acc-1',
        changeRelationId: 'rel-1',
      })
    ).toBe('/app/companionships?tab=find&change=rel-1');
  });
});

describe('companionshipChooseFromFindHref', () => {
  it('companionshipChooseFromFindHref hands a person proposal to Add Companionship', () => {
    expect(
      companionshipChooseFromFindHref({
        accompaniedKind: 'person',
        accompaniedId: 'a1',
        companionKind: 'person',
        companionId: 'c1',
        proposalId: 'p1',
      })
    ).toBe(
      '/app/companionships?tab=new&from=find&accompanied_kind=person&accompanied=a1&companion_kind=person&companion=c1&proposal=p1'
    );
  });
});

describe('newCompanionshipFindFormValues', () => {
  it('newCompanionshipFindFormValues prefills Accompanied and leaves the proposed companion empty', () => {
    expect(
      newCompanionshipFindFormValues('a1', [
        {
          kind: 'person',
          id: 'a1',
          label: 'Lis, Marek',
          gender: 'male',
        },
      ])
    ).toEqual({
      accompanied_kind: 'person',
      accompanied_id: 'a1',
      companion_kind: '',
      companion_id: '',
    });
  });
});

describe('proposedCompanionshipChoiceValue', () => {
  it('proposedCompanionshipChoiceFromValue restores the selected radio choice', () => {
    const choice = {
      kind: 'person' as const,
      relationId: 'p1',
      label: 'Nowak, Piotr',
      companionId: 'c1',
    };
    const value = proposedCompanionshipChoiceValue(choice);
    expect(proposedCompanionshipChoiceFromValue(value, [choice])).toEqual(
      choice
    );
  });
});
