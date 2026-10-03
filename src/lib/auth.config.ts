import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js inbound adapter (no Postgres).
 * Google is the OAuth provider wired today. The JWT already carries memberId / is_active.
 *
 * When NEXT_PUBLIC_DEV_BYPASS_AUTH=true a Credentials provider is added so LAN testers
 * can sign in without going through Google OAuth.
 */
const devCredentialsProviders = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'
  && process.env.NODE_ENV !== 'production'
  ? [
      Credentials({
        id: 'dev-cd1',
        credentials: {},
        authorize: () => ({
          id: 'dev-user-cd1',
          email: process.env.DEV_CD1_EMAIL ?? 'cd1@localhost',
          name: process.env.DEV_CD1_NAME ?? 'Dev CD1',
        }),
      }),
      Credentials({
        id: 'dev-cd2',
        credentials: {},
        authorize: () => ({
          id: 'dev-user-cd2',
          email: process.env.DEV_CD2_EMAIL ?? 'cd2@localhost',
          name: process.env.DEV_CD2_NAME ?? 'Dev CD2',
        }),
      }),
    ]
  : [];

export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    ...devCredentialsProviders,
  ],
  callbacks: {
    session({ session, token }) {
      session.user.memberId = token.memberId;
      session.user.is_active = token.is_active;
      session.user.image = token.picture;
      return session;
    },
  },
} satisfies NextAuthConfig;
