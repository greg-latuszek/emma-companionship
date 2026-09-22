import { beforeEach, describe, expect, it, vi } from 'vitest';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  LoginMemberNotFound,
  updateMemberVisualStyle,
} from '@/application/update-member-visual-style';
import { MemberId } from '@/types/auth';
import { submitMemberVisualStyle } from './actions';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/application/update-member-visual-style', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/application/update-member-visual-style')>();
  return {
    ...actual,
    updateMemberVisualStyle: vi.fn(),
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const memberId = MemberId('member-1');

function aVisualStyleForm(visualStyle: string): FormData {
  const form = new FormData();
  form.set('visual_style', visualStyle);
  return form;
}

function aSignedInSession() {
  return {
    user: { memberId, email: 'ada@example.com' },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

describe('submitMemberVisualStyle', () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(updateMemberVisualStyle).mockReset();
    vi.mocked(revalidatePath).mockReset();
  });

  it('submitMemberVisualStyle stores high-contrast for the signed-in login member', async () => {
    vi.mocked(auth).mockResolvedValue(aSignedInSession() as never);
    vi.mocked(updateMemberVisualStyle).mockResolvedValue({} as never);

    await submitMemberVisualStyle(undefined, aVisualStyleForm('high-contrast'));

    expect(updateMemberVisualStyle).toHaveBeenCalledWith(memberId, 'high-contrast');
    expect(revalidatePath).toHaveBeenCalledWith('/app', 'layout');
  });

  it('submitMemberVisualStyle stores an empty visual_style when they choose the default', async () => {
    vi.mocked(auth).mockResolvedValue(aSignedInSession() as never);
    vi.mocked(updateMemberVisualStyle).mockResolvedValue({} as never);

    await submitMemberVisualStyle(undefined, aVisualStyleForm('semi-transparent'));

    expect(updateMemberVisualStyle).toHaveBeenCalledWith(memberId, null);
    expect(revalidatePath).toHaveBeenCalledWith('/app', 'layout');
  });

  it('submitMemberVisualStyle asks them to choose a visual style the form offers', async () => {
    vi.mocked(auth).mockResolvedValue(aSignedInSession() as never);

    const state = await submitMemberVisualStyle(
      undefined,
      aVisualStyleForm('neon')
    );

    expect(state.formError).toBe('Wybierz wygląd.');
    expect(updateMemberVisualStyle).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('submitMemberVisualStyle asks them to sign in again when the session has no login member', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: 'ada@example.com' },
      expires: '2099-01-01T00:00:00.000Z',
    } as never);

    const state = await submitMemberVisualStyle(
      undefined,
      aVisualStyleForm('high-contrast')
    );

    expect(state.formError).toBe('Zaloguj się ponownie, aby zmienić wygląd.');
    expect(updateMemberVisualStyle).not.toHaveBeenCalled();
  });

  it('submitMemberVisualStyle tells them the look could not be saved when the login member is missing', async () => {
    vi.mocked(auth).mockResolvedValue(aSignedInSession() as never);
    vi.mocked(updateMemberVisualStyle).mockRejectedValue(
      new LoginMemberNotFound(memberId)
    );

    const state = await submitMemberVisualStyle(
      undefined,
      aVisualStyleForm('high-contrast')
    );

    expect(state.formError).toBe('Zaloguj się ponownie, aby zmienić wygląd.');
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
