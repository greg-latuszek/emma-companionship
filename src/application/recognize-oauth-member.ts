import { startDatabasePool } from '@/infrastructure/db/startup';
import { getRepositoryContainer } from '@/di/RepositoryProvider';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import type { OAuthIdentity } from '@/schemas/auth';
import type { Member } from '@/types/auth';
import {
  isUnavailableDatabase,
  reportFailedOAuthMemberRecognition,
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

function currentMemberRepository(): IMemberRepository {
  startDatabasePool();
  return getRepositoryContainer().getMemberRepository();
}

/**
 * After an OAuth provider has confirmed who someone is: find that member,
 * or create a pending one. Logging them into a session stays with Auth.js.
 */
export async function recognizeOAuthMember(
  identity: OAuthIdentity,
  members: IMemberRepository = currentMemberRepository()
): Promise<Member | null> {
  if (!identity.email) {
    return null;
  }

  try {
    const byOAuth = await members.findMemberByOAuth(identity.provider, identity.subject);
    if (byOAuth) {
      return byOAuth;
    }

    const byEmail = await members.findMemberByEmail(identity.email);
    if (byEmail) {
      return byEmail;
    }

    const { first_name, last_name } = splitDisplayName(identity.displayName);
    return await members.createMember({
      first_name,
      last_name,
      email: identity.email,
      oauth_provider: identity.provider,
      oauth_id: identity.subject,
      profile_picture: identity.picture,
    });
  } catch (error) {
    reportFailedOAuthMemberRecognition(error);
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}

export function memberMayUseApp(member: Member): boolean {
  return member.is_active && member.revoked_at == null;
}
