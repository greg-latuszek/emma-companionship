import NextAuth, { DefaultSession, NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { getConfig } from '@emma/config';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

// Extend the default session type to include additional fields
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
}

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// NextAuth configuration
export const config = {
  adapter: PrismaAdapter(prisma),
  
  // Configure session strategy
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  // Configure JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'user@example.com'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Your password'
        },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedCredentials = credentialsSchema.parse(credentials);
          
          // For initial setup, we'll create a simple authentication
          // In production, this should validate against hashed passwords
          const { email, password } = validatedCredentials;
          
          // Find or create user (simplified for initial setup)
          let user = await prisma.user.findUnique({
            where: { email },
          });

          // For initial setup, create admin user if doesn't exist
          if (!user && email === 'admin@example.com' && password === 'admin123') {
            user = await prisma.user.create({
              data: {
                email,
                name: 'Administrator',
                emailVerified: new Date(),
              },
            });
          }

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user ID to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Events for logging
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in`);
    },
    async signOut({ session, token }) {
      console.log(`User ${session?.user?.email} signed out`);
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },
  },

  // Security settings
  secret: getConfig().NEXTAUTH_SECRET,
  trustHost: true,
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
  
} satisfies NextAuthConfig;

// Create the auth handlers
export const { handlers, auth, signIn, signOut } = NextAuth(config);

// Auth status check utilities
export const getSession = auth;

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session.user;
}
