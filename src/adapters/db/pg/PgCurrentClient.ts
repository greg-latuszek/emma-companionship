import { getPool } from '@/infrastructure/db/pg';

import { currentAtomicClient, type AtomicClient } from './PgAtomicWork';

/**
 * Lets a repository run its statements on the open atomic block's client,
 * or on the pool when no block is open.
 */

export type SqlRunner = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(statement: string, values?: any[]): Promise<{ rows: any[] }>;
};

export type SqlPool = SqlRunner & {
  connect(): Promise<AtomicClient>;
};

export function currentSqlRunner(pool?: SqlPool): SqlRunner {
  return currentAtomicClient() ?? pool ?? getPool();
}

export async function runInOpenAtomicBlockOrOwnTransaction<T>(
  pool: SqlPool | undefined,
  work: (runner: SqlRunner) => Promise<T>
): Promise<T> {
  const openBlockClient = currentAtomicClient();
  if (openBlockClient) {
    return work(openBlockClient);
  }

  const client = await (pool ?? getPool()).connect();
  try {
    await client.query('BEGIN');
    try {
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    client.release();
  }
}
