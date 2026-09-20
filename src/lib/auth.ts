import NextAuth from 'next-auth';
import {
  findOrCreateGoogleMember,
  memberMayUseApp,
  parseGoogleProfile,
} from '@/lib/google-member';
import { authConfig } from '@/lib/auth.config';
import { reportAuthJsFailure } from '@/lib/unavailable-database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    error: '/auth/error',
  },
  logger: {
    error(error) {
      reportAuthJsFailure(error);
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') {
        return false;
      }

      const parsed = parseGoogleProfile({
        id: account.providerAccountId,
        name: profile?.name,
        email: profile?.email,
        image: typeof profile?.picture === 'string' ? profile.picture : null,
      });

      return parsed !== null && Boolean(parsed.email);
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile) {
        const parsed = parseGoogleProfile({
          id: account.providerAccountId,
          name: profile.name,
          email: profile.email,
          image: typeof profile.picture === 'string' ? profile.picture : null,
        });
        if (!parsed) {
          return token;
        }

        const member = await findOrCreateGoogleMember(parsed);
        if (member) {
          token.memberId = member.id;
          token.is_active = memberMayUseApp(member);
        }
      }

      return token;
    },
  },
});
