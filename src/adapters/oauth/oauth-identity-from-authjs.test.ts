import { describe, expect, it } from 'vitest';
import { oauthIdentityFromAuthJs } from '@/adapters/oauth/oauth-identity-from-authjs';

describe('oauthIdentityFromAuthJs', () => {
  it('oauthIdentityFromAuthJs maps a Google Auth.js callback onto an OAuth identity', () => {
    const identity = oauthIdentityFromAuthJs({
      provider: 'google',
      providerAccountId: 'google-id-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      picture: 'https://example.com/ada.png',
    });

    expect(identity).toEqual({
      provider: 'google',
      subject: 'google-id-1',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      picture: 'https://example.com/ada.png',
    });
  });

  it('oauthIdentityFromAuthJs ignores a provider that has no mapper yet', () => {
    expect(
      oauthIdentityFromAuthJs({
        provider: 'github',
        providerAccountId: 'gh-1',
        email: 'ada@example.com',
      })
    ).toBeNull();
  });
});
