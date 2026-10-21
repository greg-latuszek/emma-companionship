import { describe, expect, it } from 'vitest';

import { PgAtomicWork, currentAtomicClient } from '@/adapters/db/pg/PgAtomicWork';

type RecordedClient = {
  statements: string[];
  released: boolean;
  query(statement: string): Promise<{ rows: never[] }>;
  release(): void;
};

function aClient(): RecordedClient {
  const client: RecordedClient = {
    statements: [],
    released: false,
    async query(statement: string) {
      client.statements.push(statement);
      return { rows: [] };
    },
    release() {
      client.released = true;
    },
  };
  return client;
}

function aPool() {
  const clients: RecordedClient[] = [];
  return {
    clients,
    async connect() {
      const client = aClient();
      clients.push(client);
      return client;
    },
  };
}

describe('PgAtomicWork', () => {
  it('runAsAtomic commits and releases the client when the work succeeds', async () => {
    const pool = aPool();
    const atomicWork = new PgAtomicWork(pool);
    let clientDuringWork: ReturnType<typeof currentAtomicClient>;

    const result = await atomicWork.runAsAtomic(async () => {
      clientDuringWork = currentAtomicClient();
      return 'stored';
    });

    expect(result).toBe('stored');
    expect(clientDuringWork).toBe(pool.clients[0]);
    expect(pool.clients[0].statements).toEqual(['BEGIN', 'COMMIT']);
    expect(pool.clients[0].released).toBe(true);
    expect(currentAtomicClient()).toBeUndefined();
  });

  it('runAsAtomic rolls back and releases the client when the work throws', async () => {
    const pool = aPool();
    const atomicWork = new PgAtomicWork(pool);
    const failure = new Error('wife row failed');

    await expect(
      atomicWork.runAsAtomic(async () => {
        throw failure;
      })
    ).rejects.toBe(failure);

    expect(pool.clients).toHaveLength(1);
    expect(pool.clients[0].statements).toEqual(['BEGIN', 'ROLLBACK']);
    expect(pool.clients[0].released).toBe(true);
    expect(currentAtomicClient()).toBeUndefined();
  });

  it('runAsAtomic rolls back the outer block when the work opens a second atomic block', async () => {
    const pool = aPool();
    const atomicWork = new PgAtomicWork(pool);

    await expect(
      atomicWork.runAsAtomic(async () => {
        await atomicWork.runAsAtomic(async () => 'inner');
      })
    ).rejects.toThrow('An atomic block is already open');

    expect(pool.clients).toHaveLength(1);
    expect(pool.clients[0].statements).toEqual(['BEGIN', 'ROLLBACK']);
    expect(pool.clients[0].released).toBe(true);
    expect(currentAtomicClient()).toBeUndefined();
  });

  it('runAsAtomic gives overlapping calls different clients', async () => {
    const pool = aPool();
    const atomicWork = new PgAtomicWork(pool);
    let releaseBoth: () => void = () => {};
    const bothEntered = new Promise<void>((resolve) => {
      releaseBoth = resolve;
    });
    let entered = 0;

    async function enterAndWait(): Promise<ReturnType<typeof currentAtomicClient>> {
      entered += 1;
      if (entered === 2) {
        releaseBoth();
      }
      await bothEntered;
      return currentAtomicClient();
    }

    const [firstClient, secondClient] = await Promise.all([
      atomicWork.runAsAtomic(enterAndWait),
      atomicWork.runAsAtomic(enterAndWait),
    ]);

    expect(firstClient).toBe(pool.clients[0]);
    expect(secondClient).toBe(pool.clients[1]);
    expect(firstClient).not.toBe(secondClient);
    expect(pool.clients[0].statements).toEqual(['BEGIN', 'COMMIT']);
    expect(pool.clients[1].statements).toEqual(['BEGIN', 'COMMIT']);
    expect(currentAtomicClient()).toBeUndefined();
  });
});
