import { createHash, timingSafeEqual } from 'crypto';

import NextAuth, { DefaultSession, NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { getConfig } from '@emma/config';

import { prisma } from './prisma';

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

/**
 * Secure password hashing using SHA-256 with salt
 * In production, this should be replaced with bcrypt or argon2
 */
function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Timing-safe password comparison to prevent timing attacks
 */
function verifyPassword(plainPassword: string, hashedPassword: string, salt: string): boolean {
  const inputHash = Buffer.from(hashPassword(plainPassword, salt));
  const storedHash = Buffer.from(hashedPassword);
  
  if (inputHash.length !== storedHash.length) {
    return false;
  }
  
  return timingSafeEqual(inputHash, storedHash);
}

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
          const { email, password } = validatedCredentials;
          const config = getConfig();
          // TODO: just to escape from linter error on unused variable
          console.log(`config ${config ? 'exists' : 'not exists'}`);
          
          // Check if this is the admin user from environment variables
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
          const adminSalt = process.env.ADMIN_SALT || 'emma-companionship-salt';
          
          if (email === adminEmail && adminPasswordHash) {
            // Verify admin password using secure hash comparison
            if (verifyPassword(password, adminPasswordHash, adminSalt)) {
              // Find or create admin user
              let user = await prisma.user.findUnique({
                where: { email: adminEmail },
              });
              
              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email: adminEmail,
                    name: 'Administrator',
                    emailVerified: new Date(),
                  },
                });
              }
              
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              };
            }
          }
          
          // For regular users, check database with hashed passwords
          // This would be implemented when user registration is added
          const user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (user) {
            // TODO: Implement password verification for regular users
            // This requires adding password and salt fields to the User model
            console.warn('Regular user authentication not yet implemented');
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
      // TODO: just to escape from linter error on unused variable
      console.log(`JWT: account ${account ? 'exists' : 'not exists'}`);
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
      // TODO: just to escape from linter error on unused variable
      console.log(`account: ${account ? 'exists' : 'not exists'}`);
      console.log(`profile: ${profile ? 'exists' : 'not exists'}`);
      console.log(`isNewUser: ${isNewUser ? 'exists' : 'not exists'}`);
    },
    async signOut(params) {
      // Handle both session-based and token-based signOut
      const session = 'session' in params ? params.session : null;
      const token = 'token' in params ? params.token : null;
      
      console.log(`User ${(session as any)?.user?.email || 'unknown'} signed out`);
      // TODO: just to escape from linter error on unused variable
      console.log(`token: ${token ? 'exists' : 'not exists'}`);
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
