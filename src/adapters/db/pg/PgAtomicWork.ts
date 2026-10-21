import { AsyncLocalStorage } from 'node:async_hooks';

import { getPool } from '@/infrastructure/db/pg';
import { AtomicBlockAlreadyOpen, type IAtomicWork } from '@/ports/repositories/IAtomicWork';

/**
 * Postgres adapter for IAtomicWork.
 * Repositories later read currentAtomicClient() so statements in the block
 * share this client. The port does not expose the client.
 */

export type AtomicClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(statement: string, values?: any[]): Promise<{ rows: any[] }>;
  release(): void;
};

type AtomicPool = {
  connect(): Promise<AtomicClient>;
};

const activeClient = new AsyncLocalStorage<AtomicClient>();

export function currentAtomicClient(): AtomicClient | undefined {
  return activeClient.getStore();
}

export class PgAtomicWork implements IAtomicWork {
  constructor(private readonly pool?: AtomicPool) {}

  async runAsAtomic<T>(work: () => Promise<T>): Promise<T> {
    if (activeClient.getStore()) {
      throw new AtomicBlockAlreadyOpen();
    }

    const pool = this.pool ?? getPool();
    const client = await pool.connect();
    try {
      return await activeClient.run(client, async () => {
        await client.query('BEGIN');
        try {
          const result = await work();
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      });
    } finally {
      client.release();
    }
  }
}
