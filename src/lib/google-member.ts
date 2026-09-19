import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import { oauthProfileSchema, type OAuthProfile } from '@/schemas/auth';
import type { Member } from '@/types/auth';

function splitDisplayName(name: string | undefined): {
  first_name: string;
  last_name: string;
} {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) {
    return { first_name: 'Unknown', last_name: 'User' };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: parts[0] };
  }
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

export function parseGoogleProfile(input: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): OAuthProfile | null {
  const parsed = oauthProfileSchema.safeParse({
    id: input.id,
    name: input.name ?? undefined,
    email: input.email ?? undefined,
    image: input.image ?? null,
  });
  if (parsed.success) {
    return parsed.data;
  }

  const withoutImage = oauthProfileSchema.safeParse({
    id: input.id,
    name: input.name ?? undefined,
    email: input.email ?? undefined,
    image: null,
  });
  return withoutImage.success ? withoutImage.data : null;
}

/**
 * Find an existing Google app_user, or create a pending one.
 * is_active on the returned member is the SQL column; callers apply revoked_at.
 */
export async function findOrCreateGoogleMember(profile: OAuthProfile): Promise<Member | null> {
  if (!profile.email) {
    return null;
  }

  startDatabasePool();
  const members = getRepositoryContainer().getMemberRepository();

  const byOAuth = await members.findMemberByOAuth('google', profile.id);
  if (byOAuth) {
    return byOAuth;
  }

  const byEmail = await members.findMemberByEmail(profile.email);
  if (byEmail) {
    return byEmail;
  }

  const { first_name, last_name } = splitDisplayName(profile.name);
  return members.createMember({
    first_name,
    last_name,
    email: profile.email,
    oauth_provider: 'google',
    oauth_id: profile.id,
    profile_picture: profile.image,
  });
}

export function memberMayUseApp(member: Member): boolean {
  return member.is_active && member.revoked_at == null;
}
