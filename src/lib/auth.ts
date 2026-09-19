import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * Auth.js v5 — Google only.
 * memberId / is_active are reserved on the session; they are filled when
 * Google sign-in is wired to the members table.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session }) {
      return session;
    },
  },
});
