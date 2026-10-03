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
      if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'
        && (account?.provider === 'dev-cd1' || account?.provider === 'dev-cd2')) {
        return true;
      }

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
      if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'
        && (account?.provider === 'dev-cd1' || account?.provider === 'dev-cd2')) {
        const slot = account.provider === 'dev-cd1' ? 'cd1' : 'cd2';
        const email = slot === 'cd1'
          ? (process.env.DEV_CD1_EMAIL ?? 'cd1@localhost')
          : (process.env.DEV_CD2_EMAIL ?? 'cd2@localhost');
        const displayName = slot === 'cd1'
          ? (process.env.DEV_CD1_NAME ?? 'Dev CD1')
          : (process.env.DEV_CD2_NAME ?? 'Dev CD2');
        const devIdentity = { provider: 'dev', subject: `dev-user-${slot}`, email, displayName, picture: null };
        const member = await recognizeOAuthMember(devIdentity);
        if (member) {
          token.memberId = member.id;
          token.is_active = memberMayUseApp(member);
        }
        return token;
      }

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
