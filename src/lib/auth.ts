import NextAuth from 'next-auth';
import { recognizeOAuthMember, memberMayUseApp } from '@/application/recognize-oauth-member';
import { oauthIdentityFromAuthJs } from '@/adapters/oauth/oauth-identity-from-authjs';
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
      const identity = oauthIdentityFromAuthJs({
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
        name: profile?.name,
        email: profile?.email,
        picture: typeof profile?.picture === 'string' ? profile.picture : null,
      });

      return identity !== null && Boolean(identity.email);
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const identity = oauthIdentityFromAuthJs({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          name: profile.name,
          email: profile.email,
          picture: typeof profile.picture === 'string' ? profile.picture : null,
        });
        if (!identity) {
          return token;
        }

        const member = await recognizeOAuthMember(identity);
        if (member) {
          token.memberId = member.id;
          token.is_active = memberMayUseApp(member);
          if (member.profile_picture) {
            token.picture = member.profile_picture;
          }
        }
      }

      return token;
    },
  },
});
