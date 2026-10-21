import { describe, expect, it } from 'vitest';

import { PgAtomicWork } from '@/adapters/db/pg/PgAtomicWork';
import { PgCompanionshipRelationRepository } from '@/adapters/db/pg/PgCompanionshipRelationRepository';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';

type RecordedClient = {
  statements: string[];
  released: boolean;
  query(statement: string): Promise<{ rows: unknown[] }>;
  release(): void;
};

const storedRow = {
  id: 'relation-1',
  companion_id: 'companion-1',
  accompanied_id: 'accompanied-1',
  status: 'proposed',
  start_date: null,
  end_date: null,
  notes: null,
};

function aClient(): RecordedClient {
  const client: RecordedClient = {
    statements: [],
    released: false,
    async query(statement: string) {
      client.statements.push(statement);
      return { rows: [storedRow] };
    },
    release() {
      client.released = true;
    },
  };
  return client;
}

function aPool() {
  const clients: RecordedClient[] = [];
  const queriedOnPool: string[] = [];
  return {
    clients,
    queriedOnPool,
    async query(statement: string) {
      queriedOnPool.push(statement);
      return { rows: [storedRow] };
    },
    async connect() {
      const client = aClient();
      clients.push(client);
      return client;
    },
  };
}

function aWrite(): CompanionshipRelationWriteWithDefaults {
  return {
    companion_id: 'companion-1',
    accompanied_id: 'accompanied-1',
    status: 'proposed',
    start_date: null,
    end_date: null,
    notes: null,
  } as CompanionshipRelationWriteWithDefaults;
}

const noActivationDetails = { start_date: null, notes: null };

describe('PgCompanionshipRelationRepository', () => {
  it('addCompanionshipRelation runs on the atomic block client when a block is open', async () => {
    const pool = aPool();
    const repository = new PgCompanionshipRelationRepository(pool);
    const atomicWork = new PgAtomicWork(pool);

    await atomicWork.runAsAtomic(() => repository.addCompanionshipRelation(aWrite()));

    expect(pool.queriedOnPool).toEqual([]);
    expect(pool.clients).toHaveLength(1);
    expect(pool.clients[0].statements).toHaveLength(3);
    expect(pool.clients[0].statements[1]).toContain('INSERT INTO companionship_relations');
  });

  it('addCompanionshipRelation runs on the pool when no block is open', async () => {
    const pool = aPool();
    const repository = new PgCompanionshipRelationRepository(pool);

    await repository.addCompanionshipRelation(aWrite());

    expect(pool.queriedOnPool).toHaveLength(1);
    expect(pool.queriedOnPool[0]).toContain('INSERT INTO companionship_relations');
    expect(pool.clients).toHaveLength(0);
  });

  it('activateProposedCompanionshipRelation reuses the open atomic block instead of starting another', async () => {
    const pool = aPool();
    const repository = new PgCompanionshipRelationRepository(pool);
    const atomicWork = new PgAtomicWork(pool);

    await atomicWork.runAsAtomic(() =>
      repository.activateProposedCompanionshipRelation('relation-1', noActivationDetails)
    );

    expect(pool.clients).toHaveLength(1);
    const begins = pool.clients[0].statements.filter((statement) => statement === 'BEGIN');
    expect(begins).toHaveLength(1);
    expect(pool.clients[0].statements.at(-1)).toBe('COMMIT');
  });

  it('activateProposedCompanionshipRelation commits its own transaction when no block is open', async () => {
    const pool = aPool();
    const repository = new PgCompanionshipRelationRepository(pool);

    await repository.activateProposedCompanionshipRelation('relation-1', noActivationDetails);

    expect(pool.clients).toHaveLength(1);
    expect(pool.clients[0].statements[0]).toBe('BEGIN');
    expect(pool.clients[0].statements.at(-1)).toBe('COMMIT');
    expect(pool.clients[0].released).toBe(true);
  });
});
