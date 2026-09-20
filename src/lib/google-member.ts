import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import { oauthProfileSchema, type OAuthProfile } from '@/schemas/auth';
import type { Member } from '@/types/auth';
import {
  isUnavailableDatabase,
  reportFailedGoogleMemberLookup,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

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

function currentMemberRepository(): IMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getMemberRepository();
}

/** Find an existing Google app_user, or create a pending one. */
export async function findOrCreateGoogleMember(
  profile: OAuthProfile,
  members: IMemberRepository = currentMemberRepository()
): Promise<Member | null> {
  if (!profile.email) {
    return null;
  }

  try {
    const byOAuth = await members.findMemberByOAuth('google', profile.id);
    if (byOAuth) {
      return byOAuth;
    }

    const byEmail = await members.findMemberByEmail(profile.email);
    if (byEmail) {
      return byEmail;
    }

    const { first_name, last_name } = splitDisplayName(profile.name);
    return await members.createMember({
      first_name,
      last_name,
      email: profile.email,
      oauth_provider: 'google',
      oauth_id: profile.id,
      profile_picture: profile.image,
    });
  } catch (error) {
    reportFailedGoogleMemberLookup(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}

export function memberMayUseApp(member: Member): boolean {
  return member.is_active && member.revoked_at == null;
}
