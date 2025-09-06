// Shared configuration and constants for Emma Companionship

// Environment configuration type
export interface AppConfig {
  NODE_ENV: 'development' | 'test' | 'production';
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

// Application constants
export const APP_CONSTANTS = {
  APP_NAME: 'Emma Companionship',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// API routes constants
export const API_ROUTES = {
  HEALTH: '/api/health',
  AUTH: '/api/auth',
} as const;

// Utility function to get type-safe environment variables
export function getConfig(): AppConfig {
  return {
    NODE_ENV: (process.env.NODE_ENV as AppConfig['NODE_ENV']) || 'development',
    DATABASE_URL: process.env.DATABASE_URL || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  };
}
