import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCommunityMember,
  DuplicateCommunityMemberEmail,
} from '@/application/add-community-member';
import { redirect } from 'next/navigation';
import { submitNewCommunityMember } from './actions';

vi.mock('@/application/add-community-member', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/application/add-community-member')>();
  return {
    ...actual,
    addCommunityMember: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

function aNewPersonForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.set('first_name', 'Ada');
  form.set('last_name', 'Lovelace');
  form.set('gender', '');
  form.set('marital_status', '');
  form.set('consecrated_status', '');
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

describe('submitNewCommunityMember', () => {
  beforeEach(() => {
    vi.mocked(addCommunityMember).mockReset();
    vi.mocked(redirect).mockReset();
  });

  it('submitNewCommunityMember asks the Delegate for a first name when it is blank', async () => {
    const state = await submitNewCommunityMember(
      undefined,
      aNewPersonForm({ first_name: '   ' })
    );

    expect(state.fieldErrors?.first_name).toBe('Podaj imię.');
    expect(addCommunityMember).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCommunityMember tells the Delegate the email is already in the registry', async () => {
    vi.mocked(addCommunityMember).mockRejectedValue(
      new DuplicateCommunityMemberEmail('ada@example.com')
    );

    const state = await submitNewCommunityMember(
      undefined,
      aNewPersonForm({ email: 'ada@example.com' })
    );

    expect(state.formError).toBe('Ten adres e-mail jest już w rejestrze.');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitNewCommunityMember sends the Delegate to the list after a valid write', async () => {
    vi.mocked(addCommunityMember).mockResolvedValue({} as never);

    await submitNewCommunityMember(undefined, aNewPersonForm());

    expect(addCommunityMember).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/app/members');
  });
});
