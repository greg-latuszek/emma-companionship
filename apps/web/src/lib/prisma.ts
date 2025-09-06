import { PrismaClient } from '@prisma/client';
import { getConfig } from '@emma/config';

// Global variable to store Prisma instance in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates and configures a Prisma client instance
 * In development, reuses the same instance to avoid connection issues
 * In production, creates a new instance for each request
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: getConfig().DATABASE_URL,
      },
    },
  });

// Store the Prisma instance globally in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Utility function to safely disconnect from the database
 * Useful for cleanup in serverless environments
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Health check function to verify database connectivity
 * Returns true if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get database metrics for monitoring
 * Returns basic database statistics
 */
export async function getDatabaseStats(): Promise<{
  membersCount: number;
  companionshipsCount: number;
  activeCompanionshipsCount: number;
}> {
  try {
    const [membersCount, companionshipsCount, activeCompanionshipsCount] = await Promise.all([
      prisma.member.count(),
      prisma.companionship.count(),
      prisma.companionship.count({
        where: { status: 'active' },
      }),
    ]);

    return {
      membersCount,
      companionshipsCount,
      activeCompanionshipsCount,
    };
  } catch (error) {
    console.error('Error fetching database stats:', error);
    throw error;
  }
}
