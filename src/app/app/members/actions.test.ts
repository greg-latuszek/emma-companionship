import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCommunityMember,
  DuplicateCommunityMemberEmail,
} from '@/application/add-community-member';
import {
  CommunityMemberNotFound,
  updateCommunityMember,
} from '@/application/update-community-member';
import { MemberId } from '@/types/auth';
import { redirect } from 'next/navigation';
import { submitCommunityMemberEdits, submitNewCommunityMember } from './actions';

vi.mock('@/application/add-community-member', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/application/add-community-member')>();
  return {
    ...actual,
    addCommunityMember: vi.fn(),
  };
});

vi.mock('@/application/update-community-member', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/application/update-community-member')>();
  return {
    ...actual,
    updateCommunityMember: vi.fn(),
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
    vi.mocked(updateCommunityMember).mockReset();
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

describe('submitCommunityMemberEdits', () => {
  beforeEach(() => {
    vi.mocked(updateCommunityMember).mockReset();
    vi.mocked(redirect).mockReset();
  });

  it('submitCommunityMemberEdits asks the Delegate for a first name when it is blank', async () => {
    const state = await submitCommunityMemberEdits(
      'member-1',
      undefined,
      aNewPersonForm({ first_name: '   ' })
    );

    expect(state.fieldErrors?.first_name).toBe('Podaj imię.');
    expect(updateCommunityMember).not.toHaveBeenCalled();
  });

  it('submitCommunityMemberEdits tells the Delegate when the person is not in the registry', async () => {
    vi.mocked(updateCommunityMember).mockRejectedValue(
      new CommunityMemberNotFound(MemberId('missing'))
    );

    const state = await submitCommunityMemberEdits(
      'missing',
      undefined,
      aNewPersonForm()
    );

    expect(state.formError).toBe('Nie znaleziono tej osoby.');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('submitCommunityMemberEdits sends the Delegate to the list after a valid write', async () => {
    vi.mocked(updateCommunityMember).mockResolvedValue({} as never);

    await submitCommunityMemberEdits('member-1', undefined, aNewPersonForm({
      last_name: 'Byron',
    }));

    expect(updateCommunityMember).toHaveBeenCalledWith(
      MemberId('member-1'),
      expect.objectContaining({ last_name: 'Byron' })
    );
    expect(redirect).toHaveBeenCalledWith('/app/members');
  });
});
