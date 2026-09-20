import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js inbound adapter (no Postgres).
 * Google is the OAuth provider wired today. The JWT already carries memberId / is_active.
 */
export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
