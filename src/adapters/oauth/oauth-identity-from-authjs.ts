import { oauthIdentitySchema, type OAuthIdentity } from '@/schemas/auth';

/**
 * Map an Auth.js OAuth callback onto the application identity.
 * Google is the only provider wired today; a new provider is another branch here.
 */
export function oauthIdentityFromAuthJs(input: {
  provider?: string | null;
  providerAccountId?: string | null;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}): OAuthIdentity | null {
  if (input.provider !== 'google') {
    return null;
  }

  return oauthIdentityFromGoogle({
    subject: input.providerAccountId,
    name: input.name,
    email: input.email,
    picture: input.picture,
  });
}

export function oauthIdentityFromGoogle(input: {
  subject?: string | null;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}): OAuthIdentity | null {
  const parsed = oauthIdentitySchema.safeParse({
    provider: 'google',
    subject: input.subject,
    displayName: input.name ?? undefined,
    email: input.email ?? undefined,
    picture: input.picture ?? null,
  });
  if (parsed.success) {
    return parsed.data;
  }

  const withoutPicture = oauthIdentitySchema.safeParse({
    provider: 'google',
    subject: input.subject,
    displayName: input.name ?? undefined,
    email: input.email ?? undefined,
    picture: null,
  });
  return withoutPicture.success ? withoutPicture.data : null;
}
