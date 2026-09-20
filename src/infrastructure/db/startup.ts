import { initializePool } from '@/infrastructure/db/pg';

/**
 * Create the shared pg pool. Safe to call more than once.
 * The first query (Auth.js) is what actually opens a connection.
 */
export function startDatabasePool(): void {
  initializePool();
}
