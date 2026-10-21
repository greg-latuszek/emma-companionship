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

function aPool(rowsReturned: unknown[] = [storedRow]) {
  const clients: RecordedClient[] = [];
  const queriedOnPool: { statement: string; values?: unknown[] }[] = [];
  return {
    clients,
    queriedOnPool,
    async query(statement: string, values?: unknown[]) {
      queriedOnPool.push({ statement, values });
      return { rows: rowsReturned };
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
    expect(pool.queriedOnPool[0].statement).toContain('INSERT INTO companionship_relations');
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

  it('archiveActiveCompanionshipRelation archives an active row with today\'s date', async () => {
    const pool = aPool([{ id: 'relation-1' }]);
    const repository = new PgCompanionshipRelationRepository(pool);
    const today = new Date().toISOString().slice(0, 10);

    await repository.archiveActiveCompanionshipRelation('relation-1');

    expect(pool.queriedOnPool).toHaveLength(1);
    expect(pool.queriedOnPool[0].statement).toContain("status = 'active'");
    expect(pool.queriedOnPool[0].values).toEqual(['relation-1', today]);
  });

  it('archiveActiveCompanionshipRelation refuses a row that is not active', async () => {
    const pool = aPool([]);
    const repository = new PgCompanionshipRelationRepository(pool);

    await expect(repository.archiveActiveCompanionshipRelation('relation-1')).rejects.toThrow(
      'Failed to archive companionship relation'
    );
  });
});
