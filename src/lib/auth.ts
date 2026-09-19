import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import {
  findOrCreateGoogleMember,
  memberMayUseApp,
  parseGoogleProfile,
} from '@/lib/google-member';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
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
    session({ session, token }) {
      session.user.memberId = token.memberId;
      session.user.is_active = token.is_active;
      return session;
    },
  },
});
