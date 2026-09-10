/**
 * Repository Provider
 * Dependency Injection for repository container
 * Selects adapter implementation at runtime via environment variable
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { PgRepositoryContainer } from '@/adapters/db/pg/PgRepositoryContainer';
// import { PrismaRepositoryContainer } from '@/adapters/db/prisma/PrismaRepositoryContainer'; // Added in COMMIT 4

const DB_ADAPTER = (process.env.DB_ADAPTER || 'pg').toLowerCase();

let container: IRepositoryContainer | null = null;

/**
 * Get the repository container for the configured adapter
 * Environment Variable: DB_ADAPTER
 *   - 'pg' (default): Use Pg adapter (pg library + raw SQL)
 *   - 'prisma': Use Prisma adapter (Prisma ORM)
 *
 * Can be set in .env:
 *   DB_ADAPTER=pg          # Use Pg
 *   DB_ADAPTER=prisma      # Use Prisma
 */
export function getRepositoryContainer(): IRepositoryContainer {
  if (container) {
    return container;
  }

  switch (DB_ADAPTER) {
    case 'prisma':
      // TODO: Implement Prisma adapter in COMMIT 4
      // container = new PrismaRepositoryContainer();
      throw new Error('Prisma adapter not yet implemented. Use DB_ADAPTER=pg or wait for COMMIT 4.');

    case 'pg':
    default:
      container = new PgRepositoryContainer();
      break;
  }

  if (!container) {
    throw new Error(`Unknown database adapter: ${DB_ADAPTER}`);
  }

  console.log(`[DI] Initialized repository container with adapter: ${DB_ADAPTER}`);

  return container;
}

/**
 * Reset container (useful for testing)
 */
export function resetRepositoryContainer(): void {
  container = null;
}
