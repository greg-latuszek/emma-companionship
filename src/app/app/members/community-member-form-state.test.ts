import { describe, expect, it } from 'vitest';
import { communityMemberFormValuesFromForm } from './community-member-form-state';

function aMemberForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.set('first_name', 'Ada');
  form.set('last_name', 'Lovelace');
  form.set('gender', '');
  form.set('marital_status', '');
  form.set('consecrated_status', 'priest');
  form.set('community_engagement_status', '');
  form.set('accompanying_readiness', 'Not Candidate');
  form.set('email', '');
  form.set('phone', '');
  form.set('notes', '');
  for (const [name, value] of Object.entries(overrides)) {
    form.set(name, value);
  }
  return form;
}

describe('communityMemberFormValuesFromForm', () => {
  it('communityMemberFormValuesFromForm keeps consecrated status when marital status is consecrated', () => {
    const values = communityMemberFormValuesFromForm(
      aMemberForm({ marital_status: 'consecrated', consecrated_status: 'sister' })
    );

    expect(values.consecrated_status).toBe('sister');
  });

  it('communityMemberFormValuesFromForm drops consecrated status when marital status is not consecrated', () => {
    const values = communityMemberFormValuesFromForm(
      aMemberForm({ marital_status: 'married', consecrated_status: 'priest' })
    );

    expect(values.consecrated_status).toBe('');
  });
});
